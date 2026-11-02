/**
 * Studio Kids SDUI Architecture Types - Poc 2
 * Strictly derived from:
 * 1. Contrato de Handoff Técnico Gemini -> Manus
 * 2. Guia Consolidado para Preparação, Geração e Entrega Studio Kids (5 Gates)
 * 3. Manual Operacional: Ecossistema de Produção Studio Kids (Pixar 3D 4-6 anos)
 *
 * Fully decoupled from Central Studio OS (Poc 1).
 */

export type StudioKidsGateId = 'GATE_0' | 'GATE_1' | 'GATE_2' | 'GATE_3' | 'GATE_4';

export type StudioKidsSkillId =
  | 'SKILL_0_1'
  | 'SKILL_0_2'
  | 'SKILL_0_3'
  | 'SKILL_1_1'
  | 'SKILL_1_2'
  | 'SKILL_1_3'
  | 'SKILL_2_1'
  | 'SKILL_2_2'
  | 'SKILL_2_3'
  | 'SKILL_3_1'
  | 'SKILL_3_2'
  | 'SKILL_3_3'
  | 'SKILL_4_1'
  | 'SKILL_4_2'
  | 'SKILL_4_3';

export type HandoffReadiness = 'READY' | 'REVIEW' | 'BLOCKED' | 'UNVERIFIED';

export type PipelineMode = 'package' | 'shot';

export type TargetStyleTier = '3D_PIXAR_TACTILE' | '2D_FLAT_CARTOON';

export type ParentalUtilityTheme =
  | 'THEME_01_SONO_ROTINA'
  | 'THEME_02_DESFRALDE'
  | 'THEME_03_ALIMENTACAO_SAUDAVEL'
  | 'THEME_04_DESPEDIDA_ESCOLA'
  | 'THEME_05_MEDO_ESCURO'
  | 'THEME_06_DIVIDIR_BRINQUEDOS'
  | 'THEME_07_CHEGADA_IRMAOZINHO'
  | 'THEME_08_EXPRESSAR_FRUSTRACOES'
  | 'THEME_09_HIGIENE_LAVAR_MAOS'
  | 'THEME_10_PACIENCIA_ESPERA';

/**
 * Gate 0 - Intake Form
 */
export interface StudioKidsIntake {
  episode_title: string;
  theme_id: ParentalUtilityTheme;
  theme_label: string;
  target_audience_years: '4-6' | '2-4' | '6-8';
  visual_style: TargetStyleTier;
  raw_lyrics: string;
  lead_character_name: string;
  canonical_color_palette: {
    skin_primary: string;
    belly_accent: string;
    eye_color: string;
    cheek_tint: string;
  };
  forbidden_negative_traits: string[];
}

/**
 * Contrato Manus: Estrutura canônica de prompt em 9 blocos
 */
export interface NineBlockPrompt {
  format: string;
  characters: string;
  action: string;
  camera: string;
  environment: string;
  lighting: string;
  style: string;
  continuity: string;
  safety_and_exclusions: string;
}

/**
 * Gate 0 - Baseline & Intake Output
 */
export interface Gate0Output {
  gate_id: 'GATE_0';
  gate_name: 'Ingestão, Baseline e Preflight Intake';
  readiness_status: HandoffReadiness;
  manifest_00: {
    schema_version: '2.0.0-kids';
    project_id: string;
    pipeline_mode: PipelineMode;
    source_runtime: 'Gemini-StudioKids';
    target_runtime: 'Manus-Orchestrator';
    event_ids_consulted: string[];
    economy_digest: {
      budget_tier: 'STANDARD_KIDS';
      max_atomic_duration_sec: number;
      projected_model_routes: string[];
    };
    error_memory_check: {
      past_failures_indexed: number;
      mitigations_active: string[];
    };
  };
  canonical_assets_inventory: Array<{
    asset_id: string;
    label: string;
    status: 'VERIFIED' | 'MISSING';
    path: string;
  }>;
  preflight_checklist: {
    has_valid_theme: boolean;
    has_canonical_palette: boolean;
    has_forbidden_traits_filter: boolean;
    has_raw_lyrics: boolean;
  };
}

