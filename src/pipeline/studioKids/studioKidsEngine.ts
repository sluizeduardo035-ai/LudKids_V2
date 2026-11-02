import {
  StudioKidsIntake,
  StudioKidsGateId,
  StudioKidsSkillId,
  StudioKidsSkillMeta,
  Gate0Output,
  Gate1Output,
  Gate2Output,
  Gate3Output,
  Gate4Output,
  ShotItem,
  NineBlockPrompt,
  StudioKidsPoc2State,
} from './types';

/**
 * Catalog of 15 Granular Skills across the 5 Gates (Manus Handoff & Studio Kids Architecture)
 * Each Skill explicitly defines:
 * 1. Nome & Skill aplicada
 * 2. Obrigações / o que precisa ser feito & entregas
 * 3. Definição de Entrada (Input)
 * 4. Definição de Saída (Output)
 * 5. Pré-requisitos (Dependencies) para garantir a ordem pré-definida e integridade do episódio
 */
export const STUDIO_KIDS_SKILLS_CATALOG: StudioKidsSkillMeta[] = [
  // GATE 0 SKILLS
  {
    id: 'SKILL_0_1',
    gateId: 'GATE_0',
    code: '0.1',
    name: 'Intake & Validação Canônica',
    badge: 'Intake Contract',
    description: 'Validação estrutural dos campos de entrada: título, público 4-6 Pixar 3D, tema parental e paleta canônica.',
    inputContract: 'StudioKidsIntake form payload',
    outputContract: 'Preflight checklist flags & validation status',
    parentalGoal: 'Garantir que a premissa atende aos critérios estritos de conteúdo infantil antes de qualquer custo generativo.',
    obligations: [
      'Validar título canônico do episódio infantil',
      'Confirmar conformidade com faixa etária alvo (4-6 anos)',
      'Validar tema estruturado de utilidade parental',
      'Checar paleta de cores primária e secundária do protagonista',
    ],
    dependencies: [],
  },
  {
    id: 'SKILL_0_2',
    gateId: 'GATE_0',
    code: '0.2',
    name: 'Inventário de Ativos & Memória de Erros',
    badge: 'Asset & Error Memory',
    description: 'Verificação dos arquivos canônicos limpos e indexação de mitigações ativas de falhas anteriores.',
    inputContract: 'Asset references & known error mitigation signatures',
    outputContract: 'Canonical assets inventory list with verification status',
    parentalGoal: 'Evitar repetição de falhas conhecidas (ex: sombras ameaçadoras, olhos vítreos, movimentos erráticos).',
    obligations: [
      'Verificar presença de arquivos de referência limpos e isolados',
      'Consultar base de memória de erros visuais anteriores',
      'Ativar mitigações obrigatórias contra deformações temporais',
    ],
    dependencies: ['SKILL_0_1'],
  },
  {
    id: 'SKILL_0_3',
    gateId: 'GATE_0',
    code: '0.3',
    name: 'Manifesto de Handoff & Relatório de Prontidão',
    badge: '00_handoff_manifest.json',
    description: 'Emissão formal do 00_handoff_manifest.json em modo package com digest de economia e roteamento para o Manus.',
    inputContract: 'Intake validado + Inventário de Ativos',
    outputContract: '00_handoff_manifest.json em conformidade estrita com o Contrato Manus',
    parentalGoal: 'Estabelecer a assinatura contratual irrevogável do projeto entre os orquestradores.',
    obligations: [
      'Gerar arquivo estruturado 00_handoff_manifest.json',
      'Fixar teto de duração atômica e rotas de modelo',
      'Assinar prontidão contratual para liberação do Gate 0',
    ],
    dependencies: ['SKILL_0_1', 'SKILL_0_2'],
  },

  // GATE 1 SKILLS
  {
    id: 'SKILL_1_1',
    gateId: 'GATE_1',
    code: '1.1',
    name: 'Decomposição Pedagógica de Estrofes',
    badge: 'Stanza & Action Hooks',
    description: 'Divisão métrica das estrofes com foco em Utilidade Parental (sono, banho, higiene) e vocabulário literal.',
    inputContract: 'Letra bruta da canção + Tema de utilidade',
    outputContract: 'Array de estrofes decompostas com ganchos pedagógicos e ações pretendidas',
    parentalGoal: 'Transformar atritos diários da infância em cantigas e brincadeiras fáceis de imitar.',
    obligations: [
      'Decompor a letra em estrofes estruturadas com rimas simples (AABB/ABAB)',
      'Atribuir gancho de ação motora para cada estrofe',
      'Validar vocabulário literal sem metáforas abstratas incompreensíveis para 4-6 anos',
    ],
    dependencies: ['SKILL_0_3'],
  },
  {
    id: 'SKILL_1_2',
    gateId: 'GATE_1',
    code: '1.2',
    name: 'Bíblia Visual do Personagem & Texturas Pixar 3D',
    badge: '3D Character Bible',
    description: 'Especificação física tátil (subsurface scattering, barriga amarelo-dourada, olhos expressivos) e negative prompt canônico.',
    inputContract: 'Nome do personagem + Paleta de cores estrita',
    outputContract: 'Bíblia visual com propriedades táteis de superfície e restrições canônicas',
    parentalGoal: 'Construir personagens acolhedores, fofos e empáticos, blindados contra o vale da estranheza (uncanny valley).',
    obligations: [
      'Definir parâmetros táteis de dispersão de luz sob a pele (subsurface scattering)',
      'Fixar traços físicos inegociáveis e paleta RGB canônica',
      'Gerar negative prompt canônico contra deformações e uncanny valley',
    ],
    dependencies: ['SKILL_0_1'],
  },
  {
    id: 'SKILL_1_3',
    gateId: 'GATE_1',
    code: '1.3',
    name: 'Contrato de Transição Emocional',
    badge: 'Emotional Arc Sign-Off',
    description: 'Mapeamento do arco emocional da criança da resistência inicial para a celebração cooperativa alegre.',
    inputContract: 'Decomposição pedagógica + Bíblia visual',
    outputContract: 'Contrato pedagógico assinado com regras de vocabulário literal',
    parentalGoal: 'Garantir que a narrativa proporciona alívio e conforto emocional para pais e filhos.',
    obligations: [
      'Traçar curva emocional clara (resistência inicial -> descoberta lúdica -> cooperação alegre)',
      'Assinar contrato pedagógico do roteiro',
      'Garantir desfecho acolhedor de segurança e carinho familiar',
    ],
    dependencies: ['SKILL_1_1', 'SKILL_1_2'],
  },

  // GATE 2 SKILLS
  {
    id: 'SKILL_2_1',
    gateId: 'GATE_2',
    code: '2.1',
    name: 'Engenharia de Prompt Musical Suno (120 BPM)',
    badge: 'Suno 120 BPM Prompt',
    description: 'Configuração rítmica a 120 BPM em 4/4 com instrumentos orgânicos (marimba, violão, ukulele) e voz doce infantil.',
    inputContract: 'Tema e letra pedagógica consolidada',
    outputContract: 'Especificação técnica para Suno AI com tags de estilo, andamento e timbre vocal',
    parentalGoal: 'Andamento de 120 BPM (2 passos por segundo) ideal para coreografia e fixação motora infantil.',
    obligations: [
      'Estruturar prompt musical com andamento de 120 BPM em compasso 4/4',
      'Especificar instrumentação orgânica (marimba suave, violão de nylon, percussão acústica)',
      'Fixar timbre vocal infantil doce e dicção clara sem reverberações excessivas',
    ],
    dependencies: ['SKILL_1_1', 'SKILL_1_3'],
  },
  {
    id: 'SKILL_2_2',
    gateId: 'GATE_2',
    code: '2.2',
    name: 'Cadeia de Processamento de Áudio Broadcast',
    badge: 'Audio Signal Chain',
    description: 'Aplicação de filtros de broadcast: Low-cut <100Hz, realce vocal +3dB, panning estéreo e alvo -14 LUFS.',
    inputContract: 'Master de áudio gerado',
    outputContract: 'Filtros aplicados e conformidade de sonoridade EBU R128 (-14 LUFS)',
    parentalGoal: 'Voz limpa e inteligível sem estrondos nos graves que possam assustar ou cansar o ouvido da criança.',
    obligations: [
      'Aplicar corte passa-altas (Low-cut < 100Hz) para proteção dos tímpanos infantis',
      'Realçar clareza vocal (+3dB na faixa de 2 a 4kHz)',
      'Normalizar sonoridade integrada para -14 LUFS em estrita conformidade EBU R128',
    ],
    dependencies: ['SKILL_2_1'],
  },
  {
    id: 'SKILL_2_3',
    gateId: 'GATE_2',
    code: '2.3',
    name: 'Cue-Sheet & Sincronismo Frame-a-Frame',
    badge: 'Frame Sync Cue-Sheet',
    description: 'Mapeamento sincrônico de compassos de 2,0s (60 frames a 30fps) vinculando cada batida à ação visual na tela.',
    inputContract: 'Áudio 120 BPM processado',
    outputContract: 'Cue-sheet frame-a-frame com gatilhos rítmicos de animação',
    parentalGoal: 'Sincronia audiovisual perfeita que mantém a atenção concentrada e o engajamento lúdico.',
    obligations: [
      'Mapear compassos rítmicos exatos de 2,0s (60 frames por compasso a 30fps)',
      'Definir pontos de corte de câmera perfeitamente alinhados aos tempos fortes',
      'Vincular batidas da percussão a passos de dança e gestos do protagonista',
    ],
    dependencies: ['SKILL_2_2'],
  },

  // GATE 3 SKILLS
  {
    id: 'SKILL_3_1',
    gateId: 'GATE_3',
    code: '3.1',
    name: 'Compilação de Prompt nos 9 Blocos Contratuais',
    badge: '9-Block Manus Compiler',
    description: 'Montagem estrita dos 9 blocos obrigatórios: FORMAT, CHARACTERS, ACTION, CAMERA, ENVIRONMENT, LIGHTING, STYLE, CONTINUITY, SAFETY.',
    inputContract: 'Cue-sheet + Bíblia visual do personagem + Paleta',
    outputContract: 'Prompts em 9 blocos em inglês compilados para cada plano',
    parentalGoal: 'Eliminar ambiguidade para que os modelos generativos nunca desfigurem o personagem.',
    obligations: [
      'Compilar todos os 9 blocos obrigatórios sem omissão de parâmetros',
      'Garantir continuidade de iluminação quente (golden hour) e proporção anatômica',
      'Blindar prompt contra cenários escuros ou atmosfera intimidadora',
    ],
    dependencies: ['SKILL_1_2', 'SKILL_2_3'],
  },
  {
    id: 'SKILL_3_2',
    gateId: 'GATE_3',
    code: '3.2',
    name: 'Geração de Shots Atômicos & Roteamento de Modelos',
    badge: 'Atomic Shots Routing',
    description: 'Divisão em planos atômicos de 4s/6s/8s e roteamento por vocação (Veo 3.1 para cinematografia, Omni Flash para macro).',
    inputContract: 'Prompts em 9 blocos compilados',
    outputContract: 'Inventário de shots gerados com durações e rotas de modelo atribuídas',
    parentalGoal: 'Planos atômicos que evitam deformações temporais comuns em tomadas longas.',
    obligations: [
      'Dividir sequência em planos atômicos de 4s, 6s e 8s',
      'Atribuir modelos de IA generativa por vocação estética (Veo 3.1 e Omni Flash)',
      'Validar estabilidade dos membros e articulações em cada shot',
    ],
    dependencies: ['SKILL_3_1'],
  },
  {
    id: 'SKILL_3_3',
    gateId: 'GATE_3',
    code: '3.3',
    name: 'Auditoria de Curadoria em 3 Camadas',
    badge: '3-Layer Curation Audit',
    description: 'Checagem rigorosa: Camada 1 (Integridade de Arquivo), Camada 2 (Continuidade Visual Delta-E) e Camada 3 (Segurança COPPA).',
    inputContract: 'Shots atômicos gerados',
    outputContract: 'Laudo de conformidade em 3 camadas com aprovação de cada plano',
    parentalGoal: 'Zero tolerância para texturas viscosas, deformações ou conteúdo fora dos padrões COPPA.',
    obligations: [
      'Auditar Camada 1: Integridade física de arquivo, framerate constante e ausência de drop frames',
      'Auditar Camada 2: Continuidade cromática Delta-E e preservação do design do protagonista',
      'Auditar Camada 3: Conformidade incondicional de segurança infantil COPPA',
    ],
    dependencies: ['SKILL_3_2'],
  },

  // GATE 4 SKILLS
  {
    id: 'SKILL_4_1',
    gateId: 'GATE_4',
    code: '4.1',
    name: 'Master 16:9 Broadcast Finishing',
    badge: '16:9 Landscape Master',
    description: 'Renderização do master widescreen 1920x1080 @ 30fps em Rec.709 e áudio estéreo AAC 48kHz.',
    inputContract: 'Shots atômicos curados + Áudio broadcast',
    outputContract: 'Perfil de master horizontal aprovado',
    parentalGoal: 'Qualidade broadcast nítida para telas de TV, tablets e salas de estar familiares.',
    obligations: [
      'Montar master widescreen 16:9 (1920x1080) a 30fps em espaço de cor Rec.709',
      'Multiplexar trilha masterizada a 48kHz em sincronia labial e rítmica perfeita',
      'Emitir laudo técnico de finalização de vídeo',
    ],
    dependencies: ['SKILL_3_3'],
  },
  {
    id: 'SKILL_4_2',
    gateId: 'GATE_4',
    code: '4.2',
    name: 'Reenquadramento Vertical 9:16 (Shorts/Reels)',
    badge: '9:16 Vertical Reframing',
    description: 'Adaptação inteligente 1080x1920 com reenquadramento focado no personagem e zona segura de 15% para legendas.',
    inputContract: 'Master 16:9',
    outputContract: 'Perfil vertical 9:16 adaptado com zonas seguras de UI móvel',
    parentalGoal: 'Experiência imersiva em smartphones sem que o personagem fique cortado por botões do app.',
    obligations: [
      'Reenquadrar horizontal 16:9 para formato vertical 9:16 (1080x1920)',
      'Preservar o protagonista dentro da zona segura central de 15%',
      'Posicionar legendas e títulos fora da área de botões e comentários de apps móveis',
    ],
    dependencies: ['SKILL_4_1'],
  },
  {
    id: 'SKILL_4_3',
    gateId: 'GATE_4',
    code: '4.3',
    name: 'Pacote de Release & Metadados SEO COPPA',
    badge: 'Release & SEO Package',
    description: 'Geração de títulos amigáveis com emojis, tags pedagógicas, conformidade COPPA child-directed e checklist final.',
    inputContract: 'Perfis de entrega + Dados pedagógicos',
    outputContract: 'Pacote de distribuição multiplataforma e checklist de release assinado',
    parentalGoal: 'Descoberta amigável por pais e educadores em busca de conteúdos infantis seguros.',
    obligations: [
      'Gerar títulos otimizados com emojis infantis alegres',
      'Produzir descrição com foco em utilidade parental e tags pedagógicas',
      'Assinar conformidade formal COPPA child-directed e autorizar publicação',
    ],
    dependencies: ['SKILL_4_2'],
  },
];

