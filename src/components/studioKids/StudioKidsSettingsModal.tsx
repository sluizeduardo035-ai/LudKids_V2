import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Sliders,
  ShieldCheck,
  Activity,
  Layers,
  Key,
  Eye,
  EyeOff,
  Trash2,
  StopCircle,
  Clock,
  Check,
  AlertCircle,
  Radio,
} from 'lucide-react';
import { SuggestedGeminiModel } from '../../pipeline/studioKids/types';
import {
  executeGovernedGeminiDiagnosis,
  ConnectionStage,
  ConnectionProgress,
  ConnectionDiagnosticResult,
  INITIAL_STAGES,
} from '../../pipeline/studioKids/geminiConnectionManager';
import {
  safeLocalStorageSet,
  safeLocalStorageGet,
  safeLocalStorageRemove,
} from '../../utils/safeStorage';
import { POC2_STORAGE_KEYS } from '../../pipeline/studioKids/poc2StorageKeys';

export const GEMINI_API_KEY_STORAGE = POC2_STORAGE_KEYS.GEMINI_API_KEY;

interface StudioKidsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDefaultModel: SuggestedGeminiModel;
  onSaveSettings: (settings: {
    defaultModel: SuggestedGeminiModel;
    thinkingLevel: 'HIGH' | 'MEDIUM';
    apiKey?: string;
  }) => void;
  onResetToCleanSlate?: () => void;
  onLoadDemoTemplate?: () => void;
}

export interface ModelOption {
  id: SuggestedGeminiModel;
  name: string;
  thinkingLevel: 'HIGH' | 'MEDIUM';
  badge: string;
  description: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    thinkingLevel: 'HIGH',
    badge: 'PADRÃO DO FRONT END',
    description: 'Raciocínio profundo com Thinking Level HIGH. Modelo principal para auditorias, contratos e handoff Manus.',
  },
  {
    id: 'gemini-4-argon',
    name: 'Argon 4',
    thinkingLevel: 'MEDIUM',
    badge: 'ALTA PERFORMANCE',
    description: 'Modelo de raciocínio equilibrado para geração multimodal e decupagem ágil.',
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    thinkingLevel: 'MEDIUM',
    badge: 'VELOCIDADE & COTA',
    description: 'Execuções ágeis com alta cota diária, perfeito para verificações preliminares de intake.',
  },
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    thinkingLevel: 'HIGH',
    badge: 'THINKING HIGH ÁGIL',
    description: 'Combina velocidade do Flash com profundidade analítica de Thinking Level HIGH.',
  },
];

