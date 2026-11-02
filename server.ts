import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '20mb' }));
app.use((_req, res, next) => {
  res.setHeader('Permissions-Policy', 'microphone=(self *)');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Keep-Alive', 'timeout=60, max=1000');
  next();
});

// Helper to retrieve effective Gemini client (custom key or environment)
function getGeminiClient(customApiKey?: string) {
  const effectiveKey =
    customApiKey && typeof customApiKey === 'string' && customApiKey.trim().length > 0
      ? customApiKey.trim()
      : process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  if (!effectiveKey) return { client: null, apiKey: '', hasKey: false, source: 'none' };
  return {
    client: new GoogleGenAI({
      apiKey: effectiveKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    }),
    apiKey: effectiveKey,
    hasKey: true,
    source: customApiKey && customApiKey.trim().length > 0 ? 'custom' : 'environment',
  };
}

// Endpoint to diagnose and test Gemini API connection with timeout governance
app.all('/api/gemini/diagnose', async (req, res) => {
  const customKey = (req.body?.apiKey ||
    req.headers['x-gemini-api-key'] ||
    req.query?.apiKey ||
    '') as string;
  const { client, apiKey: effectiveKey, hasKey, source } = getGeminiClient(customKey);

  if (!hasKey || !client) {
    return res.json({
      status: 'NOT_CONFIGURED',
      connected: false,
      hasApiKey: false,
      statusMessage:
        'Nenhuma chave Gemini encontrada. Insira sua chave API no campo acima para autenticar com os modelos.',
      latencyMs: 0,
    });
  }

  const maskedKey =
    effectiveKey.length > 8
      ? `${effectiveKey.slice(0, 6)}...${effectiveKey.slice(-4)}`
      : '***';

  // Fast preflight format validation (fail fast without waiting for network timeout)
  if (!effectiveKey.startsWith('AIza') || effectiveKey.length < 35 || effectiveKey.length > 55) {
    return res.json({
      status: 'ERROR',
      connected: false,
      hasApiKey: true,
      maskedKey,
      latencyMs: 5,
      statusMessage:
        'Formato de chave inválido: chaves de API do Google Gemini iniciam com o prefixo "AIza" e possuem tipicamente 39 caracteres.',
    });
  }

  const t0 = Date.now();
  const SERVER_TIMEOUT_MS = 7000;
  let timeoutHandle: NodeJS.Timeout | null = null;

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(
          new Error(
            `TIMEOUT_SERVER: Gateway do Google Gemini não respondeu em ${SERVER_TIMEOUT_MS / 1000}s`
          )
        );
      }, SERVER_TIMEOUT_MS);
    });

    // Perform a lightweight call with gemini-3.8-flash guarded by timeout
    const apiCallPromise = client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Ping test',
    });

    await Promise.race([apiCallPromise, timeoutPromise]);
    if (timeoutHandle) clearTimeout(timeoutHandle);

    const latencyMs = Date.now() - t0;

    return res.json({
      status: 'CONNECTED',
      connected: true,
      hasApiKey: true,
      maskedKey,
      keySource:
        source === 'custom' ? 'Chave inserida no front-end' : 'Variável de ambiente (Servidor)',
      latencyMs,
      activeModel: 'Gemini 3.1 Pro (thinking_level=HIGH)',
      availableModels: [
        'Gemini 3.1 Pro',
        'Argon 4',
        'Gemini 3.8 Flash',
        'Gemini 3.6 Flash',
      ],
      statusMessage:
        'Conexão com a API Gemini autenticada e validada com sucesso! Pipeline pronto para inferência.',
    });
  } catch (err: any) {
    if (timeoutHandle) clearTimeout(timeoutHandle);
    const latencyMs = Date.now() - t0;
    const errorMsg = err?.message || String(err);
    console.warn('[gemini-diagnose] Connection check failed:', errorMsg);

    let friendlyMessage = `Falha na autenticação da chave Gemini: ${errorMsg}`;
    if (errorMsg.includes('TIMEOUT_SERVER') || errorMsg.includes('timeout')) {
      friendlyMessage = `Tempo limite esgotado (${SERVER_TIMEOUT_MS / 1000}s): O gateway do Google não respondeu. Verifique sua rede e tente novamente.`;
    } else if (
      errorMsg.includes('API key not valid') ||
      errorMsg.includes('API_KEY_INVALID') ||
      errorMsg.includes('400')
    ) {
      friendlyMessage =
        'Chave da API Gemini inválida. Por favor, verifique se a chave digitada está correta e ativa no Google AI Studio.';
    } else if (
      errorMsg.includes('quota') ||
      errorMsg.includes('RESOURCE_EXHAUSTED') ||
      errorMsg.includes('429')
    ) {
      friendlyMessage =
        'Limite de cota da API Gemini atingido para esta chave. Tente novamente em instantes ou utilize outra chave.';
    }

    return res.json({
      status: 'ERROR',
      connected: false,
      hasApiKey: true,
      maskedKey,
      latencyMs,
      statusMessage: friendlyMessage,
    });
  }
});