/**
 * Gate 1 - Story, Character & Pedagogy Output
 */
export interface Gate1Output {
  gate_id: 'GATE_1';
  gate_name: 'Roteiro, Pedagogia e Bíblia Visual do Personagem';
  readiness_status: HandoffReadiness;
  pedagogical_contract: {
    parental_utility_action: string;
    emotional_shift_start: string;
    emotional_shift_end: string;
    literal_vocabulary_rules: string[];
  };
  character_bible: {
    character_name: string;
    species: string;
    tactile_surface_properties: string[];
    expression_rules: string[];
    canonical_negative_prompt: string[];
  };
  stanza_breakdown: Array<{
    stanza_number: number;
    text_pt_br: string;
    intended_action: string;
    pedagogical_hook: string;
  }>;
}

/**
 * Gate 2 - Audio & Rhythmic Engineering Output (Suno 120 BPM)
 */
export interface Gate2Output {
  gate_id: 'GATE_2';
  gate_name: 'Engenharia de Áudio Rítmico e Cue-Sheet (Suno 120 BPM)';
  readiness_status: HandoffReadiness;
  suno_audio_prompt: {
    bpm: 120;
    meter: '4/4';
    style_tags: string[];
    vocal_timber: string;
    reference_tempo_ms_per_beat: number;
  };
  broadcast_audio_filters: {
    low_cut_filter_applied: boolean; // <100Hz clean
    vocals_boost_db: number; // +3dB
    stereo_panning_configured: boolean;
    target_integrated_lufs: number; // -14 LUFS
  };
  cue_sheet: Array<{
    bar_index: number;
    timestamp_sec: number;
    frame_range_30fps: string;
    lyric_cue: string;
    rhythmic_action_trigger: string;
  }>;
}

/**
 * Gate 3 - Generation & Shot Curatorship (3-Layer Checks)
 */
export interface ShotItem {
  shot_id: string;
  duration_sec: 4 | 6 | 8;
  assigned_model: 'Veo-3.1' | 'Omni-Flash-Video' | 'Runway-Gen3';
  nine_block_prompt: NineBlockPrompt;
  compiled_english_prompt: string;
  curatorship_layers: {
    layer1_file_integrity: {
      status: 'PASS' | 'FAIL';
      resolution_check: string;
      codec_check: string;
      dropped_frames: number;
    };
    layer2_visual_continuity: {
      status: 'PASS' | 'FAIL';
      palette_delta_e_within_bounds: boolean;
      character_silhouette_locked: boolean;
    };
    layer3_child_safety: {
      status: 'PASS' | 'FAIL';
      no_grotesque_textures: boolean;
      no_uncanny_valley_eyes: boolean;
      safe_for_kids_coppa: boolean;
    };
  };
  shot_verdict: 'APPROVED' | 'NEEDS_RETAKE' | 'PENDING';
}

export interface Gate3Output {
  gate_id: 'GATE_3';
  gate_name: 'Geração de Shots Atômicos e Curadoria em 3 Camadas';
  readiness_status: HandoffReadiness;
  shots_inventory: ShotItem[];
  nine_block_compliance_score: number; // 0 to 100%
  overall_curatorship_pass_rate: number; // 0 to 100%
}

/**
 * Gate 4 - Finishing & Delivery Profiles Output
 */
export interface Gate4Output {
  gate_id: 'GATE_4';
  gate_name: 'Acabamento, Perfis de Entrega e Release Multiplataforma';
  readiness_status: HandoffReadiness;
  delivery_profiles: {
    master_horizontal_16_9: {
      dimensions: '1920x1080';
      fps: 30;
      color_space: 'Rec.709';
      video_codec: 'H.264 High Profile 20Mbps';
      audio_specs: 'AAC 48kHz Stereo 320kbps -14 LUFS';
    };
    master_vertical_9_16: {
      dimensions: '1080x1920';
      fps: 30;
      framing: 'Dynamic Re-Centered 16:9 Master';
      caption_safe_zone_margin_pct: 15;
    };
    seo_metadata_package: {
      youtube_title: string;
      friendly_emojis: string[];
      description_pt_br: string;
      coppa_child_directed: true;
      tags: string[];
    };
  };
  final_release_checklist: {
    broadcast_standards_passed: boolean;
    multi_platform_transcoding_ready: boolean;
    closed_captions_vtt_ready: boolean;
    parental_guidelines_signed: boolean;
  };
}