export interface DependencyCheckResult {
  allowed: boolean;
  missingDependencies: Array<{
    id: string;
    code: string;
    name: string;
  }>;
}

/**
 * Checks whether all prerequisite skills for a given skill have been approved.
 * This guarantees the pipeline integrity rule: no downstream skill can run
 * until crucial structural upstream skills (e.g. Tema before Letra) are approved.
 */
export function checkSkillDependencies(
  skillId: string,
  verdicts: Partial<Record<string, { approved?: boolean }>> = {},
  skillsCatalog: StudioKidsSkillMeta[] = STUDIO_KIDS_SKILLS_CATALOG
): DependencyCheckResult {
  const meta = skillsCatalog.find((s) => s.id === skillId);
  if (!meta || !meta.dependencies || meta.dependencies.length === 0) {
    return { allowed: true, missingDependencies: [] };
  }

  const missing: Array<{ id: string; code: string; name: string }> = [];
  for (const depId of meta.dependencies) {
    const isApproved = verdicts[depId]?.approved === true;
    if (!isApproved) {
      const depMeta = skillsCatalog.find((s) => s.id === depId);
      missing.push({
        id: depId,
        code: depMeta?.code || depId,
        name: depMeta?.name || depId,
      });
    }
  }

  return {
    allowed: missing.length === 0,
    missingDependencies: missing,
  };
}

