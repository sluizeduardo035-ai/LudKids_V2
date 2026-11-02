import React, { useState, useMemo, useEffect } from 'react';
import {
  StudioKidsGateId,
  StudioKidsSkillId,
  StudioKidsSkillMeta,
  StudioKidsIntake,
  StudioKidsSkillVerdict,
  HandoffReadiness,
  SuggestedGeminiModel,
} from '../../pipeline/studioKids/types';
import {
  BLANK_STUDIO_KIDS_INTAKE,
  CANONICAL_SAPINHO_INTAKE,
} from '../../pipeline/studioKids/sampleSapinhoEpisode';
import {
  STUDIO_KIDS_SKILLS_CATALOG,
  executeStudioKidsSkill,
  calculateStudioKidsTelemetry,
  checkSkillDependencies,
} from '../../pipeline/studioKids/studioKidsEngine';
import {
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Edit3,
  RotateCcw,
  Play,
  Loader2,
  FileCode,
  Sparkles,
  BarChart3,
  Layers,
  ArrowRight,
  Info,
  Sliders,
  CheckCheck,
  AlertTriangle,
  Plus,
  ShieldCheck,
  ArrowDown,
  ArrowUp,
  Settings,
  Wrench,
  Cpu,
} from 'lucide-react';
import { StudioKidsTopologyModal } from './StudioKidsTopologyModal';
import { StudioKidsAddPhaseModal } from './StudioKidsAddPhaseModal';
import { StudioKidsSettingsModal } from './StudioKidsSettingsModal';
import { StudioKidsSkillManagerModal } from './StudioKidsSkillManagerModal';
import {
  safeLocalStorageSet,
  safeLocalStorageGet,
  safeLocalStorageRemove,
} from '../../utils/safeStorage';
import { POC2_STORAGE_KEYS } from '../../pipeline/studioKids/poc2StorageKeys';

interface StudioKidsPoc2BenchViewProps {
  onSwitchToPoc1?: () => void;
  onSwitchEnvironment?: () => void;
}

const POC2_GATE_ORDER_KEY = POC2_STORAGE_KEYS.GATE_ORDER;
const POC2_CUSTOM_SKILLS_KEY = POC2_STORAGE_KEYS.SKILLS_CATALOG;
const POC2_SKILL_ORDER_KEY = POC2_STORAGE_KEYS.SKILL_ORDER;
const POC2_SETTINGS_KEY = POC2_STORAGE_KEYS.SETTINGS;

const DEFAULT_GATES: StudioKidsGateId[] = ['GATE_0', 'GATE_1', 'GATE_2', 'GATE_3', 'GATE_4'];

const GATE_META: Record<string, {
  name: string;
  badge: string;
  description: string;
  parentalGoal: string;
}> = {
  GATE_0: {
    name: 'Gate 0: Ingestão, Baseline e Preflight Intake',
    badge: 'Preflight & Intake',
    description: 'Validação do formulário canônico de intake, inventário de ativos e emissão do 00_handoff_manifest.json.',
    parentalGoal: 'Consistência de dados e segurança inicial.',
  },
  GATE_1: {
    name: 'Gate 1: Roteiro, Pedagogia e Bíblia Visual do Personagem',
    badge: 'Story & Character Bible',
    description: 'Decomposição pedagógica com foco em Utilidade Parental, vocabulário literal e regras canônicas de modelagem 3D Pixar.',
    parentalGoal: 'Transformar rotinas difíceis (sono, banho, higiene) em brincadeiras sem atrito.',
  },
  GATE_2: {
    name: 'Gate 2: Engenharia de Áudio Rítmico e Cue-Sheet (Suno 120 BPM)',
    badge: 'Audio & Cue-Sheet 120BPM',
    description: 'Prompt musical rítmico a 120 BPM, filtros broadcast (Low-cut <100Hz, voz +3dB) e mapeamento frame-a-frame de compassos.',
    parentalGoal: 'Ritmo contagiante de 2.0s por compasso que induz a imitação motora infantil.',
  },
  GATE_3: {
    name: 'Gate 3: Geração de Shots Atômicos e Curadoria em 3 Camadas',
    badge: '9-Block Prompts & 3-Layer Curation',
    description: 'Compilação estrita nos 9 blocos do contrato Manus e curadoria técnica (Integridade de Arquivo, Continuidade Visual, Segurança Infantil).',
    parentalGoal: 'Garantia absoluta de conformidade COPPA e estética tátil Pixar sem uncanny valley.',
  },
  GATE_4: {
    name: 'Gate 4: Acabamento, Perfis de Entrega e Release Multiplataforma',
    badge: 'Finishing & Multi-Platform Release',
    description: 'Master horizontal 16:9 1080p, adaptação vertical 9:16 para Shorts/Reels e pacote SEO com emojis amigáveis.',
    parentalGoal: 'Distribuição multiplataforma com zonas seguras de visualização.',
  },
};