export type AnyStudioKidsGateOutput =
  | Gate0Output
  | Gate1Output
  | Gate2Output
  | Gate3Output
  | Gate4Output;

/**
 * Metadata for a granular Skill inside a Gate
 */
export type SuggestedGeminiModel =
  | 'gemini-3.1-pro-preview' // Gemini 3.1 Pro (Default)
  | 'gemini-4-argon' // Argon 4
  | 'gemini-3.8-flash' // Gemini 3.8 Flash
  | 'gemini-3.6-flash'; // Gemini 3.6 Flash

export type ReasoningMode = 'HIGH' | 'FAST';

export interface StudioKidsSkillMeta {
  id: StudioKidsSkillId | string;
  gateId?: StudioKidsGateId | string;
  code: string;
  name: string;
  badge: string;
  description: string;
  inputContract: string;
  outputContract: string;
  parentalGoal: string;
  obligations?: string[]; // Lista detalhada de obrigações e entregas a serem geradas
  dependencies?: string[]; // IDs de skills pré-requisitos para integridade de pipeline
  isCustom?: boolean; // Se foi criada pelo operador na homologação
  outputTemplate?: Record<string, any>;
  // Novos campos para gestão avançada de Skills:
  kebabName?: string;
  suggestedModel?: SuggestedGeminiModel | string;
  thinkingLevel?: 'HIGH' | 'MEDIUM';
  reasoningMode?: ReasoningMode;
  coreProfile?: string; // Core Profile & Technological Specialty
  telemetryEnabled?: boolean; // Telemetria On/Off: Boolean (default: False)
  isInactive?: boolean; // Skill Inativa: Boolean (default: False)
  englishContext?: {
    name: string;
    description: string;
    coreProfile: string;
    inputContract: string;
    outputContract: string;
    refinedSystemPrompt: string;
    generatedAt?: string;
  };
}

export interface CreateCustomPhasePayload {
  name: string; // Obrigatório
  description: string; // Obrigatório: O que precisa ser feito e entregas geradas
  badge?: string; // Skill aplicada / modelo
  gateId: string; // Gate de destino
  inputContract?: string; // Definição de entrada
  outputContract?: string; // Definição de saída
  obligations?: string[]; // Obrigações detalhadas
  dependencies?: string[]; // Pré-requisitos
  parentalGoal?: string;
  outputTemplate?: Record<string, any>;
}

export interface StudioKidsSkillVerdict {
  approved: boolean;
  readiness: HandoffReadiness;
  verdictDate?: string;
  notes?: string;
}

/**
 * Complete Poc 2 State with Granular Skills
 */
export interface StudioKidsPoc2State {
  intake: StudioKidsIntake;
  activeGate: StudioKidsGateId | string;
  activeSkillId: StudioKidsSkillId | string;
  skillOutputs: Partial<Record<string, any>>;
  skillVerdicts: Partial<Record<string, StudioKidsSkillVerdict>>;
  gateOutputs: {
    GATE_0: Gate0Output | null;
    GATE_1: Gate1Output | null;
    GATE_2: Gate2Output | null;
    GATE_3: Gate3Output | null;
    GATE_4: Gate4Output | null;
    [customGateId: string]: any;
  };
  gateVerdicts: Record<string, {
    approved: boolean;
    verdictDate?: string;
    readiness: HandoffReadiness;
    notes?: string;
  }>;
  telemetry: {
    totalExecutions: number;
    estimatedTokens: number;
    lastLatencyMs: number;
    nineBlocksAuditPassRate: number;
    readinessScorePct: number;
  };
}