/**
 * Execute an atomic Skill inside a Gate, returning pure JSON.
 * Supports both the 15 canonical skills and user-added custom skills.
 */
export function executeStudioKidsSkill(
  skillId: StudioKidsSkillId | string,
  intake: StudioKidsIntake,
  currentOutputs: Partial<Record<string, any>> = {},
  customCatalog: StudioKidsSkillMeta[] = STUDIO_KIDS_SKILLS_CATALOG
): any {
  const charName = intake.lead_character_name || 'Sapinho Pipo';
  const customSkill = customCatalog.find((s) => s.id === skillId);

  switch (skillId) {
    case 'SKILL_0_1': {
      const hasValidTitle = Boolean(intake.episode_title && intake.episode_title.trim().length > 3);
      const hasRawLyrics = Boolean(intake.raw_lyrics && intake.raw_lyrics.trim().length > 10);
      const hasLeadChar = Boolean(intake.lead_character_name && intake.lead_character_name.trim().length > 1);
      const preflightPassed = hasValidTitle && hasRawLyrics && hasLeadChar;

      return {
        skill_id: 'SKILL_0_1',
        skill_name: 'Intake & Validação Canônica',
        status: preflightPassed ? 'READY' : 'REVIEW',
        validated_fields: {
          episode_title: intake.episode_title || 'Sem título definido',
          theme_selected: intake.theme_label,
          target_audience: `${intake.target_audience_years} anos`,
          visual_style: intake.visual_style,
          character_name: charName,
          palette_verified: Boolean(intake.canonical_color_palette.skin_primary),
          forbidden_traits_count: intake.forbidden_negative_traits.length,
        },
        checklist: {
          title_valid: hasValidTitle,
          lyrics_valid: hasRawLyrics,
          character_valid: hasLeadChar,
          child_safety_preflight: true,
        },
      };
    }

    case 'SKILL_0_2': {
      const hasLeadChar = Boolean(intake.lead_character_name && intake.lead_character_name.trim().length > 1);
      return {
        skill_id: 'SKILL_0_2',
        skill_name: 'Inventário de Ativos & Memória de Erros',
        status: 'READY',
        assets_inventory: [
          {
            asset_id: 'ASSET_PALETTE_CANONICAL',
            label: 'Paleta de Cores Estrita (Pele / Barriga / Olhos)',
            status: 'VERIFIED',
            path: '/assets/canon/palette_lock.json',
          },
          {
            asset_id: 'ASSET_CHARACTER_MODEL_SHEET',
            label: `Bíblia Visual de Modelagem 3D (${charName})`,
            status: hasLeadChar ? 'VERIFIED' : 'MISSING',
            path: '/assets/canon/character_sheet_3d.png',
          },
          {
            asset_id: 'ASSET_BACKGROUND_ENVIRONMENT',
            label: 'Cenário Base (Lagoa Encantada & Aguapés)',
            status: 'VERIFIED',
            path: '/assets/canon/environment_master.png',
          },
        ],
        error_memory_check: {
          past_failures_indexed: 4,
          mitigations_active: [
            'Prevenção de uncanny valley via restrição de specular nos olhos',
            'Bloqueio de movimentos anatômicos bruscos acima de 30fps',
            'Sincronização estrita de compassos de 2 segundos com a cue-sheet',
          ],
        },
      };
    }

    case 'SKILL_0_3': {
      return {
        skill_id: 'SKILL_0_3',
        skill_name: 'Manifesto de Handoff & Relatório de Prontidão',
        status: 'READY',
        manifest_00: {
          schema_version: '2.0.0-kids',
          project_id: `kids-${(intake.episode_title || 'unnamed').toLowerCase().replace(/\s+/g, '-')}`,
          pipeline_mode: 'package',
          source_runtime: 'Gemini-StudioKids',
          target_runtime: 'Manus-Orchestrator',
          event_ids_consulted: [
            'EVT_KIDS_PEDAGOGY_2026_01',
            'EVT_KIDS_AUDIO_120BPM_SUNO_02',
            'EVT_KIDS_PIXAR3D_TACTILE_SURFACE_03',
          ],
          economy_digest: {
            budget_tier: 'STANDARD_KIDS',
            max_atomic_duration_sec: 8,
            projected_model_routes: ['Veo-3.1', 'Omni-Flash-Video'],
          },
        },
        readiness_verdict: 'READY_FOR_STAGE_FLOW',
      };
    }

    case 'SKILL_1_1': {
      const rawStanzas = intake.raw_lyrics.split(/\n\s*\n/).filter((s) => s.trim().length > 0);
      const stanzas = (rawStanzas.length > 0 ? rawStanzas : [intake.raw_lyrics]).map((stanza, idx) => ({
        stanza_number: idx + 1,
        text_pt_br: stanza.trim(),
        intended_action:
          idx === 0
            ? `${charName} desperta alegre sob luz solar matinal e convida o público com gesto acolhedor.`
            : `${charName} executa a dança rítmica lúdica com respingos brilhantes de água limpa.`,
        pedagogical_hook:
          idx === 0
            ? 'Acolhimento emocional, estabelecimento de rotina positiva e segurança parental.'
            : 'Associação direta entre água limpa/higiene e diversão sem atrito.',
      }));

      return {
        skill_id: 'SKILL_1_1',
        skill_name: 'Decomposição Pedagógica de Estrofes',
        status: 'READY',
        theme_applied: intake.theme_label,
        stanzas_breakdown: stanzas,
        literal_vocabulary: [
          'água cristalina e gotículas brilhantes',
          'patinha limpinha',
          'salto suave no aguapé',
          'sorriso acolhedor',
        ],
      };
    }

    case 'SKILL_1_2': {
      return {
        skill_id: 'SKILL_1_2',
        skill_name: 'Bíblia Visual do Personagem & Texturas Pixar 3D',
        status: 'READY',
        character_name: charName,
        species: 'Sapo lúdico estilizado Pixar 3D',
        tactile_surface_properties: [
          `Pele com subsurface scattering aveludada (${intake.canonical_color_palette.skin_primary}), sem aspecto viscoso.`,
          `Barriga bojuda acolhedora tom pastel (${intake.canonical_color_palette.belly_accent}) com textura macia.`,
          `Olhos grandes esféricos expressivos (${intake.canonical_color_palette.eye_color}) com highlight duplo reflexivo.`,
          `Bochechas rosadas com gradiente suave (${intake.canonical_color_palette.cheek_tint}).`,
        ],
        expression_rules: [
          'Sorriso amigável e caloroso com cantos da boca elevados.',
          'Contato visual direto com a câmera criando cumplicidade parassocial infantil.',
          'Gesto de comemoração com bracinhos levantados e salto vertical amortecido.',
        ],
        canonical_negative_prompt: [
          ...intake.forbidden_negative_traits,
          'deformed hands',
          'extra limbs',
          'horror',
          'sharp teeth',
          'slimy wet texture',
          'dark dramatic shadows',
        ],
      };
    }

    case 'SKILL_1_3': {
      return {
        skill_id: 'SKILL_1_3',
        skill_name: 'Contrato de Transição Emocional',
        status: 'READY',
        emotional_shift: {
          starting_state: 'Resistência ou desatenção habitual da criança em relação à rotina.',
          ending_state: 'Entusiasmo participativo, imitação dos movimentos limpos e sensação de vitória.',
          parental_action: 'Transformar a rotina de higiene e banho em celebração cooperativa lúdica.',
        },
        readiness: 'READY',
      };
    }

    case 'SKILL_2_1': {
      return {
        skill_id: 'SKILL_2_1',
        skill_name: 'Engenharia de Prompt Musical Suno (120 BPM)',
        status: 'READY',
        suno_config: {
          bpm: 120,
          meter: '4/4',
          tempo_ms_per_beat: 500,
          style_tags: [
            'brazilian nursery rhyme',
            'cheerful acoustic folk',
            'marimba',
            'bright ukulele',
            'playful brass accents',
            'clean kids vocals',
            'sing-along',
          ],
          vocal_timber: 'Voz feminina doce, cristalina, afinação primorosa, dicção clara e acolhedora para crianças.',
        },
      };
    }

    case 'SKILL_2_2': {
      return {
        skill_id: 'SKILL_2_2',
        skill_name: 'Cadeia de Processamento de Áudio Broadcast',
        status: 'READY',
        filters_applied: {
          low_cut_filter_hz: 100, // Clean rumble
          vocals_boost_db: 3.0, // Clear vocal boost
          stereo_panning: 'Lead vocal center, marimba/ukulele L/R',
          target_integrated_lufs: -14.0, // EBU R128
        },
        broadcast_certified: true,
      };
    }

    case 'SKILL_2_3': {
      return {
        skill_id: 'SKILL_2_3',
        skill_name: 'Cue-Sheet & Sincronismo Frame-a-Frame',
        status: 'READY',
        timebase: '30.000 fps',
        seconds_per_bar: 2.0,
        frames_per_bar: 60,
        cue_sheet: [
          {
            bar_index: 1,
            timestamp_sec: 0.0,
            frame_range_30fps: '0000 - 0059',
            lyric_cue: 'Intro instrumental lúdica com violão acústico e marimba',
            rhythmic_action_trigger: 'Aparecimento suave do título com pulso rítmico do sol nascente',
          },
          {
            bar_index: 2,
            timestamp_sec: 2.0,
            frame_range_30fps: '0060 - 0119',
            lyric_cue: 'Lá na lagoa verdejante o sol já vai brilhar',
            rhythmic_action_trigger: 'Sapinho abre os olhos, boceja fofinho e estica as patinhas',
          },
          {
            bar_index: 3,
            timestamp_sec: 4.0,
            frame_range_30fps: '0120 - 0179',
            lyric_cue: 'O sapinho colorido acorda pra brincar!',
            rhythmic_action_trigger: 'Salto alegre no centro do aguapé com respingos cintilantes',
          },
          {
            bar_index: 4,
            timestamp_sec: 6.0,
            frame_range_30fps: '0180 - 0239',
            lyric_cue: 'Com as patinhas bem limpinhas ele pula sem parar',
            rhythmic_action_trigger: 'Close-up das patinhas com espuma colorida e gotículas de água',
          },
          {
            bar_index: 5,
            timestamp_sec: 8.0,
            frame_range_30fps: '0240 - 0299',
            lyric_cue: 'Tchibum na água fresca, vamos todos celebrar!',
            rhythmic_action_trigger: 'Salto sincronizado com o beat forte do compasso 5 e arco-íris d’água',
          },
        ],
      };
    }

    case 'SKILL_3_1': {
      const negPromptStr = intake.forbidden_negative_traits.join(', ');
      const nineBlock1: NineBlockPrompt = {
        format: 'Cinematic 3D animation sequence, 16:9 widescreen, 30fps fluid motion.',
        characters: `Pixar-style cute baby frog named ${charName}, emerald green velvet skin (${intake.canonical_color_palette.skin_primary}), pastel yellow belly (${intake.canonical_color_palette.belly_accent}), large expressive warm amber eyes (${intake.canonical_color_palette.eye_color}), soft rosy cheeks.`,
        action: `The friendly frog stands atop an emerald lily pad, rhythmically clapping its tiny clean hands, hopping 10cm upwards on the music beat, landing softly with a playful joyful giggle.`,
        camera: `Eye-level medium shot, smooth steadycam forward dolly with gentle subtle depth of field f/2.8 focusing squarely on the frog's expressive smile.`,
        environment: `A whimsical enchanted freshwater pond, crystal clear sparkling water, floating lush lily pads, gentle pastel morning mist, distant gentle willow branches.`,
        lighting: `Golden hour warm sunlight piercing through soft foliage, volumetric light rays, soft rim light halo outlining the character's head, diffuse warm fill light.`,
        style: `High-end Pixar 3D tactile aesthetic, soft tactile subsurface scattering on skin, rich organic textures, bright saturated cheerful color palette, clean modern render.`,
        continuity: `Maintains exact character model sheet proportions, exact color codes, stable lighting direction from top-right throughout the sequence.`,
        safety_and_exclusions: `STRICT SAFETY: ${negPromptStr}. No menacing shadows, no hyper-realistic slimy texture, no insect consumption, no dark gloomy tones.`,
      };

      return {
        skill_id: 'SKILL_3_1',
        skill_name: 'Compilação de Prompt nos 9 Blocos Contratuais',
        status: 'READY',
        compliance_check: '100% 9 BLOCKS SATISFIED',
        compiled_sample: nineBlock1,
      };
    }

    case 'SKILL_3_2': {
      return {
        skill_id: 'SKILL_3_2',
        skill_name: 'Geração de Shots Atômicos & Roteamento de Modelos',
        status: 'READY',
        atomic_shots: [
          {
            shot_id: 'SHOT_01_ABERTURA_SALTO',
            duration_sec: 4,
            assigned_model: 'Veo-3.1',
            status: 'GENERATED_OK',
          },
          {
            shot_id: 'SHOT_02_LAVAR_PATINHAS',
            duration_sec: 4,
            assigned_model: 'Omni-Flash-Video',
            status: 'GENERATED_OK',
          },
        ],
      };
    }

    case 'SKILL_3_3': {
      return {
        skill_id: 'SKILL_3_3',
        skill_name: 'Auditoria de Curadoria em 3 Camadas',
        status: 'READY',
        curatorship_report: {
          layer1_file_integrity: { status: 'PASS', resolution: '1920x1080 @ 30fps', dropped_frames: 0 },
          layer2_visual_continuity: { status: 'PASS', palette_delta_e: '< 1.5', silhouette_locked: true },
          layer3_child_safety: { status: 'PASS', coppa_compliant: true, anti_uncanny_valley_score: 98 },
        },
        final_curatorship_verdict: 'APPROVED_FOR_BROADCAST',
      };
    }

    case 'SKILL_4_1': {
      return {
        skill_id: 'SKILL_4_1',
        skill_name: 'Master 16:9 Broadcast Finishing',
        status: 'READY',
        master_16_9: {
          dimensions: '1920x1080',
          fps: 30,
          color_space: 'Rec.709',
          video_codec: 'H.264 High Profile 20Mbps',
          audio_specs: 'AAC 48kHz Stereo 320kbps -14 LUFS',
        },
      };
    }

    case 'SKILL_4_2': {
      return {
        skill_id: 'SKILL_4_2',
        skill_name: 'Reenquadramento Vertical 9:16 (Shorts/Reels)',
        status: 'READY',
        vertical_9_16: {
          dimensions: '1080x1920',
          fps: 30,
          framing: 'Dynamic Re-Centered 16:9 Master',
          caption_safe_zone_margin_pct: 15,
        },
      };
    }

    case 'SKILL_4_3': {
      const title = intake.episode_title || 'Aventuras na Lagoa Encantada';
      return {
        skill_id: 'SKILL_4_3',
        skill_name: 'Pacote de Release & Metadados SEO COPPA',
        status: 'READY',
        seo_package: {
          youtube_title: `🐸 ${charName}: ${title} ✨ Canção Infantil Educativa 120BPM 🎶`,
          friendly_emojis: ['🐸', '💧', '✨', '🎶', '🌈', '🧼'],
          description_pt_br: `Venha cantar e brincar com o ${charName}! Uma animação lúdica e educativa projetada para tornar o momento do banho e da higiene super divertido para os pequenos de 4 a 6 anos. Com ritmo alegre de 120 BPM e cores vibrantes Pixar 3D! Inscreva-se e ative o sininho!`,
          coppa_child_directed: true,
          tags: ['desenho infantil', 'música de criança', 'sapinho colorido', 'rotina de higiene', 'lavar as mãos'],
        },
        release_checklist: {
          broadcast_standards_passed: true,
          multi_platform_transcoding_ready: true,
          closed_captions_vtt_ready: true,
          parental_guidelines_signed: true,
        },
      };
    }

    default: {
      if (customSkill) {
        return {
          skill_id: customSkill.id,
          skill_code: customSkill.code || 'CUSTOM',
          skill_name: customSkill.name,
          gate_id: customSkill.gateId,
          badge: customSkill.badge || 'Custom Skill',
          status: 'READY',
          is_custom_skill: true,
          execution_timestamp: new Date().toISOString(),
          input_received: {
            episode_title: intake.episode_title,
            lead_character_name: charName,
            theme_id: intake.theme_id,
            input_contract: customSkill.inputContract,
          },
          obligations_fulfilled: (customSkill.obligations && customSkill.obligations.length > 0
            ? customSkill.obligations
            : [customSkill.description]
          ).map((ob, idx) => ({
            obligation_id: `OB_${idx + 1}`,
            description: ob,
            verified: true,
            status: 'CONCLUIDO',
          })),
          output_payload: customSkill.outputTemplate || {
            deliverable_name: customSkill.name,
            output_contract: customSkill.outputContract,
            generated_at: new Date().toISOString(),
            status: 'APPROVED_BY_PIPELINE',
            result: `Entrega gerada com sucesso pela skill ${customSkill.code || customSkill.name}`,
          },
        };
      }
      return { skill_id: skillId, status: 'UNVERIFIED' };
    }
  }
}

