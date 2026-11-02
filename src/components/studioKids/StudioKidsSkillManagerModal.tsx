import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Layers,
  Globe,
  Radio,
  FileCode,
  Copy,
  Check,
  Loader2,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import {
  StudioKidsSkillMeta,
  SuggestedGeminiModel,
  ReasoningMode,
} from '../../pipeline/studioKids/types';
import { AVAILABLE_MODELS, GEMINI_API_KEY_STORAGE } from './StudioKidsSettingsModal';
import { safeLocalStorageGet } from '../../utils/safeStorage';

interface StudioKidsSkillManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillsCatalog: StudioKidsSkillMeta[];
  initialSkillId?: string;
  onSaveSkill: (updatedSkill: StudioKidsSkillMeta) => void;
  onCreateSkill: (newSkill: StudioKidsSkillMeta) => void;
}

export const StudioKidsSkillManagerModal: React.FC<StudioKidsSkillManagerModalProps> = ({
  isOpen,
  onClose,
  skillsCatalog,
  initialSkillId,
  onSaveSkill,
  onCreateSkill,
}) => {
  // Navigation index among registered skills
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  // Form Fields (Totalmente desacoplados de qualquer Gate ou Fase)
  const [name, setName] = useState('');
  const [suggestedModel, setSuggestedModel] = useState<SuggestedGeminiModel>('gemini-3.1-pro-preview');
  const [reasoningMode, setReasoningMode] = useState<ReasoningMode>('HIGH');
  const [description, setDescription] = useState('');
  const [coreProfile, setCoreProfile] = useState('');
  const [inputContract, setInputContract] = useState('');
  const [outputContract, setOutputContract] = useState('');
  const [telemetryEnabled, setTelemetryEnabled] = useState(false);
  const [isInactive, setIsInactive] = useState(false);

  // English Context & Preview
  const [englishContext, setEnglishContext] = useState<{
    name: string;
    description: string;
    coreProfile: string;
    inputContract: string;
    outputContract: string;
    refinedSystemPrompt: string;
  } | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Helper function to format kebab-case
  const toKebabCase = (str: string) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');
  };

  // Sync form when navigation index or catalog changes
  useEffect(() => {
    if (!isOpen) return;

    if (skillsCatalog.length === 0) {
      handleStartCreateNew();
      return;
    }

    if (!isCreatingNew) {
      if (initialSkillId) {
        const idx = skillsCatalog.findIndex((s) => s.id === initialSkillId);
        if (idx !== -1) {
          setCurrentIndex(idx);
        }
      }
    }
  }, [isOpen, initialSkillId, skillsCatalog.length]);

  useEffect(() => {
    if (isCreatingNew || skillsCatalog.length === 0) return;

    const currentSkill = skillsCatalog[currentIndex] || skillsCatalog[0];
    if (currentSkill) {
      setName(currentSkill.kebabName || toKebabCase(currentSkill.name));
      setSuggestedModel((currentSkill.suggestedModel as SuggestedGeminiModel) || 'gemini-3.1-pro-preview');
      setReasoningMode(currentSkill.reasoningMode || 'HIGH');
      setDescription(currentSkill.description || '');
      setCoreProfile(currentSkill.coreProfile || currentSkill.badge || '');
      setInputContract(currentSkill.inputContract || '');
      setOutputContract(currentSkill.outputContract || '');
      setTelemetryEnabled(currentSkill.telemetryEnabled || false);
      setIsInactive(currentSkill.isInactive || false);
      setEnglishContext(currentSkill.englishContext || null);
      setFormError(null);
      setSaveSuccessMsg(null);
    }
  }, [currentIndex, isCreatingNew, skillsCatalog]);

  if (!isOpen) return null;

  const currentSkill = skillsCatalog[currentIndex];

  const handleStartCreateNew = () => {
    setIsCreatingNew(true);
    setName('');
    setSuggestedModel('gemini-3.1-pro-preview');
    setReasoningMode('HIGH');
    setDescription('');
    setCoreProfile('Specialist Agent for 3D Pixar Kids Video Generation');
    setInputContract('Validated canonical payload & predecessor contracts');
    setOutputContract('Structured JSON deliverable conforming to contract');
    setTelemetryEnabled(false);
    setIsInactive(false);
    setEnglishContext(null);
    setFormError(null);
    setSaveSuccessMsg(null);
  };

  const handleCancelCreateNew = () => {
    setIsCreatingNew(false);
  };

  const handlePrevSkill = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsCreatingNew(false);
    }
  };

  const handleNextSkill = () => {
    if (currentIndex < skillsCatalog.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsCreatingNew(false);
    }
  };

  // Call backend to enrich and translate to English
  const handleEnrichToEnglish = async () => {
    if (!description.trim()) {
      setFormError('Preencha a "Descrição e Obrigações" antes de gerar o perfil em inglês.');
      return;
    }
    setIsEnriching(true);
    setFormError(null);

    const activeModelMeta = AVAILABLE_MODELS.find((m) => m.id === suggestedModel);
    const suggestedModelLabel = activeModelMeta ? activeModelMeta.name : 'Gemini 3.1 Pro';

    const storedApiKey = safeLocalStorageGet(GEMINI_API_KEY_STORAGE) || '';

    try {
      const res = await fetch('/api/gemini/enrich-skill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': storedApiKey,
        },
        body: JSON.stringify({
          name: name.trim() || 'kids-video-skill',
          description: description.trim(),
          coreProfile: coreProfile.trim(),
          inputContract: inputContract.trim(),
          outputContract: outputContract.trim(),
          suggestedModel: suggestedModelLabel,
          reasoningMode,
          apiKey: storedApiKey,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        setEnglishContext({
          name: data.name || data.englishName || toKebabCase(name),
          description: data.description || data.englishDescription,
          coreProfile: data.coreProfile || data.englishCoreProfile,
          inputContract: data.inputContract || data.englishInputContract,
          outputContract: data.outputContract || data.englishOutputContract,
          refinedSystemPrompt: data.refinedSystemPrompt,
        });
      } else {
        throw new Error('Falha no endpoint /api/gemini/enrich-skill');
      }
    } catch {
      // Deterministic client-side fallback
      const cleanSlug = toKebabCase(name) || 'kids-video-skill';
      setEnglishContext({
        name: cleanSlug,
        description: `[ENGLISH]: ${description.trim()}`,
        coreProfile: coreProfile.trim() || 'Senior AI Specialist for Pixar-Style 3D Kids Educational Video Generation',
        inputContract: inputContract.trim() || 'Validated canonical episode payload and prerequisite contracts',
        outputContract: outputContract.trim() || 'Pure JSON deliverable complying with pipeline specification',
        refinedSystemPrompt: `### ROLE & CORE PROFILE
You are the "${cleanSlug}" agent: ${coreProfile || 'Pixar-Grade Kids Animation Specialist'}.
Operating Mode: ${reasoningMode} reasoning. Model Tier: ${suggestedModelLabel}.

### STAGE OBLIGATIONS & DELIVERABLES
${description.trim()}

### INPUT CONTRACT
${inputContract.trim() || 'Canonical episode state & prior stage contracts.'}

### OUTPUT CONTRACT
${outputContract.trim() || 'Validated JSON structure with zero schema drift.'}`,
      });
    } finally {
      setIsEnriching(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setFormError('A Descrição e lista de obrigações (o que precisa ser feito nessa fase) é obrigatória.');
      return;
    }

    const cleanKebab = toKebabCase(name) || (isCreatingNew ? `skill-${Date.now()}` : (currentSkill?.kebabName || currentSkill?.code || `skill-${Date.now()}`));
    const activeModelMeta = AVAILABLE_MODELS.find((m) => m.id === suggestedModel);
    const modelThinking = activeModelMeta ? activeModelMeta.thinkingLevel : 'HIGH';

    // Ensure English context is present, generate if missing
    let finalEnglish = englishContext;
    if (!finalEnglish) {
      finalEnglish = {
        name: cleanKebab,
        description: `[ENGLISH TRANSLATION]: ${description.trim()}`,
        coreProfile: coreProfile.trim() || 'Senior AI Specialist for Pixar-Style 3D Kids Educational Video Generation',
        inputContract: inputContract.trim() || 'Validated canonical input payload',
        outputContract: outputContract.trim() || 'Structured JSON deliverable',
        refinedSystemPrompt: `You are the ${cleanKebab} agent. Operating mode: ${reasoningMode}.\nObligations:\n${description.trim()}\nInput: ${inputContract.trim()}\nOutput: ${outputContract.trim()}`,
      };
    }

    if (isCreatingNew) {
      const newSkillId = `CUSTOM_${cleanKebab.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_${Date.now()}`;
      const newSkill: StudioKidsSkillMeta = {
        id: newSkillId,
        code: cleanKebab,
        name: cleanKebab,
        badge: activeModelMeta?.name || 'Gemini 3.1 Pro',
        description: description.trim(),
        inputContract: inputContract.trim() || 'Dados canônicos da esteira',
        outputContract: outputContract.trim() || 'JSON homologado',
        parentalGoal: 'Capacidade técnica independente para composição de fases na esteira.',
        isCustom: true,
        kebabName: cleanKebab,
        suggestedModel,
        thinkingLevel: modelThinking,
        reasoningMode,
        coreProfile: coreProfile.trim(),
        telemetryEnabled,
        isInactive,
        englishContext: finalEnglish,
      };

      try {
        onCreateSkill(newSkill);
        setIsCreatingNew(false);
        setSaveSuccessMsg(`Skill "${cleanKebab}" criada com sucesso!`);
      } catch (saveErr) {
        console.error('[SkillManager] Failed to create skill:', saveErr);
        setFormError('Não foi possível salvar a skill localmente. Verifique o espaço de armazenamento.');
        return;
      }
    } else {
      const updatedSkill: StudioKidsSkillMeta = {
        ...currentSkill,
        name: cleanKebab,
        kebabName: cleanKebab,
        suggestedModel,
        thinkingLevel: modelThinking,
        badge: activeModelMeta?.name || currentSkill.badge,
        reasoningMode,
        description: description.trim(),
        coreProfile: coreProfile.trim(),
        inputContract: inputContract.trim(),
        outputContract: outputContract.trim(),
        telemetryEnabled,
        isInactive,
        englishContext: finalEnglish,
      };

      try {
        onSaveSkill(updatedSkill);
        setSaveSuccessMsg(`Alterações da Skill "${cleanKebab}" salvas com sucesso!`);
      } catch (saveErr) {
        console.error('[SkillManager] Failed to update skill:', saveErr);
        setFormError('Não foi possível salvar as alterações da skill localmente.');
        return;
      }
    }

    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleCopyPrompt = () => {
    if (!englishContext?.refinedSystemPrompt) return;
    navigator.clipboard.writeText(englishContext.refinedSystemPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 my-6 flex flex-col max-h-[92vh]">
        {/* Header with Carousel Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  {isCreatingNew ? 'Cadastrar Nova Skill no Pipeline' : 'Manutenção & Gestão de Skills'}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30 font-bold uppercase">
                  Poc 2 SDUI
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Edite ou crie skills em Português com conversão e prévia refinada em Inglês para IA.
              </p>
            </div>
          </div>

          {/* Carousel Navigator Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {!isCreatingNew ? (
              <>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                  <button
                    type="button"
                    disabled={currentIndex === 0}
                    onClick={handlePrevSkill}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                    title="Skill anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2.5 text-xs font-mono font-semibold text-slate-300">
                    {currentIndex + 1} de {skillsCatalog.length}
                  </span>
                  <button
                    type="button"
                    disabled={currentIndex === skillsCatalog.length - 1}
                    onClick={handleNextSkill}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                    title="Próxima skill"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleStartCreateNew}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Nova Skill</span>
                </button>
              </>
            ) : skillsCatalog.length > 0 ? (
              <button
                type="button"
                onClick={handleCancelCreateNew}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              >
                Voltar à Navegação
              </button>
            ) : (
              <span className="px-2.5 py-1 text-[11px] font-mono text-emerald-300 bg-emerald-950/80 border border-emerald-800/60 rounded">
                Primeira Skill do Catálogo
              </span>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="overflow-y-auto py-4 space-y-4 pr-1 flex-1 custom-scrollbar">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-600/50 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{formError}</span>
            </div>
          )}

          {saveSuccessMsg && (
            <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-600/50 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Linha 1: Nome da Skill (em kebab-case) — Totalmente independente de Gates */}
          <div>
            <label className="text-xs font-semibold text-slate-200 block mb-1">
              Nome da Skill (em kebab-case):
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFormError(null);
              }}
              placeholder="Ex: lyrics-pedagogical-decomposer"
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
              Slug normalizado: <strong className="text-emerald-400">{toKebabCase(name) || '(aguardando)'}</strong>
            </span>
          </div>

          {/* Linha 2: Modelo IA Sugerido & reasoning_mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-1">
                Modelo IA Sugerido para Execução:
              </label>
              <select
                value={suggestedModel}
                onChange={(e) => setSuggestedModel(e.target.value as SuggestedGeminiModel)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-400 font-medium"
              >
                {AVAILABLE_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — thinking_level="{m.thinkingLevel}" {m.id === 'gemini-3.1-pro-preview' ? '(Default)' : ''}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Padrão: <strong>Gemini 3.1 Pro</strong> (thinking_level="HIGH")
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-1">
                reasoning_mode:
              </label>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setReasoningMode('HIGH')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition border cursor-pointer ${
                    reasoningMode === 'HIGH'
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  HIGH (Raciocínio Profundo)
                </button>
                <button
                  type="button"
                  onClick={() => setReasoningMode('FAST')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition border cursor-pointer ${
                    reasoningMode === 'FAST'
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  FAST (Execução Rápida)
                </button>
              </div>
            </div>
          </div>

          {/* Linha 3: Descrição e Obrigações (Obrigatório) */}
          <div>
            <label className="text-xs font-semibold text-slate-200 block mb-1">
              Descrição e Obrigações (O que precisa ser feito nessa fase) <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setFormError(null);
              }}
              placeholder="Descreva detalhadamente as responsabilidades e entregas desta skill (pode ser digitado em Português)..."
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Linha 4: Core Profile & Technological Specialty */}
          <div>
            <label className="text-xs font-semibold text-slate-200 block mb-1">
              Core Profile & Technological Specialty:
            </label>
            <input
              type="text"
              value={coreProfile}
              onChange={(e) => setCoreProfile(e.target.value)}
              placeholder="Ex: Pixar 3D Tactile Modeling Specialist & Subsurface Scattering Engineer"
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Linha 5: Definição de Entrada & Dados de Saída */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-1">
                Validação Definição de Entrada (Input recebido):
              </label>
              <input
                type="text"
                value={inputContract}
                onChange={(e) => setInputContract(e.target.value)}
                placeholder="Ex: Letra bruta + Tema do episódio + Bíblia visual"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-1">
                Dados de Saída (Layout output):
              </label>
              <input
                type="text"
                value={outputContract}
                onChange={(e) => setOutputContract(e.target.value)}
                placeholder="Ex: JSON estruturado com laudo de 9 blocos"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Linha 6: Switches Telemetria On/Off & Skill Inativa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:bg-slate-900/60 transition">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Telemetria da Skill:</span>
                <span className="text-[11px] text-slate-400">Rastreamento de tokens e latência (Default: Off)</span>
              </div>
              <input
                type="checkbox"
                checked={telemetryEnabled}
                onChange={(e) => setTelemetryEnabled(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-slate-900"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:bg-slate-900/60 transition">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Skill Inativa:</span>
                <span className="text-[11px] text-slate-400">Pular execução automática na esteira (Default: False)</span>
              </div>
              <input
                type="checkbox"
                checked={isInactive}
                onChange={(e) => setIsInactive(e.target.checked)}
                className="rounded border-slate-700 text-rose-600 focus:ring-rose-500 h-4 w-4 bg-slate-900"
              />
            </label>
          </div>

          {/* SEÇÃO: ENRIQUECIMENTO E PRÉVIA EM INGLÊS (OBRIGATÓRIO PARA ALTA ADERÊNCIA AOS MODELOS DE IA) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Enriquecimento & Prévia do Contexto em Inglês (AI Alignment)
                </span>
              </div>
              <button
                type="button"
                onClick={handleEnrichToEnglish}
                disabled={isEnriching}
                className="px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow"
              >
                {isEnriching ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Otimizando Perfil...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gerar / Atualizar Prévia em Inglês</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Você pode preencher as informações em Português. Ao clicar acima ou salvar, o sistema trata o perfil e grava o contexto otimizado em Inglês para garantir máxima aderência e obediência dos modelos de IA.
            </p>

            {englishContext ? (
              <div className="space-y-2.5 pt-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 font-mono block text-[10px]">ENGLISH SKILL SLUG:</span>
                    <span className="text-emerald-400 font-mono font-semibold">{englishContext.name}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 font-mono block text-[10px]">ENGLISH CORE PROFILE:</span>
                    <span className="text-slate-200 font-semibold">{englishContext.coreProfile}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px]">
                  <span className="text-slate-500 font-mono block text-[10px]">ENGLISH OBLIGATIONS & SPEC:</span>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">{englishContext.description}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      REFINED SYSTEM PROMPT (PREPARED FOR GEMINI):
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPrompt}
                      className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedPrompt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPrompt ? 'Copiado!' : 'Copiar Prompt'}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-black/60 rounded-lg border border-slate-800 text-xs font-mono text-indigo-300 max-h-40 overflow-y-auto leading-relaxed custom-scrollbar">
                    {englishContext.refinedSystemPrompt}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-900/50 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                Clique em "Gerar / Atualizar Prévia em Inglês" para inspecionar o prompt otimizado antes de salvar.
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-slate-400">
              {isCreatingNew ? (
                <span>Criando nova skill no pipeline</span>
              ) : (
                <span>Editando: <strong className="text-emerald-400">{name || currentSkill?.name}</strong></span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Salvar Alterações (Persistir)</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