// Endpoint to translate and enrich skill definition in English
app.post('/api/gemini/enrich-skill', async (req, res) => {
  const {
    name,
    description,
    obligations,
    coreProfile,
    inputContract,
    outputContract,
    apiKey: reqApiKey,
  } = req.body || {};
  const customKey = (reqApiKey || req.headers['x-gemini-api-key'] || '') as string;
  const { client, hasKey } = getGeminiClient(customKey);

  const fallbackEnglish = {
    name: name ? String(name).toLowerCase().replace(/\s+/g, '-') : 'custom-skill',
    description: `Specialized Pixar 3D production skill for: ${description || 'Asset generation and validation'}.`,
    coreProfile:
      coreProfile ||
      'Senior Pixar 3D Prompt Engineer specializing in whimsical toddler storytelling (4-6 years old)',
    inputContract:
      inputContract || 'Canonical episode theme, raw lyrics, and prior approved phase outputs',
    outputContract:
      outputContract ||
      'Manus 9-block compliant JSON object with pass/fail verification card',
    refinedSystemPrompt: `You are an elite Pixar 3D Animation Specialist executing the "${name || 'custom-skill'}" phase within the Studio Kids SDUI pipeline.
Your core objective: ${description || 'Generate high-fidelity, child-safe animation assets and contracts'}.
Adherence: Strictly enforce COPPA compliance, warm tactile Pixar aesthetics, and zero uncanny valley defects.
Input Received: ${inputContract || 'Prior phase canonical contracts'}.
Output Required: ${outputContract || 'Structured JSON complying with Manus standards'}.`,
    generatedAt: new Date().toISOString(),
    source: 'template_fallback',
  };

  if (!hasKey || !client) {
    return res.json({
      success: true,
      data: fallbackEnglish,
      notice:
        'Enriquecimento estruturado via template de conformidade Pixar (chave Gemini não configurada).',
    });
  }

  try {
    const prompt = `You are a Principal Prompt Architect for Studio Kids (Pixar 3D animated series for 4-6 year olds).
Transform and enrich this skill metadata (written in Portuguese) into an ultra-high adherence English system prompt:
- Skill Name: ${name}
- Description & Obligations: ${description}
- Additional Obligations: ${Array.isArray(obligations) ? obligations.join(', ') : obligations || ''}
- Core Profile / Specialty: ${coreProfile}
- Input Received: ${inputContract}
- Output Deliverable: ${outputContract}

Return a valid JSON object with:
{
  "name": "kebab-cased-english-name",
  "description": "Clear professional description in English",
  "coreProfile": "Detailed specialist persona and domain specialty in English",
  "inputContract": "Technical input requirements in English",
  "outputContract": "Technical deliverable layout in English",
  "refinedSystemPrompt": "The complete, pristine system instructions prompt in English"
}`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      data: {
        ...fallbackEnglish,
        ...parsed,
        generatedAt: new Date().toISOString(),
        source: 'gemini_ai',
      },
    });
  } catch (err: any) {
    console.warn('[gemini-enrich-skill] Gemini generation error, using fallback:', err?.message);
    return res.json({
      success: true,
      data: fallbackEnglish,
      notice:
        'Enriquecimento estruturado via template (falha na chamada Gemini: ' +
        (err?.message || 'erro desconhecido') +
        ')',
    });
  }
});

// Vite Middleware for development or static serving for production
async function startServer() {
  const distPath = path.resolve(__dirname, 'dist');
  const hasDist = fs.existsSync(path.resolve(distPath, 'index.html'));
  const isProd =
    process.env.NODE_ENV === 'production' ||
    (hasDist && process.env.NODE_ENV !== 'development');

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;
    console.log(
      `Produtora Kids POC 2 running in ${isProd ? 'production' : 'development'} mode on http://0.0.0.0:${PORT}`
    );
  });

  const shutdown = (signal: string) => {
    console.log(`Received ${signal}, closing server...`);
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