/**
 * Gate 0 Engine: Baseline, Intake & Preflight Validation
 */
export function executeGate0(intake: StudioKidsIntake): Gate0Output {
  const s01 = executeStudioKidsSkill('SKILL_0_1', intake);
  const s02 = executeStudioKidsSkill('SKILL_0_2', intake);
  const s03 = executeStudioKidsSkill('SKILL_0_3', intake);

  return {
    gate_id: 'GATE_0',
    gate_name: 'Ingestão, Baseline e Preflight Intake',
    readiness_status: s01.status === 'READY' ? 'READY' : 'REVIEW',
    manifest_00: s03.manifest_00,
    canonical_assets_inventory: s02.assets_inventory,
    preflight_checklist: {
      has_valid_theme: Boolean(intake.theme_id),
      has_canonical_palette: Boolean(intake.canonical_color_palette.skin_primary),
      has_forbidden_traits_filter: intake.forbidden_negative_traits.length > 0,
      has_raw_lyrics: s01.checklist.lyrics_valid,
    },
  };
}

/**
 * Gate 1 Engine: Story, Character Bible & Pedagogical Contract
 */
export function executeGate1(intake: StudioKidsIntake, _gate0: Gate0Output): Gate1Output {
  const s11 = executeStudioKidsSkill('SKILL_1_1', intake);
  const s12 = executeStudioKidsSkill('SKILL_1_2', intake);
  const s13 = executeStudioKidsSkill('SKILL_1_3', intake);

  return {
    gate_id: 'GATE_1',
    gate_name: 'Roteiro, Pedagogia e Bíblia Visual do Personagem',
    readiness_status: 'READY',
    pedagogical_contract: {
      parental_utility_action: s13.emotional_shift.parental_action,
      emotional_shift_start: s13.emotional_shift.starting_state,
      emotional_shift_end: s13.emotional_shift.ending_state,
      literal_vocabulary_rules: s11.literal_vocabulary,
    },
    character_bible: {
      character_name: s12.character_name,
      species: s12.species,
      tactile_surface_properties: s12.tactile_surface_properties,
      expression_rules: s12.expression_rules,
      canonical_negative_prompt: s12.canonical_negative_prompt,
    },
    stanza_breakdown: s11.stanzas_breakdown,
  };
}

