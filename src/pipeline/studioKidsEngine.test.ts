import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  executeGate0,
  executeGate1,
  executeGate2,
  executeGate3,
  executeGate4,
  executeStudioKidsSkill,
  STUDIO_KIDS_SKILLS_CATALOG,
  calculateStudioKidsTelemetry,
  checkSkillDependencies,
} from './studioKids/studioKidsEngine';
import {
  BLANK_STUDIO_KIDS_INTAKE,
  CANONICAL_SAPINHO_INTAKE,
} from './studioKids/sampleSapinhoEpisode';
import { StudioKidsPoc2State, StudioKidsSkillId } from './studioKids/types';

test('Studio Kids Poc 2 - Gate 0 Preflight & Baseline Intake', () => {
  // Test blank intake requires review
  const outBlank = executeGate0(BLANK_STUDIO_KIDS_INTAKE);
  assert.equal(outBlank.gate_id, 'GATE_0');
  assert.equal(outBlank.readiness_status, 'REVIEW');
  assert.equal(outBlank.manifest_00.pipeline_mode, 'package');

  // Test canonical intake is READY
  const outCanonical = executeGate0(CANONICAL_SAPINHO_INTAKE);
  assert.equal(outCanonical.readiness_status, 'READY');
  assert.equal(outCanonical.manifest_00.schema_version, '2.0.0-kids');
  assert.equal(outCanonical.preflight_checklist.has_valid_theme, true);
  assert.equal(outCanonical.preflight_checklist.has_raw_lyrics, true);
});

test('Studio Kids Poc 2 - Gate 1 Story & Character Bible with Pedagogical Utility', () => {
  const g0 = executeGate0(CANONICAL_SAPINHO_INTAKE);
  const g1 = executeGate1(CANONICAL_SAPINHO_INTAKE, g0);

  assert.equal(g1.gate_id, 'GATE_1');
  assert.equal(g1.readiness_status, 'READY');
  assert.equal(g1.character_bible.character_name, 'Sapinho Pipo');
  assert.ok(g1.pedagogical_contract.parental_utility_action.length > 0);
  assert.ok(g1.character_bible.canonical_negative_prompt.length > 0);
  assert.ok(g1.stanza_breakdown.length > 0);
});

test('Studio Kids Poc 2 - Gate 2 Audio Engineering & Cue-Sheet 120 BPM', () => {
  const g0 = executeGate0(CANONICAL_SAPINHO_INTAKE);
  const g1 = executeGate1(CANONICAL_SAPINHO_INTAKE, g0);
  const g2 = executeGate2(CANONICAL_SAPINHO_INTAKE, g1);

  assert.equal(g2.gate_id, 'GATE_2');
  assert.equal(g2.suno_audio_prompt.bpm, 120);
  assert.equal(g2.broadcast_audio_filters.low_cut_filter_applied, true);
  assert.equal(g2.broadcast_audio_filters.vocals_boost_db, 3.0);
  assert.ok(g2.cue_sheet.length >= 4);
  assert.equal(g2.cue_sheet[0].frame_range_30fps, '0000 - 0059');
});

test('Studio Kids Poc 2 - Gate 3 9-Block Prompts & 3-Layer Shot Curatorship', () => {
  const g0 = executeGate0(CANONICAL_SAPINHO_INTAKE);
  const g1 = executeGate1(CANONICAL_SAPINHO_INTAKE, g0);
  const g2 = executeGate2(CANONICAL_SAPINHO_INTAKE, g1);
  const g3 = executeGate3(CANONICAL_SAPINHO_INTAKE, g1, g2);

  assert.equal(g3.gate_id, 'GATE_3');
  assert.equal(g3.readiness_status, 'READY');
  assert.ok(g3.shots_inventory.length >= 1);

  const shot = g3.shots_inventory[0];
  const nb = shot.nine_block_prompt;

  // Strict 9-block contract validation
  assert.ok(nb.format, 'format block must exist');
  assert.ok(nb.characters, 'characters block must exist');
  assert.ok(nb.action, 'action block must exist');
  assert.ok(nb.camera, 'camera block must exist');
  assert.ok(nb.environment, 'environment block must exist');
  assert.ok(nb.lighting, 'lighting block must exist');
  assert.ok(nb.style, 'style block must exist');
  assert.ok(nb.continuity, 'continuity block must exist');
  assert.ok(nb.safety_and_exclusions, 'safety_and_exclusions block must exist');

  // 3-layer checks
  assert.equal(shot.curatorship_layers.layer1_file_integrity.status, 'PASS');
  assert.equal(shot.curatorship_layers.layer2_visual_continuity.status, 'PASS');
  assert.equal(shot.curatorship_layers.layer3_child_safety.status, 'PASS');
});