export const StudioKidsPoc2BenchView: React.FC<StudioKidsPoc2BenchViewProps> = ({
  onSwitchToPoc1,
  onSwitchEnvironment,
}) => {
  // Intake configuration state
  const [intake, setIntake] = useState<StudioKidsIntake>(BLANK_STUDIO_KIDS_INTAKE);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showTelemetryModal, setShowTelemetryModal] = useState<boolean>(false);

  // Helper to load catalog from dedicated storage (Clean slate: returns [] if not set)
  const loadStoredSkillsCatalog = (): StudioKidsSkillMeta[] => {
    try {
      const raw = safeLocalStorageGet(POC2_CUSTOM_SKILLS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (err) {
      console.warn('[StudioKids POC2] Failed to parse custom skills from storage:', err);
      return [];
    }
  };

  // Helper to persist skills catalog
  const persistSkillsCatalog = (catalog: StudioKidsSkillMeta[]) => {
    try {
      safeLocalStorageSet(POC2_CUSTOM_SKILLS_KEY, JSON.stringify(catalog));
    } catch (err) {
      console.warn('[StudioKids POC2] Failed to persist skills catalog:', err);
    }
  };

  // Dynamic Topology and Custom Skills State (Clean Slate: starts empty [])
  const [gateOrder, setGateOrder] = useState<string[]>(() => {
    try {
      const stored = safeLocalStorageGet(POC2_GATE_ORDER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [skillsCatalog, setSkillsCatalog] = useState<StudioKidsSkillMeta[]>(() => {
    return loadStoredSkillsCatalog();
  });

  const [skillOrderPerGate, setSkillOrderPerGate] = useState<Record<string, string[]>>(() => {
    try {
      const stored = safeLocalStorageGet(POC2_SKILL_ORDER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {
      // fallback
    }
    return {};
  });

  const [activeGate, setActiveGate] = useState<string>(() => {
    return gateOrder[0] || '';
  });

  const [activeSkillId, setActiveSkillId] = useState<string>(() => {
    const firstGateSkills = skillOrderPerGate[gateOrder[0]] || [];
    return firstGateSkills[0] || skillsCatalog[0]?.id || '';
  });

  // Modals
  const [showTopologyModal, setShowTopologyModal] = useState<boolean>(false);
  const [showAddPhaseModal, setShowAddPhaseModal] = useState<boolean>(false);
  const [addPhaseDefaultGateId, setAddPhaseDefaultGateId] = useState<string>('GATE_0');
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showSkillManagerModal, setShowSkillManagerModal] = useState<boolean>(false);
  const [skillManagerInitialSkillId, setSkillManagerInitialSkillId] = useState<string | undefined>(undefined);

  // Settings: Default Model (default: Gemini 3.1 Pro thinking_level=HIGH)
  const [selectedDefaultModel, setSelectedDefaultModel] = useState<SuggestedGeminiModel>(() => {
    try {
      const stored = safeLocalStorageGet(POC2_SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.defaultModel) return parsed.defaultModel;
      }
    } catch {
      // fallback
    }
    return 'gemini-3.1-pro-preview';
  });

  // Editable JSON output state for manual editing
  const [isEditingJson, setIsEditingJson] = useState<boolean>(false);
  const [jsonEditText, setJsonEditText] = useState<string>('');
  const [jsonEditError, setJsonEditError] = useState<string | null>(null);

  // Granular Skill outputs
  const [skillOutputs, setSkillOutputs] = useState<Partial<Record<string, any>>>({});

  // Granular Skill verdicts
  const [skillVerdicts, setSkillVerdicts] = useState<Partial<Record<string, StudioKidsSkillVerdict>>>({});

  // Skills for the currently active Gate in custom sequence
  const gateSkills = useMemo(() => {
    const orderedIds = skillOrderPerGate[activeGate] || [];
    const orderedSkills: StudioKidsSkillMeta[] = [];
    for (const id of orderedIds) {
      const found = skillsCatalog.find((s) => s.id === id);
      if (found) orderedSkills.push(found);
    }
    // Also append any skills that match gateId but aren't in orderedIds
    const remaining = skillsCatalog.filter((s) => s.gateId === activeGate && !orderedIds.includes(s.id));
    return [...orderedSkills, ...remaining];
  }, [activeGate, skillOrderPerGate, skillsCatalog]);

  // Active Skill Meta (Safe when catalog starts empty)
  const activeSkillMeta: StudioKidsSkillMeta | undefined = useMemo(() => {
    if (skillsCatalog.length === 0) return undefined;
    return (
      skillsCatalog.find((s) => s.id === activeSkillId) ||
      gateSkills[0] ||
      skillsCatalog[0]
    );
  }, [activeSkillId, gateSkills, skillsCatalog]);

  // Output and Verdict of active skill
  const currentSkillOutput = activeSkillMeta ? skillOutputs[activeSkillMeta.id] : undefined;
  const currentSkillVerdict = activeSkillMeta && skillVerdicts[activeSkillMeta.id]
    ? skillVerdicts[activeSkillMeta.id]!
    : {
        approved: false,
        readiness: 'UNVERIFIED' as HandoffReadiness,
      };

  // Check gate completion status (Gate is approved only when ALL its skills are approved)
  const isGateApproved = useMemo(() => {
    if (gateSkills.length === 0) return false;
    return gateSkills.every((s) => skillVerdicts[s.id]?.approved);
  }, [gateSkills, skillVerdicts]);

  const gateApprovedSkillsCount = useMemo(() => {
    return gateSkills.filter((s) => skillVerdicts[s.id]?.approved).length;
  }, [gateSkills, skillVerdicts]);

  // Dependency Guard for pipeline integrity
  const dependencyCheck = useMemo(() => {
    if (!activeSkillMeta) return { allowed: true, missingDependencies: [] };
    return checkSkillDependencies(activeSkillMeta.id, skillVerdicts, skillsCatalog);
  }, [activeSkillMeta, skillVerdicts, skillsCatalog]);

  // Telemetry computation
  const telemetry = useMemo(() => {
    return calculateStudioKidsTelemetry({
      intake,
      activeGate: activeGate as StudioKidsGateId,
      activeSkillId: activeSkillId as StudioKidsSkillId,
      skillOutputs: skillOutputs as any,
      skillVerdicts: skillVerdicts as any,
      gateOutputs: {
        GATE_0: null,
        GATE_1: null,
        GATE_2: null,
        GATE_3: null,
        GATE_4: null,
      },
      gateVerdicts: {
        GATE_0: { approved: false, readiness: 'UNVERIFIED' },
        GATE_1: { approved: false, readiness: 'UNVERIFIED' },
        GATE_2: { approved: false, readiness: 'UNVERIFIED' },
        GATE_3: { approved: false, readiness: 'UNVERIFIED' },
        GATE_4: { approved: false, readiness: 'UNVERIFIED' },
      },
      telemetry: {
        totalExecutions: 0,
        estimatedTokens: 0,
        lastLatencyMs: 0,
        nineBlocksAuditPassRate: 100,
        readinessScorePct: 0,
      },
    });
  }, [intake, activeGate, activeSkillId, skillOutputs, skillVerdicts]);

  // Quick switch of Gate also switches to first skill of that Gate
  const handleSelectGate = (gateId: string) => {
    setActiveGate(gateId);
    const orderedIds = skillOrderPerGate[gateId] || [];
    if (orderedIds.length > 0) {
      setActiveSkillId(orderedIds[0]);
    } else {
      const skillsInNewGate = skillsCatalog.filter((s) => s.gateId === gateId);
      if (skillsInNewGate.length > 0) {
        setActiveSkillId(skillsInNewGate[0].id);
      }
    }
    setIsEditingJson(false);
  };

  // Reorder Gates: Up or Down
  const handleMoveGate = (gateId: string, direction: 'UP' | 'DOWN') => {
    const idx = gateOrder.indexOf(gateId);
    if (idx === -1) return;
    const targetIdx = direction === 'UP' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= gateOrder.length) return;
    const next = [...gateOrder];
    const [removed] = next.splice(idx, 1);
    next.splice(targetIdx, 0, removed);
    setGateOrder(next);
    safeLocalStorageSet(POC2_GATE_ORDER_KEY, JSON.stringify(next));
  };

  // Reorder Skills inside Gate: Up or Down
  const handleMoveSkill = (skillId: string, direction: 'UP' | 'DOWN') => {
    const currentGateSkills = skillOrderPerGate[activeGate] || gateSkills.map((s) => s.id);
    const idx = currentGateSkills.indexOf(skillId);
    if (idx === -1) return;
    const targetIdx = direction === 'UP' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentGateSkills.length) return;
    const nextSkills = [...currentGateSkills];
    const [removed] = nextSkills.splice(idx, 1);
    nextSkills.splice(targetIdx, 0, removed);
    const nextMap = { ...skillOrderPerGate, [activeGate]: nextSkills };
    setSkillOrderPerGate(nextMap);
    safeLocalStorageSet(POC2_SKILL_ORDER_KEY, JSON.stringify(nextMap));
  };

  // Add New Custom Phase to Pipeline (Binds a Skill from the catalog to this Phase)
  const handleAddPhase = (payload: {
    name: string;
    description: string;
    badge: string;
    gateId: string;
    inputContract: string;
    outputContract: string;
    obligations: string[];
    dependencies: string[];
    skillId?: string;
  }) => {
    const boundSkill = payload.skillId ? skillsCatalog.find((s) => s.id === payload.skillId) : null;
    const newId = `PHASE_${Date.now()}`;
    const customCount = skillsCatalog.filter((s) => s.isCustom).length + 1;
    const newPhase: StudioKidsSkillMeta = {
      id: newId,
      gateId: payload.gateId,
      code: `C.${customCount}`,
      name: payload.name,
      badge: boundSkill?.badge || payload.badge,
      suggestedModel: boundSkill?.suggestedModel || 'gemini-3.1-pro-preview',
      thinkingLevel: boundSkill?.thinkingLevel || 'HIGH',
      reasoningMode: boundSkill?.reasoningMode || 'HIGH',
      description: payload.description,
      coreProfile: boundSkill?.coreProfile || '',
      inputContract: payload.inputContract,
      outputContract: payload.outputContract,
      obligations: payload.obligations,
      dependencies: payload.dependencies,
      parentalGoal: 'Garantir consistência da nova fase vinculada à skill dentro da esteira.',
      isCustom: true,
      englishContext: boundSkill?.englishContext,
    };

    // Ensure gate exists in gateOrder
    if (!gateOrder.includes(payload.gateId)) {
      const nextGateOrder = [...gateOrder, payload.gateId];
      setGateOrder(nextGateOrder);
      safeLocalStorageSet(POC2_GATE_ORDER_KEY, JSON.stringify(nextGateOrder));
    }

    const nextCatalog = [...skillsCatalog, newPhase];
    setSkillsCatalog(nextCatalog);

    const currentGateSkills = skillOrderPerGate[payload.gateId] || [];
    const nextGateSkills = [...currentGateSkills, newId];
    const nextMap = { ...skillOrderPerGate, [payload.gateId]: nextGateSkills };
    setSkillOrderPerGate(nextMap);

    persistSkillsCatalog(nextCatalog);
    safeLocalStorageSet(POC2_SKILL_ORDER_KEY, JSON.stringify(nextMap));

    setActiveGate(payload.gateId);
    setActiveSkillId(newId);
  };

  // Delete Custom Skill
  const handleDeleteCustomSkill = (skillId: string) => {
    const nextCatalog = skillsCatalog.filter((s) => s.id !== skillId);
    setSkillsCatalog(nextCatalog);

    const nextMap: Record<string, string[]> = {};
    for (const [gId, sIds] of Object.entries(skillOrderPerGate)) {
      nextMap[gId] = sIds.filter((id) => id !== skillId);
    }
    setSkillOrderPerGate(nextMap);

    persistSkillsCatalog(nextCatalog);
    safeLocalStorageSet(POC2_SKILL_ORDER_KEY, JSON.stringify(nextMap));

    if (activeSkillId === skillId) {
      const firstSkill = nextMap[activeGate]?.[0] || '';
      setActiveSkillId(firstSkill);
    }
  };

  // Save Settings from Settings Modal
  const handleSaveSettings = (settings: {
    defaultModel: SuggestedGeminiModel;
    thinkingLevel: 'HIGH' | 'MEDIUM';
    apiKey?: string;
  }) => {
    setSelectedDefaultModel(settings.defaultModel);
    safeLocalStorageSet(POC2_SETTINGS_KEY, JSON.stringify(settings));
  };

  // Save/Update Existing Skill from Skill Manager Modal
  const handleSaveExistingSkill = (updatedSkill: StudioKidsSkillMeta) => {
    const nextCatalog = skillsCatalog.map((s) => (s.id === updatedSkill.id ? updatedSkill : s));
    setSkillsCatalog(nextCatalog);
    persistSkillsCatalog(nextCatalog);
  };

  // Create New Skill from Skill Manager Modal (Decoupled: added to catalog library)
  const handleCreateSkillFromManager = (newSkill: StudioKidsSkillMeta) => {
    const nextCatalog = [...skillsCatalog, newSkill];
    setSkillsCatalog(nextCatalog);
    persistSkillsCatalog(nextCatalog);
    if (!activeSkillId) {
      setActiveSkillId(newSkill.id);
    }
  };

  // Reset Entire Environment to Clean Slate (Zero Fases, Zero Skills)
  const handleResetToCleanSlate = () => {
    setSkillsCatalog([]);
    setGateOrder([]);
    setSkillOrderPerGate({});
    setActiveGate('');
    setActiveSkillId('');
    setSkillOutputs({});
    setSkillVerdicts({});
    safeLocalStorageRemove(POC2_CUSTOM_SKILLS_KEY);
    safeLocalStorageRemove(POC2_GATE_ORDER_KEY);
    safeLocalStorageRemove(POC2_SKILL_ORDER_KEY);
  };

  // Load Reference Demo Template (Sapinho Cururu 5-Gates)
  const handleLoadDemoTemplate = () => {
    const demoGates = DEFAULT_GATES;
    const demoSkills = STUDIO_KIDS_SKILLS_CATALOG;
    const demoMap: Record<string, string[]> = {};
    for (const g of DEFAULT_GATES) {
      demoMap[g] = STUDIO_KIDS_SKILLS_CATALOG.filter((s) => s.gateId === g).map((s) => s.id);
    }
    setGateOrder(demoGates);
    setSkillsCatalog(demoSkills);
    setSkillOrderPerGate(demoMap);
    setActiveGate('GATE_0');
    setActiveSkillId('SKILL_0_1');
    safeLocalStorageSet(POC2_GATE_ORDER_KEY, JSON.stringify(demoGates));
    safeLocalStorageSet(POC2_CUSTOM_SKILLS_KEY, JSON.stringify(demoSkills));
    safeLocalStorageSet(POC2_SKILL_ORDER_KEY, JSON.stringify(demoMap));
  };

  // Restore Canonical Topology
  const handleResetToCanonical = () => {
    handleLoadDemoTemplate();
  };

  // Load canonical preset
  const handleLoadCanonicalPreset = () => {
    setIntake(CANONICAL_SAPINHO_INTAKE);
    setIsEditingJson(false);
  };

  // Clear to blank
  const handleClearIntake = () => {
    setIntake(BLANK_STUDIO_KIDS_INTAKE);
    setIsEditingJson(false);
  };

  // Execute single skill
  const handleExecuteActiveSkill = async () => {
    if (!activeSkillMeta) return;
    setIsExecuting(true);
    setIsEditingJson(false);
    setJsonEditError(null);

    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const out = executeStudioKidsSkill(activeSkillMeta.id, intake, skillOutputs, skillsCatalog);
      setSkillOutputs((prev) => ({
        ...prev,
        [activeSkillMeta.id]: out,
      }));
      setSkillVerdicts((prev) => ({
        ...prev,
        [activeSkillMeta.id]: {
          approved: false,
          readiness: out.status || 'READY',
        },
      }));
    } finally {
      setIsExecuting(false);
    }
  };

  // Execute all skills in current Gate
  const handleExecuteAllGateSkills = async () => {
    setIsExecuting(true);
    setIsEditingJson(false);
    setJsonEditError(null);

    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const newOutputs = { ...skillOutputs };
      const newVerdicts = { ...skillVerdicts };

      for (const s of gateSkills) {
        const out = executeStudioKidsSkill(s.id, intake, newOutputs, skillsCatalog);
        newOutputs[s.id] = out;
        newVerdicts[s.id] = {
          approved: false,
          readiness: out.status || 'READY',
        };
      }

      setSkillOutputs(newOutputs);
      setSkillVerdicts(newVerdicts);
    } finally {
      setIsExecuting(false);
    }
  };

  // Approve active skill
  const handleApproveSkill = () => {
    if (!activeSkillMeta) return;
    setSkillVerdicts((prev) => ({
      ...prev,
      [activeSkillMeta.id]: {
        approved: true,
        readiness: 'READY',
        verdictDate: new Date().toISOString(),
      },
    }));

    // Auto-advance to next skill in Gate, or next Gate
    const currentIdx = gateSkills.findIndex((s) => s.id === activeSkillMeta.id);
    if (currentIdx < gateSkills.length - 1) {
      setActiveSkillId(gateSkills[currentIdx + 1].id);
    } else {
      // Last skill in Gate: check if we can advance Gate
      const currentGateIdx = gateOrder.indexOf(activeGate);
      if (currentGateIdx < gateOrder.length - 1) {
        const nextGate = gateOrder[currentGateIdx + 1];
        handleSelectGate(nextGate);
      }
    }
  };

  // Reject active skill
  const handleRejectSkill = () => {
    if (!activeSkillMeta) return;
    setSkillVerdicts((prev) => ({
      ...prev,
      [activeSkillMeta.id]: {
        approved: false,
        readiness: 'REVIEW',
        verdictDate: new Date().toISOString(),
      },
    }));

    if (currentSkillOutput) {
      setJsonEditText(JSON.stringify(currentSkillOutput, null, 2));
      setIsEditingJson(true);
    }
  };

  // Save manual JSON edit
  const handleSaveJsonEdit = () => {
    if (!activeSkillMeta) return;
    try {
      const parsed = JSON.parse(jsonEditText);
      setSkillOutputs((prev) => ({
        ...prev,
        [activeSkillMeta.id]: parsed,
      }));
      setIsEditingJson(false);
      setJsonEditError(null);
    } catch (err: any) {
      setJsonEditError(`JSON Inválido: ${err?.message || 'Erro de sintaxe'}`);
    }
  };

  // Copy JSON to clipboard
  const handleCopyJson = () => {
    if (!currentSkillOutput) return;
    const jsonStr = JSON.stringify(currentSkillOutput, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header with Segregated Front Switcher & Topology Controls */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {onSwitchEnvironment && (
            <>
              <button
                onClick={onSwitchEnvironment}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="Voltar para a tela de seleção inicial"
              >
                ← Seleção
              </button>
              <div className="h-4 w-px bg-slate-800 mx-1" />
            </>
          )}

          <div className="flex items-center gap-2.5">
            <span className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-4 h-4" />
              </span>
              Produtora Kids — POC 2
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Ambiente Exclusivo
            </span>
          </div>

          <span className="hidden xl:inline-flex items-center px-2 py-0.5 text-[10px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700 rounded">
            {gateOrder.length} GATES • {skillsCatalog.length} SKILLS NO CATÁLOGO
          </span>
        </div>

        {/* Action Controls: Settings, Skill Manager, Topology Manager, Add Phase, Metrics */}
        <div className="flex items-center gap-2">
          {/* Botão Parâmetros & Configurações de Integração (Gemini API / Modelos) */}
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
            title="Diagnóstico Gemini, Chave de API e Configurações de Modelos"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Parâmetros & Integrações</span>
          </button>

          {/* Botão Manutenção e Criação de Skills */}
          <button
            type="button"
            onClick={() => {
              setSkillManagerInitialSkillId(activeSkillMeta?.id);
              setShowSkillManagerModal(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-200 border border-indigo-700/50 transition-all cursor-pointer"
            title="Manutenção, criação, navegação sequencial e tradução de skills"
          >
            <Wrench className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Manutenção de Skills</span>
          </button>

          {/* Botão Gerenciar Ordem e Fases */}
          <button
            type="button"
            onClick={() => setShowTopologyModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 transition-all cursor-pointer"
            title="Reordenar Gates/Skills e gerenciar a ordem de execução da esteira"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Ordem & Fases</span>
          </button>

          {/* Botão Adicionar Nova Fase */}
          <button
            type="button"
            onClick={() => {
              setAddPhaseDefaultGateId(activeGate);
              setShowAddPhaseModal(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow transition-all cursor-pointer"
            title="Incluir uma nova fase ou skill padronizada no pipeline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ Nova Fase</span>
          </button>

          {/* Telemetry and Metrics Trigger */}
          <button
            onClick={() => setShowTelemetryModal(!showTelemetryModal)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all cursor-pointer"
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Métricas ({telemetry.readinessScorePct}%)</span>
          </button>
        </div>
      </header>

      {/* Main 2-Panel Work Area: Left Gate Navigation + Right Granular Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Gate Selector Sidebar */}
        <aside className="w-80 border-r border-slate-800 bg-slate-900/50 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Ordem dos Gates
            </span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/50">
              {telemetry.approvedSkillsCount}/{skillsCatalog.length} Prontas
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
            {gateOrder.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-3 my-auto">
                <div className="w-10 h-10 mx-auto rounded-xl bg-slate-800/80 text-slate-400 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">Nenhum Gate</p>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Cadastre fases no pipeline para estruturar a ordem da produtora.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddPhaseModal(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Nova Fase</span>
                </button>
              </div>
            ) : (
              gateOrder.map((gateId, gIdx) => {
                const meta = GATE_META[gateId] || {
                  name: gateId,
                  badge: 'Custom Gate',
                  description: 'Gate de execução customizada.',
                  parentalGoal: 'Etapa do pipeline configurada pelo operador.',
                };
              const isSelected = activeGate === gateId;
              const skills = skillsCatalog.filter((s) => s.gateId === gateId);
              const approvedInGate = skills.filter((s) => skillVerdicts[s.id]?.approved).length;
              const isGateFullyApproved = approvedInGate === skills.length && skills.length > 0;

              return (
                <div
                  key={gateId}
                  className={`group relative rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500/80 shadow-sm ring-1 ring-emerald-500/30'
                      : 'bg-slate-900/30 border-slate-800/70 hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <button
                    onClick={() => handleSelectGate(gateId)}
                    className="w-full text-left p-3 pr-10 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-1 rounded border border-indigo-800/40">
                          #{gIdx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-200">{gateId}</span>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                          isGateFullyApproved
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : approvedInGate > 0
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {approvedInGate}/{skills.length} Skills
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-300 truncate">{meta.badge}</p>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 leading-relaxed">
                      {meta.parentalGoal}
                    </p>
                  </button>

                  {/* Micro botões de reordenação do Gate */}
                  <div className="absolute right-2 top-2.5 flex flex-col gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      disabled={gIdx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveGate(gateId, 'UP');
                      }}
                      className="p-1 rounded bg-slate-950 hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Mover Gate para cima"
                    >
                      <ArrowUp className="w-2.5 h-2.5" />
                    </button>
                    <button
                      type="button"
                      disabled={gIdx === gateOrder.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveGate(gateId, 'DOWN');
                      }}
                      className="p-1 rounded bg-slate-950 hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Mover Gate para baixo"
                    >
                      <ArrowDown className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              );
            }))}
          </div>

          {/* Quick Intake Actions on Sidebar Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/80 space-y-2">
            <button
              onClick={handleLoadCanonicalPreset}
              className="w-full py-1.5 px-2 text-xs font-medium bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Preencher Caso Canônico (Sapinho)
            </button>
            <button
              onClick={handleClearIntake}
              className="w-full py-1.5 px-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpar / Projeto em Branco
            </button>
          </div>
        </aside>

        {/* Right Main Bench: Phased Skills Navigation + The 4 Standardized Dimensions */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {!activeSkillMeta ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
              <div className="max-w-2xl w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-100">
                        Ambiente Exclusivo — Produtora Kids POC 2
                      </h2>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                        Base Limpa
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Este ambiente está 100% isolado de outras POCs e inicia sem fases ou skills pré-carregadas para que você estruture cada elemento da produtora sob medida.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {/* Passo 1 */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                        PASSO 1
                      </span>
                      <h3 className="text-xs font-bold text-slate-200">
                        Chave Gemini & Modelo Padrão
                      </h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Configure e valide sua chave exclusiva da API Gemini com diagnóstico de conexão em tempo real.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSettingsModal(true)}
                      className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Configurar API</span>
                    </button>
                  </div>

                  {/* Passo 2 */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/40 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                        PASSO 2
                      </span>
                      <h3 className="text-xs font-bold text-slate-200">
                        Cadastrar Skills no Catálogo
                      </h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Crie suas skills em Português com enriquecimento e prévia em Inglês. Sem vínculo fixo com Gate.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSkillManagerInitialSkillId(undefined);
                        setShowSkillManagerModal(true);
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg shadow-indigo-950/50"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>+ Cadastrar Skill</span>
                    </button>
                  </div>

                  {/* Passo 3 */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                        PASSO 3
                      </span>
                      <h3 className="text-xs font-bold text-slate-200">
                        Incluir Fases no Pipeline
                      </h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Crie as fases de execução do pipeline e vincule a skill especialista correspondente.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddPhaseModal(true)}
                      className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-950/50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Nova Fase</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                  <span>
                    Skills registradas no catálogo: <strong className="text-indigo-300">{skillsCatalog.length}</strong> • Gates ativos: <strong className="text-emerald-300">{gateOrder.length}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleLoadDemoTemplate}
                    className="text-xs text-slate-400 hover:text-emerald-300 underline underline-offset-4 transition cursor-pointer"
                  >
                    Ou carregar template canônico de demonstração (5 Gates / 21 Skills)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Sub-Abas de Navegação Faseada das Skills dentro do Gate */}
              <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 shrink-0 flex items-center justify-between gap-3 overflow-x-auto custom-scrollbar">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-400 mr-1 uppercase tracking-wider">
                    Fases do {activeGate}:
                  </span>
                  {gateSkills.map((skill, sIdx) => {
                const isSelected = activeSkillId === skill.id;
                const v = skillVerdicts[skill.id];
                const hasOut = Boolean(skillOutputs[skill.id]);

                return (
                  <div key={skill.id} className="flex items-center">
                    <button
                      onClick={() => {
                        setActiveSkillId(skill.id);
                        setIsEditingJson(false);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition border cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-400 font-semibold shadow-md shadow-emerald-950/50'
                          : v?.approved
                          ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800 hover:bg-emerald-900/50'
                          : hasOut
                          ? 'bg-blue-950/50 text-blue-300 border-blue-800 hover:bg-blue-900/50'
                          : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-mono text-[11px] font-bold">{skill.code}</span>
                      <span>{skill.name}</span>
                      {v?.approved ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                      ) : hasOut ? (
                        <Info className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                      ) : null}
                    </button>

                    {/* Botões de Mover Skill */}
                    {isSelected && (
                      <div className="flex items-center gap-0.5 ml-1 mr-1">
                        <button
                          type="button"
                          disabled={sIdx === 0}
                          onClick={() => handleMoveSkill(skill.id, 'UP')}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                          title="Mover fase para a esquerda"
                        >
                          <ArrowUp className="w-2.5 h-2.5 rotate-[-90deg]" />
                        </button>
                        <button
                          type="button"
                          disabled={sIdx === gateSkills.length - 1}
                          onClick={() => handleMoveSkill(skill.id, 'DOWN')}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                          title="Mover fase para a direita"
                        >
                          <ArrowDown className="w-2.5 h-2.5 rotate-[-90deg]" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Botão rápido para incluir nova fase neste Gate */}
              <button
                type="button"
                onClick={() => {
                  setAddPhaseDefaultGateId(activeGate);
                  setShowAddPhaseModal(true);
                }}
                className="px-2 py-1 text-xs rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-dashed border-emerald-700/60 flex items-center gap-1 transition cursor-pointer"
                title="Incluir nova fase diretamente neste Gate"
              >
                <Plus className="w-3 h-3" />
                <span>+ Fase</span>
              </button>
            </div>

            {/* Status Geral de Conclusão do Gate */}
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${
                  isGateApproved
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {isGateApproved
                  ? '✓ GATE 100% PRONTO (READY)'
                  : `GATE EM PROGRESSO (${gateApprovedSkillsCount}/${gateSkills.length} SKILLS)`}
              </span>
            </div>
          </div>

          {/* ALERTA DE GUARDA DE INTEGRIDADE DO PIPELINE (Se dependências não forem cumpridas) */}
          {!dependencyCheck.allowed && (
            <div className="px-4 py-2.5 bg-amber-950/70 border-b border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-amber-300">
                    Guarda de Integridade do Pipeline Ativa:
                  </span>{' '}
                  <span className="text-amber-200">
                    Para evitar informações inconsistentes no episódio, esta fase exige a prévia aprovação de:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    {dependencyCheck.missingDependencies.map((dep) => {
                      const depMeta = skillsCatalog.find((s) => s.id === dep.id);
                      return (
                        <button
                          key={dep.id}
                          type="button"
                          onClick={() => {
                            if (depMeta) {
                              if (depMeta.gateId) {
                                setActiveGate(depMeta.gateId);
                              }
                              setActiveSkillId(depMeta.id);
                            }
                          }}
                          className="px-2 py-0.5 rounded bg-amber-900/80 hover:bg-amber-800 text-amber-100 text-[11px] font-mono border border-amber-600/50 flex items-center gap-1 transition cursor-pointer"
                        >
                          <span>Ir para {dep.code} — {dep.name}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AS 4 DIMENSÕES PADRONIZADAS DA FASE ATIVA */}
          <section className="p-4 border-b border-slate-800 bg-slate-900/40 shrink-0 space-y-3">
            {/* Linha 1: Skill Responsável & Ações de Execução */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                    Fase {activeSkillMeta.code}
                  </span>
                  <h1 className="text-base font-bold text-slate-100">{activeSkillMeta.name}</h1>
                  <span className="text-[11px] font-medium text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    <strong>Skill:</strong> {activeSkillMeta.badge}
                  </span>
                  {activeSkillMeta.suggestedModel && (
                    <span className="text-[10px] font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded flex items-center gap-1">
                      <Cpu className="w-2.5 h-2.5" />
                      {activeSkillMeta.suggestedModel === 'gemini-3.1-pro-preview' ? 'Gemini 3.1 Pro' :
                       activeSkillMeta.suggestedModel === 'gemini-4-argon' ? 'Argon 4' :
                       activeSkillMeta.suggestedModel === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' :
                       'Gemini 3.6 Flash'}
                    </span>
                  )}
                  {activeSkillMeta.reasoningMode && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                      activeSkillMeta.reasoningMode === 'HIGH'
                        ? 'bg-purple-950/70 text-purple-300 border-purple-800/50'
                        : 'bg-amber-950/70 text-amber-300 border-amber-800/50'
                    }`}>
                      {activeSkillMeta.reasoningMode}
                    </span>
                  )}
                  {activeSkillMeta.isCustom && (
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-600/40 px-2 py-0.5 rounded">
                      Fase Customizada
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSkillManagerInitialSkillId(activeSkillMeta.id);
                      setShowSkillManagerModal(true);
                    }}
                    className="ml-1 px-2 py-0.5 text-[11px] font-medium rounded bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 flex items-center gap-1 transition cursor-pointer"
                    title="Editar ou enriquecer esta Skill no Gerenciador"
                  >
                    <Wrench className="w-3 h-3 text-indigo-400" />
                    <span>Editar no Gerenciador</span>
                  </button>
                </div>
              </div>

              {/* Botões de Execução */}
              <div className="flex items-center gap-2 self-start md:self-center">
                <button
                  onClick={handleExecuteActiveSkill}
                  disabled={isExecuting}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Executando...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      Executar Fase {activeSkillMeta.code}
                    </>
                  )}
                </button>

                <button
                  onClick={handleExecuteAllGateSkills}
                  disabled={isExecuting}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all disabled:opacity-50 cursor-pointer"
                  title="Executar todas as fases deste Gate em sequência"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Executar Todo o {activeGate}</span>
                </button>
              </div>
            </div>

            {/* Linha 2: Os 3 Blocos Padronizados (Obrigações, Entrada e Saída) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
              {/* Bloco 2: Lista de Obrigações (O que precisa ser feito) */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/90 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Obrigações da Fase
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {activeSkillMeta.obligations?.length || 1} entregas
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {activeSkillMeta.description}
                </p>
                {activeSkillMeta.obligations && activeSkillMeta.obligations.length > 0 && (
                  <ul className="space-y-1 pt-1">
                    {activeSkillMeta.obligations.map((ob, idx) => (
                      <li key={idx} className="text-[10px] text-slate-300 flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold shrink-0">•</span>
                        <span>{ob}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Bloco 3: Definição de Entrada (Input recebido) */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/90 space-y-1.5">
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                  Definição de Entrada (Input)
                </span>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                  {activeSkillMeta.inputContract}
                </p>
                <div className="text-[10px] text-slate-400 pt-1 space-y-0.5">
                  <div><strong>Episódio:</strong> {intake.episode_title || '(Aguardando preenchimento)'}</div>
                  <div><strong>Protagonista:</strong> {intake.lead_character_name || '(Aguardando)'}</div>
                </div>
              </div>

              {/* Bloco 4: Definição de Saída (Output entregue) */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/90 space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                  Definição de Saída (Output)
                </span>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                  {activeSkillMeta.outputContract}
                </p>
                <div className="text-[10px] text-slate-400 pt-1">
                  <strong>Status de Entrega:</strong>{' '}
                  <span className={currentSkillOutput ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {currentSkillOutput ? 'Gerado e disponível no JSON' : 'Pendente de execução'}
                  </span>
                </div>
              </div>
            </div>

            {/* In Gate 0 / Skill 0.1: Render Clean Intake Form */}
            {activeSkillMeta.id === 'SKILL_0_1' && (
              <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Título do Episódio:
                  </label>
                  <input
                    type="text"
                    value={intake.episode_title}
                    onChange={(e) => setIntake({ ...intake, episode_title: e.target.value })}
                    placeholder="Ex: O Sapinho Colorido na Lagoa Encantada"
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Nome do Personagem Canônico:
                  </label>
                  <input
                    type="text"
                    value={intake.lead_character_name}
                    onChange={(e) => setIntake({ ...intake, lead_character_name: e.target.value })}
                    placeholder="Ex: Sapinho Pipo"
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Tema de Utilidade Parental:
                  </label>
                  <select
                    value={intake.theme_id}
                    onChange={(e) =>
                      setIntake({
                        ...intake,
                        theme_id: e.target.value as any,
                        theme_label: e.target.options[e.target.selectedIndex].text,
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="THEME_09_HIGIENE_LAVAR_MAOS">Tema 9: Higiene & Lavar as Mãos</option>
                    <option value="THEME_01_SONO_ROTINA">Tema 1: Sono e Rotina Noturna</option>
                    <option value="THEME_02_DESFRALDE">Tema 2: Desfralde sem Medo</option>
                    <option value="THEME_03_ALIMENTACAO_SAUDAVEL">Tema 3: Alimentação e Provar Novos Sabores</option>
                    <option value="THEME_06_DIVIDIR_BRINQUEDOS">Tema 6: Dividir Brinquedos e Cooperação</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Letra / Poema Base (Estrofes & Refrão para decomposição):
                  </label>
                  <textarea
                    rows={3}
                    value={intake.raw_lyrics}
                    onChange={(e) => setIntake({ ...intake, raw_lyrics: e.target.value })}
                    placeholder="Cole ou digite a letra da cantiga infantil aqui..."
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 placeholder-slate-600 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}
          </section>

          {/* O RESULTADO DA EXECUÇÃO (BLOCO JSON PURO DA SKILL) */}
          <section className="flex-1 flex flex-col min-h-0 p-4 overflow-hidden">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Resultado da Fase {activeSkillMeta.code} (JSON Puro)
                </span>
                {currentSkillVerdict.readiness && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      currentSkillVerdict.readiness === 'READY'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : currentSkillVerdict.readiness === 'REVIEW'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    STATUS: {currentSkillVerdict.readiness}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {currentSkillOutput && (
                  <button
                    onClick={handleCopyJson}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar JSON</span>
                      </>
                    )}
                  </button>
                )}

                {!isEditingJson ? (
                  <button
                    onClick={() => {
                      if (currentSkillOutput) {
                        setJsonEditText(JSON.stringify(currentSkillOutput, null, 2));
                        setIsEditingJson(true);
                        setJsonEditError(null);
                      }
                    }}
                    disabled={!currentSkillOutput}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar Manualmente</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleSaveJsonEdit}
                      className="px-3 py-1 text-xs font-bold rounded bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                    >
                      Salvar JSON
                    </button>
                    <button
                      onClick={() => setIsEditingJson(false)}
                      className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {jsonEditError && (
              <div className="mb-2 p-2 rounded bg-rose-950/80 border border-rose-600 text-rose-200 text-xs">
                {jsonEditError}
              </div>
            )}

            {/* Área de Visualização ou Edição do JSON */}
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col min-h-0">
              {isEditingJson ? (
                <textarea
                  value={jsonEditText}
                  onChange={(e) => setJsonEditText(e.target.value)}
                  className="w-full flex-1 p-4 bg-slate-950 text-emerald-400 font-mono text-xs focus:outline-none resize-none custom-scrollbar"
                />
              ) : (
                <pre className="flex-1 p-4 overflow-auto text-xs font-mono text-emerald-300 custom-scrollbar leading-relaxed">
                  {currentSkillOutput
                    ? JSON.stringify(currentSkillOutput, null, 2)
                    : '// Clique em "Executar Fase ' +
                      activeSkillMeta.code +
                      '" para gerar o contrato JSON puro desta skill.'}
                </pre>
              )}
            </div>
          </section>

          {/* A PROVA: SIM OU NÃO (APROVAÇÃO DELIBERATIVA DA SKILL) */}
          <footer className="p-4 border-t border-slate-800 bg-slate-900/90 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                Deliberação de Homologação:
                {currentSkillVerdict.approved ? (
                  <span className="text-emerald-400 font-bold">✓ Homologada com Sucesso</span>
                ) : currentSkillVerdict.readiness === 'REVIEW' ? (
                  <span className="text-amber-400 font-bold">⚠ Ajuste Solicitado</span>
                ) : (
                  <span className="text-slate-400">Aguardando Avaliação</span>
                )}
              </span>
              <p className="text-xs text-slate-400">
                Aprovar a entrega da fase <strong>{activeSkillMeta.code}: {activeSkillMeta.name}</strong> avança para a próxima etapa na ordem de execução.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* NÃO (Reprovar e solicitar revisão) */}
              <button
                onClick={handleRejectSkill}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-600/50 text-rose-200 transition-colors cursor-pointer"
              >
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Não (Reprovar & Editar)</span>
              </button>

              {/* SIM (Aprovar e Avançar) */}
              <button
                onClick={handleApproveSkill}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Sim (Aprovar & Avançar)</span>
              </button>
            </div>
          </footer>
            </>
          )}
        </main>
      </div>

      {/* MODAL DO GERENCIADOR DE TOPOLOGIA & ORDEM DO PIPELINE */}
      <StudioKidsTopologyModal
        isOpen={showTopologyModal}
        onClose={() => setShowTopologyModal(false)}
        gateOrder={gateOrder}
        onMoveGate={handleMoveGate}
        skillsCatalog={skillsCatalog}
        skillOrderPerGate={skillOrderPerGate}
        onMoveSkill={handleMoveSkill}
        onOpenAddPhase={(gateId) => {
          setAddPhaseDefaultGateId(gateId || activeGate);
          setShowAddPhaseModal(true);
        }}
        onDeleteCustomSkill={handleDeleteCustomSkill}
        onResetToCanonical={handleResetToCanonical}
        onSelectSkill={(gateId, skillId) => {
          setActiveGate(gateId);
          setActiveSkillId(skillId);
        }}
      />

      {/* MODAL DE INCLUSÃO DE NOVA FASE PADRONIZADA */}
      <StudioKidsAddPhaseModal
        isOpen={showAddPhaseModal}
        onClose={() => setShowAddPhaseModal(false)}
        gateOrder={gateOrder}
        skillsCatalog={skillsCatalog}
        initialGateId={addPhaseDefaultGateId}
        onAddPhase={handleAddPhase}
        onOpenSkillManager={() => {
          setSkillManagerInitialSkillId(undefined);
          setShowSkillManagerModal(true);
        }}
      />

      {/* MODAL DE PARÂMETROS E INTEGRAÇÕES (GEMINI API & MODELOS) */}
      <StudioKidsSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        selectedDefaultModel={selectedDefaultModel}
        onSaveSettings={handleSaveSettings}
        onResetToCleanSlate={handleResetToCleanSlate}
        onLoadDemoTemplate={handleLoadDemoTemplate}
      />

      {/* MODAL DE MANUTENÇÃO & CRIAÇÃO DE SKILLS (CARROSSEL, INGLÊS, CONTRATOS) */}
      <StudioKidsSkillManagerModal
        isOpen={showSkillManagerModal}
        onClose={() => setShowSkillManagerModal(false)}
        skillsCatalog={skillsCatalog}
        initialSkillId={skillManagerInitialSkillId || activeSkillId}
        onSaveSkill={handleSaveExistingSkill}
        onCreateSkill={handleCreateSkillFromManager}
      />

      {/* Modal de Telemetria e Métricas */}
      {showTelemetryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                Painel de Telemetria da Homologação (Poc 2)
              </h3>
              <button
                onClick={() => setShowTelemetryModal(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 py-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Score de Prontidão:</span>
                <span className="text-lg font-bold text-emerald-400">{telemetry.readinessScorePct}%</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Skills Aprovadas:</span>
                <span className="text-lg font-bold text-indigo-400">
                  {telemetry.approvedSkillsCount} / {skillsCatalog.length}
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Conformidade 9 Blocos:</span>
                <span className="text-lg font-bold text-emerald-400">{telemetry.nineBlocksAuditPassRate}%</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Modo de Pipeline:</span>
                <span className="text-sm font-bold text-slate-200 font-mono">PACKAGE</span>
              </div>
            </div>
            <button
              onClick={() => setShowTelemetryModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Fechar Painel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