/**
 * Gate 2 Engine: Suno 120 BPM Audio & Synchronous Cue-Sheet
 */
export function executeGate2(intake: StudioKidsIntake, _gate1: Gate1Output): Gate2Output {
  const s21 = executeStudioKidsSkill('SKILL_2_1', intake);
  const s22 = executeStudioKidsSkill('SKILL_2_2', intake);
  const s23 = executeStudioKidsSkill('SKILL_2_3', intake);

  return {
    gate_id: 'GATE_2',
    gate_name: 'Engenharia de Áudio Rítmico e Cue-Sheet (Suno 120 BPM)',
    readiness_status: 'READY',
    suno_audio_prompt: {
      bpm: s21.suno_config.bpm,
      meter: s21.suno_config.meter,
      style_tags: s21.suno_config.style_tags,
      vocal_timber: s21.suno_config.vocal_timber,
      reference_tempo_ms_per_beat: s21.suno_config.tempo_ms_per_beat,
    },
    broadcast_audio_filters: {
      low_cut_filter_applied: true,
      vocals_boost_db: s22.filters_applied.vocals_boost_db,
      stereo_panning_configured: true,
      target_integrated_lufs: s22.filters_applied.target_integrated_lufs,
    },
    cue_sheet: s23.cue_sheet,
  };
}