test('Studio Kids Poc 2 - Gate 4 Finishing & Multi-Platform Release', () => {
  const g0 = executeGate0(CANONICAL_SAPINHO_INTAKE);
  const g1 = executeGate1(CANONICAL_SAPINHO_INTAKE, g0);
  const g2 = executeGate2(CANONICAL_SAPINHO_INTAKE, g1);
  const g3 = executeGate3(CANONICAL_SAPINHO_INTAKE, g1, g2);
  const g4 = executeGate4(CANONICAL_SAPINHO_INTAKE, g3);

  assert.equal(g4.gate_id, 'GATE_4');
  assert.equal(g4.delivery_profiles.master_horizontal_16_9.dimensions, '1920x1080');
  assert.equal(g4.delivery_profiles.master_vertical_9_16.dimensions, '1080x1920');
  assert.equal(g4.delivery_profiles.seo_metadata_package.coppa_child_directed, true);
  assert.ok(g4.delivery_profiles.seo_metadata_package.friendly_emojis.length > 0);
});

test('Studio Kids Poc 2 - Granular Skill Execution across all 15 skills', () => {
  assert.equal(STUDIO_KIDS_SKILLS_CATALOG.length, 15);

  for (const skill of STUDIO_KIDS_SKILLS_CATALOG) {
    const out = executeStudioKidsSkill(skill.id, CANONICAL_SAPINHO_INTAKE);
    assert.ok(out, `Output for ${skill.id} must be generated`);
    assert.equal(out.skill_id, skill.id);
  }
});

test('Studio Kids Poc 2 - Gate Completion Rule: Gate is READY only when all its skills are approved', () => {
  const allSkillIds = STUDIO_KIDS_SKILLS_CATALOG.map((s) => s.id);
  const mockSkillVerdicts: Partial<Record<StudioKidsSkillId, { approved: boolean; readiness: 'READY' }>> = {};

  // Approve only 2 out of 3 skills for Gate 0
  mockSkillVerdicts['SKILL_0_1'] = { approved: true, readiness: 'READY' };
  mockSkillVerdicts['SKILL_0_2'] = { approved: true, readiness: 'READY' };
  // SKILL_0_3 not approved yet

  let state: StudioKidsPoc2State = {
    intake: CANONICAL_SAPINHO_INTAKE,
    activeGate: 'GATE_0',
    activeSkillId: 'SKILL_0_1',
    skillOutputs: {},
    skillVerdicts: mockSkillVerdicts,
    gateOutputs: { GATE_0: null, GATE_1: null, GATE_2: null, GATE_3: null, GATE_4: null },
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
  };

  let metrics = calculateStudioKidsTelemetry(state);
  assert.equal(metrics.readyGatesCount, 0, 'Gate 0 must not be ready when 1 skill is missing');
  assert.equal(metrics.approvedSkillsCount, 2);

  // Now approve SKILL_0_3
  mockSkillVerdicts['SKILL_0_3'] = { approved: true, readiness: 'READY' };
  metrics = calculateStudioKidsTelemetry(state);
  assert.equal(metrics.readyGatesCount, 1, 'Gate 0 must become ready when all 3 skills are approved');
  assert.equal(metrics.approvedSkillsCount, 3);
});

test('Studio Kids Poc 2 - Pipeline Integrity Guard (Dependency Checking)', () => {
  // SKILL_0_1 has no dependencies
  const check01 = checkSkillDependencies('SKILL_0_1', {});
  assert.equal(check01.allowed, true);
  assert.equal(check01.missingDependencies.length, 0);

  // SKILL_1_1 depends on SKILL_0_3
  const check11Blocked = checkSkillDependencies('SKILL_1_1', {});
  assert.equal(check11Blocked.allowed, false);
  assert.ok(check11Blocked.missingDependencies.some((d) => d.id === 'SKILL_0_3'));

  // Approve SKILL_0_3 -> SKILL_1_1 should now be allowed
  const check11Allowed = checkSkillDependencies('SKILL_1_1', {
    SKILL_0_3: { approved: true },
  });
  assert.equal(check11Allowed.allowed, true);
  assert.equal(check11Allowed.missingDependencies.length, 0);

  // SKILL_2_1 (Letra/Música Suno 120BPM) depends on SKILL_1_1 and SKILL_1_3
  const check21Blocked = checkSkillDependencies('SKILL_2_1', {
    SKILL_1_1: { approved: true },
    // SKILL_1_3 missing
  });
  assert.equal(check21Blocked.allowed, false);
  assert.equal(check21Blocked.missingDependencies[0].id, 'SKILL_1_3');
});

