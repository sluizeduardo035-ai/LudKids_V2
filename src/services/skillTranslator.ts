/**
 * POC 2 Produtora Kids — Enriquecimento Contextual PT -> EN
 * Converte e refina especificações em Português para System Prompts em Inglês otimizados para IA.
 */

export interface SkillTranslationPayload {
  name: string;
  description: string;
  obligations?: string[];
  coreProfile: string;
  inputContract: string;
  outputContract: string;
  apiKey?: string;
}

export interface EnrichedEnglishSkillContext {
  name: string;
  description: string;
  coreProfile: string;
  inputContract: string;
  outputContract: string;
  refinedSystemPrompt: string;
  generatedAt?: string;
  source?: string;
}

export async function translateAndEnrichSkillToEnglish(
  payload: SkillTranslationPayload
): Promise<EnrichedEnglishSkillContext> {
  const res = await fetch('/api/gemini/enrich-skill', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(payload.apiKey ? { 'x-gemini-api-key': payload.apiKey } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: Falha ao enriquecer skill para inglês`);
  }

  const json = await res.json();
  return json.data;
}