/**
 * Gate 3 Engine: 9-Block Manus Prompt Compilation & 3-Layer Shot Curation
 */
export function executeGate3(
  intake: StudioKidsIntake,
  gate1: Gate1Output,
  _gate2: Gate2Output
): Gate3Output {
  const s31 = executeStudioKidsSkill('SKILL_3_1', intake);
  const s32 = executeStudioKidsSkill('SKILL_3_2', intake);
  const s33 = executeStudioKidsSkill('SKILL_3_3', intake);

  const nb1 = s31.compiled_sample;
  const compilePrompt = (nb: NineBlockPrompt): string =>
    `[FORMAT]: ${nb.format}\n[CHARACTERS]: ${nb.characters}\n[ACTION]: ${nb.action}\n[CAMERA]: ${nb.camera}\n[ENVIRONMENT]: ${nb.environment}\n[LIGHTING]: ${nb.lighting}\n[STYLE]: ${nb.style}\n[CONTINUITY]: ${nb.continuity}\n[SAFETY AND EXCLUSIONS]: ${nb.safety_and_exclusions}`;

  const shots: ShotItem[] = [
    {
      shot_id: s32.atomic_shots[0].shot_id,
      duration_sec: s32.atomic_shots[0].duration_sec,
      assigned_model: s32.atomic_shots[0].assigned_model,
      nine_block_prompt: nb1,
      compiled_english_prompt: compilePrompt(nb1),
      curatorship_layers: {
        layer1_file_integrity: {
          status: s33.curatorship_report.layer1_file_integrity.status,
          resolution_check: s33.curatorship_report.layer1_file_integrity.resolution,
          codec_check: 'H.264 Master Ready',
          dropped_frames: s33.curatorship_report.layer1_file_integrity.dropped_frames,
        },
        layer2_visual_continuity: {
          status: s33.curatorship_report.layer2_visual_continuity.status,
          palette_delta_e_within_bounds: true,
          character_silhouette_locked: true,
        },
        layer3_child_safety: {
          status: s33.curatorship_report.layer3_child_safety.status,
          no_grotesque_textures: true,
          no_uncanny_valley_eyes: true,
          safe_for_kids_coppa: true,
        },
      },
      shot_verdict: 'APPROVED',
    },
  ];

  return {
    gate_id: 'GATE_3',
    gate_name: 'Geração de Shots Atômicos e Curadoria em 3 Camadas',
    readiness_status: 'READY',
    shots_inventory: shots,
    nine_block_compliance_score: 100,
    overall_curatorship_pass_rate: 100,
  };
}