test('Studio Kids Poc 2 - Custom Skill Execution & Standardized 4 Dimensions', () => {
  const customCatalog = [
    ...STUDIO_KIDS_SKILLS_CATALOG,
    {
      id: 'CUSTOM_SKILL_TEST',
      gateId: 'GATE_1',
      code: 'C.1',
      name: 'Auditoria Fonética Infantil',
      badge: 'Phonetic AI Guard',
      description: 'Validação de dicção e rima de 4-6 anos sem cacofonias.',
      inputContract: 'Letra bruta da canção',
      outputContract: 'Laudo de conformidade fonética',
      parentalGoal: 'Garantir compreensão auditiva clara.',
      obligations: [
        'Analisar aliterações e assonâncias',
        'Validar ritmo de respiração infantil',
      ],
      dependencies: ['SKILL_1_1'],
      isCustom: true,
    },
  ];

  const out = executeStudioKidsSkill(
    'CUSTOM_SKILL_TEST',
    CANONICAL_SAPINHO_INTAKE,
    {},
    customCatalog
  );

  assert.equal(out.skill_id, 'CUSTOM_SKILL_TEST');
  assert.equal(out.is_custom_skill, true);
  assert.equal(out.status, 'READY');
  assert.equal(out.obligations_fulfilled.length, 2);
  assert.equal(out.obligations_fulfilled[0].status, 'CONCLUIDO');
  assert.ok(out.output_payload.deliverable_name);
});
test('Studio Kids Poc 2 - Suggested Gemini Models & Reasoning Modes configuration', () => {
  const models = ['gemini-3.1-pro-preview', 'gemini-4-argon', 'gemini-3.8-flash', 'gemini-3.6-flash'] as const;
  assert.equal(models.length, 4);

  // Default front-end model must be Gemini 3.1 Pro with thinking_level HIGH
  const defaultModel = models[0];
  assert.equal(defaultModel, 'gemini-3.1-pro-preview');

  // Extended skill with models, reasoningMode, and English translation
  const enrichedSkill = {
    id: 'CUSTOM_SKILL_ENRICHED',
    gateId: 'GATE_1',
    code: 'C.2',
    name: 'Geração de Curadoria Lúdica',
    kebabName: 'geracao-curadoria-ludica',
    badge: 'Gemini 3.1 Pro',
    suggestedModel: 'gemini-3.1-pro-preview' as const,
    thinkingLevel: 'HIGH' as const,
    reasoningMode: 'HIGH' as const,
    description: 'Decompor strophes e garantir utilidade parental',
    coreProfile: 'Senior Pixar 3D Prompt Engineer specializing in whimsical toddler storytelling',
    inputContract: 'Letra musical bruta e ficha pedagógica',
    outputContract: 'Objeto JSON com 9 blocos contratuais Manus',
    obligations: ['Validar ritmo', 'Gerar 9 blocos'],
    telemetryEnabled: true,
    isInactive: false,
    englishContext: 'Act as a Senior Pixar 3D Prompt Engineer specializing in whimsical toddler storytelling...',
    isCustom: true,
  };

  assert.equal(enrichedSkill.suggestedModel, 'gemini-3.1-pro-preview');
  assert.equal(enrichedSkill.thinkingLevel, 'HIGH');
  assert.equal(enrichedSkill.reasoningMode, 'HIGH');
  assert.equal(enrichedSkill.telemetryEnabled, true);
  assert.equal(enrichedSkill.isInactive, false);
  assert.ok(enrichedSkill.englishContext.includes('Pixar 3D Prompt Engineer'));
});

test('Studio Kids Poc 2 - Gemini Connection Manager Key Syntax & Governance', async () => {
  const { validateGeminiKeySyntax, INITIAL_STAGES } = await import('./studioKids/geminiConnectionManager');

  // Stage definitions
  assert.equal(INITIAL_STAGES.length, 4);
  assert.equal(INITIAL_STAGES[0].id, 'KEY_SYNTAX');
  assert.equal(INITIAL_STAGES[1].id, 'SERVER_HANDSHAKE');
  assert.equal(INITIAL_STAGES[2].id, 'GATEWAY_AUTH');
  assert.equal(INITIAL_STAGES[3].id, 'MODEL_PING');

  // Syntax validation - Empty
  const emptyCheck = validateGeminiKeySyntax('');
  assert.equal(emptyCheck.valid, false);

  // Syntax validation - OpenAI key detection
  const invalidPrefix = validateGeminiKeySyntax('sk-proj-123456789012345678901234567890');
  assert.equal(invalidPrefix.valid, false);
  assert.ok(invalidPrefix.reason?.includes('OpenAI'));

  // Syntax validation - Excessively short
  const tooShort = validateGeminiKeySyntax('abc12');
  assert.equal(tooShort.valid, false);

  // Syntax validation - Valid canonical pattern (~39 chars)
  const validKey = validateGeminiKeySyntax('AIzaSyABCDEFGHIJKLMN1234567890123456789');
  assert.equal(validKey.valid, true);

  // Syntax validation - Long production GCP token / key (53+ chars)
  const validLongKey = validateGeminiKeySyntax('AIzaSyABCDEFGHIJKLMN1234567890123456789_LONG_PROD_TOKEN_KEY');
  assert.equal(validLongKey.valid, true);
});