export const StudioKidsSettingsModal: React.FC<StudioKidsSettingsModalProps> = ({
  isOpen,
  onClose,
  selectedDefaultModel,
  onSaveSettings,
  onResetToCleanSlate,
  onLoadDemoTemplate,
}) => {
  const [currentModel, setCurrentModel] = useState<SuggestedGeminiModel>(selectedDefaultModel);
  const [apiKeyInput, setApiKeyInput] = useState<string>(() => {
    return safeLocalStorageGet(GEMINI_API_KEY_STORAGE) || '';
  });
  const [showApiKey, setShowApiKey] = useState(false);

  // Connection Governance State
  const [isValidating, setIsValidating] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [currentStageLabel, setCurrentStageLabel] = useState<string>('Pronto para iniciar validação');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [stages, setStages] = useState<ConnectionStage[]>(INITIAL_STAGES);
  const [diagnosticResult, setDiagnosticResult] = useState<ConnectionDiagnosticResult | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start governed validation with timeout and live stage reporting
  const handleStartValidation = async (keyOverride?: string) => {
    // Cancel any active verification
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const keyToTest = typeof keyOverride === 'string' ? keyOverride : apiKeyInput;

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsValidating(true);
    setProgressPct(5);
    setCurrentStageLabel(keyToTest.trim() ? 'Iniciando validação da chave personalizada...' : 'Consultando chave configurada no servidor...');
    setElapsedSeconds(0);
    setStages(INITIAL_STAGES.map((s) => ({ ...s, status: 'IDLE' })));
    setDiagnosticResult(null);

    // Elapsed timer (increments every 100ms)
    const startedAt = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.round((Date.now() - startedAt) / 100) / 10);
    }, 100);

    try {
      const result = await executeGovernedGeminiDiagnosis({
        apiKey: keyToTest,
        timeoutMs: 8000,
        signal: abortController.signal,
        onProgress: (prog: ConnectionProgress) => {
          setProgressPct(prog.pct);
          setCurrentStageLabel(prog.currentStageLabel);
          setStages(prog.stages);
        },
      });

      setDiagnosticResult(result);
      setStages(result.stages);
      setProgressPct(result.connected ? 100 : Math.max(progressPct, 40));
    } catch (err: any) {
      setDiagnosticResult({
        status: 'ERROR',
        connected: false,
        hasApiKey: true,
        latencyMs: Math.round(Date.now() - startedAt),
        statusMessage: err?.message || 'Falha inesperada durante a validação.',
        stages: stages.map((s) => (s.status === 'RUNNING' ? { ...s, status: 'FAIL' } : s)),
        timestampIso: new Date().toISOString(),
      });
    } finally {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsValidating(false);
      abortControllerRef.current = null;
    }
  };

  // Immediate abort by the operator
  const handleAbortValidation = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsValidating(false);
    setProgressPct(0);
    setCurrentStageLabel('Validação interrompida pelo operador.');
    setDiagnosticResult({
      status: 'ABORTED',
      connected: false,
      hasApiKey: true,
      latencyMs: 0,
      statusMessage: 'Operação cancelada pelo usuário. O gateway não continuará a requisição.',
      stages: stages.map((s) => (s.status === 'RUNNING' ? { ...s, status: 'IDLE' } : s)),
      timestampIso: new Date().toISOString(),
    });
  };

  useEffect(() => {
    if (isOpen) {
      const stored = safeLocalStorageGet(GEMINI_API_KEY_STORAGE) || '';
      setApiKeyInput(stored);
      setCurrentModel(selectedDefaultModel);

      // Trigger automatic diagnostic on open to check stored key or server environment key
      handleStartValidation(stored);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const activeModelOption = AVAILABLE_MODELS.find((m) => m.id === currentModel) || AVAILABLE_MODELS[0];

  const handleSave = () => {
    const trimmedKey = apiKeyInput.trim();
    if (trimmedKey) {
      safeLocalStorageSet(GEMINI_API_KEY_STORAGE, trimmedKey);
    } else {
      safeLocalStorageRemove(GEMINI_API_KEY_STORAGE);
    }
    onSaveSettings({
      defaultModel: currentModel,
      thinkingLevel: activeModelOption.thinkingLevel,
      apiKey: trimmedKey,
    });
    onClose();
  };

  const handleClearApiKey = () => {
    if (isValidating) handleAbortValidation();
    setApiKeyInput('');
    safeLocalStorageRemove(GEMINI_API_KEY_STORAGE);
    setDiagnosticResult({
      status: 'NOT_CONFIGURED',
      connected: false,
      hasApiKey: false,
      latencyMs: 0,
      statusMessage: 'Chave customizada removida. Insira uma nova chave para restabelecer a conexão.',
      stages: INITIAL_STAGES,
      timestampIso: new Date().toISOString(),
    });
    setStages(INITIAL_STAGES);
    setProgressPct(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 my-8 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  Gerenciador de Conexão & Parâmetros Gemini (Poc 2)
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 uppercase font-bold">
                  Governança & RTT
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Controle de timeout, rastreamento de estágios, diagnóstico de RTT e seleção de modelos para o pipeline.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (isValidating) handleAbortValidation();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto py-4 space-y-5 pr-1 flex-1 custom-scrollbar">
          {/* Seção 1: Campo de Autenticação com Gerenciamento e Interrupção */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Autenticação Gemini API (Chave de Acesso)
                </span>
              </div>
              {apiKeyInput && !isValidating && (
                <button
                  type="button"
                  onClick={handleClearApiKey}
                  className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition cursor-pointer"
                  title="Limpar chave customizada"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Limpar Chave</span>
                </button>
              )}
            </div>

            <p className="text-xs text-slate-400">
              Insira a chave da API do Google Gemini (inicia com <code className="text-cyan-300 font-mono">AIza</code>). A validação possui timeout estrito de 8.0s e pode ser interrompida a qualquer momento:
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  disabled={isValidating}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Cole sua API Key do Gemini (ex: AIzaSy...)"
                  className="w-full px-3 py-2 pr-10 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  title={showApiKey ? 'Ocultar chave' : 'Mostrar chave'}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Botão Dinâmico: Validar Conexão OU Interromper */}
              {!isValidating ? (
                <button
                  type="button"
                  onClick={() => handleStartValidation()}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-cyan-950/40 shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Validar Conexão</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAbortValidation}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-rose-950/40 shrink-0 animate-pulse"
                  title="Interromper validação imediatamente"
                >
                  <StopCircle className="w-4 h-4" />
                  <span>Interromper ({elapsedSeconds.toFixed(1)}s)</span>
                </button>
              )}
            </div>

            {/* Barra de Progresso e Timer em Tempo Real */}
            {isValidating && (
              <div className="p-3 rounded-lg bg-slate-900 border border-cyan-800/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{currentStageLabel}</span>
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {progressPct}% • {elapsedSeconds.toFixed(1)}s / 8.0s
                  </span>
                </div>

                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Seção 2: Checklist dos 4 Estágios do Gerenciador de Conexão */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Auditoria de Conectividade em 4 Estágios
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Timeout Máximo: 8.0s
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {stages.map((stage) => {
                const isPass = stage.status === 'PASS';
                const isFail = stage.status === 'FAIL';
                const isRunning = stage.status === 'RUNNING';

                return (
                  <div
                    key={stage.id}
                    className={`p-3 rounded-lg border text-xs transition-all ${
                      isPass
                        ? 'bg-emerald-950/30 border-emerald-600/50 text-emerald-200'
                        : isFail
                        ? 'bg-rose-950/30 border-rose-600/50 text-rose-200'
                        : isRunning
                        ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-200 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold mb-1">
                      <span className="flex items-center gap-1.5">
                        {isPass ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : isFail ? (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        ) : isRunning ? (
                          <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />
                        )}
                        <span>{stage.label}</span>
                      </span>

                      {stage.durationMs !== undefined && (
                        <span className="font-mono text-[10px] text-slate-400">
                          {stage.durationMs}ms
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed pl-5">
                      {stage.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Banner de Resultado e Mensagem de Diagnóstico */}
            {diagnosticResult && (
              <div
                className={`p-3.5 rounded-xl border space-y-1.5 mt-2 ${
                  diagnosticResult.status === 'CONNECTED'
                    ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                    : diagnosticResult.status === 'ABORTED'
                    ? 'bg-slate-900 border-slate-700 text-slate-300'
                    : diagnosticResult.status === 'TIMEOUT'
                    ? 'bg-amber-950/50 border-amber-500/50 text-amber-200'
                    : diagnosticResult.status === 'NOT_CONFIGURED'
                    ? 'bg-slate-900/80 border-slate-800 text-slate-300'
                    : 'bg-rose-950/50 border-rose-500/50 text-rose-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5">
                    {diagnosticResult.status === 'CONNECTED' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>PIPELINE AUTORIZADO • CONEXÃO ESTÁVEL (RTT: {diagnosticResult.latencyMs}ms)</span>
                      </>
                    ) : diagnosticResult.status === 'ABORTED' ? (
                      <>
                        <StopCircle className="w-4 h-4 text-slate-400" />
                        <span>VALIDAÇÃO INTERROMPIDA PELO OPERADOR</span>
                      </>
                    ) : diagnosticResult.status === 'TIMEOUT' ? (
                      <>
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>TEMPO LIMITE EXCEDIDO (TIMEOUT 8.0s)</span>
                      </>
                    ) : diagnosticResult.status === 'NOT_CONFIGURED' ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span>MODO DETERMINÍSTICO • AGUARDANDO CHAVE DE INFERÊNCIA</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>FALHA NA CONEXÃO OU AUTENTICAÇÃO COM O GATEWAY</span>
                      </>
                    )}
                  </span>

                  {diagnosticResult.maskedKey && (
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-950/70 px-2 py-0.5 rounded border border-slate-800">
                      Chave: {diagnosticResult.maskedKey}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pt-0.5">
                  {diagnosticResult.statusMessage}
                </p>
              </div>
            )}
          </div>

          {/* Seção 3: Seleção do Modelo Padrão do Front End */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Modelo IA Padrão do Front End
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/50">
                Thinking: {activeModelOption.thinkingLevel}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Selecione o modelo Gemini padrão utilizado nas requisições da bancada Poc 2:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {AVAILABLE_MODELS.map((model) => {
                const isSelected = currentModel === model.id;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => setCurrentModel(model.id)}
                    className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-400 ring-1 ring-indigo-500/50 text-white'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-100">{model.name}</span>
                        {model.id === 'gemini-3.1-pro-preview' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            PADRÃO
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
                        thinking_level="{model.thinkingLevel}"
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {model.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seção 4: Gestão do Ambiente & Isolamento de Dados */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Ambiente Exclusivo POC 2 & Estado dos Dados
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/50">
                Namespace: poc2_produtora_*
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Este ambiente é 100% isolado de outras POCs e versões anteriores. Você pode alternar entre uma <strong>base limpa</strong> (zero fases e zero skills para cadastro individual) ou carregar a demonstração canônica como referência.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {onResetToCleanSlate && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Atenção: Deseja zerar o ambiente para Base Limpa (remover todas as skills e fases cadastradas)?')) {
                      onResetToCleanSlate();
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Zerar Ambiente (Base Limpa)</span>
                </button>
              )}

              {onLoadDemoTemplate && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Carregar template canônico de demonstração (5 Gates e 21 Skills)? Suas skills atuais serão mescladas.')) {
                      onLoadDemoTemplate();
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/60 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Carregar Template Canônico (Demonstração)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400">
            Modelo selecionado: <strong className="text-indigo-300">{activeModelOption.name}</strong> (thinking_level="{activeModelOption.thinkingLevel}")
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                if (isValidating) handleAbortValidation();
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar Parâmetros</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