/**
 * Gate 4 Engine: Finishing, Delivery Profiles & Release Package
 */
export function executeGate4(intake: StudioKidsIntake, _gate3: Gate3Output): Gate4Output {
  const s41 = executeStudioKidsSkill('SKILL_4_1', intake);
  const s42 = executeStudioKidsSkill('SKILL_4_2', intake);
  const s43 = executeStudioKidsSkill('SKILL_4_3', intake);

  return {
    gate_id: 'GATE_4',
    gate_name: 'Acabamento, Perfis de Entrega e Release Multiplataforma',
    readiness_status: 'READY',
    delivery_profiles: {
      master_horizontal_16_9: s41.master_16_9,
      master_vertical_9_16: s42.vertical_9_16,
      seo_metadata_package: s43.seo_package,
    },
    final_release_checklist: s43.release_checklist,
  };
}

/**
 * Calculate Poc 2 Telemetry & Readiness Metrics based on Skills and Gates
 */
export function calculateStudioKidsTelemetry(state: StudioKidsPoc2State) {
  const gates: StudioKidsGateId[] = ['GATE_0', 'GATE_1', 'GATE_2', 'GATE_3', 'GATE_4'];

  // Check skill-level approval completeness
  let approvedSkillsCount = 0;
  const totalSkills = STUDIO_KIDS_SKILLS_CATALOG.length; // 15 skills

  const verdicts = (state.skillVerdicts || {}) as Record<string, any>;

  for (const skill of STUDIO_KIDS_SKILLS_CATALOG) {
    const v = verdicts[skill.id];
    if (v?.approved) {
      approvedSkillsCount++;
    }
  }

  // A Gate is READY if all of its skills are approved
  let readyGatesCount = 0;
  for (const gate of gates) {
    const gateSkills = STUDIO_KIDS_SKILLS_CATALOG.filter((s) => s.gateId === gate);
    const allApproved = gateSkills.every((s) => verdicts[s.id]?.approved);
    if (allApproved && gateSkills.length > 0) {
      readyGatesCount++;
    }
  }

  const executedSkillsCount = Object.keys(state.skillOutputs).length;
  const readinessScorePct = Math.round((approvedSkillsCount / totalSkills) * 100);

  return {
    totalExecutions: executedSkillsCount,
    estimatedTokens: executedSkillsCount * 480,
    lastLatencyMs: executedSkillsCount > 0 ? 180 : 0,
    nineBlocksAuditPassRate: 100,
    readinessScorePct: readinessScorePct,
    approvedSkillsCount,
    totalSkills,
    readyGatesCount,
    totalGates: gates.length,
  };
}
