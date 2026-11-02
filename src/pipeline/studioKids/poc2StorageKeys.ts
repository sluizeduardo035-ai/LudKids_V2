/**
 * POC 2 Produtora Kids - Exclusive Storage Keys
 * Completely isolated namespace preventing any data sharing or collision
 * with previous POCs or legacy app environments.
 */

export const POC2_STORAGE_KEYS = {
  GEMINI_API_KEY: 'poc2_produtora_gemini_api_key_v1',
  SETTINGS: 'poc2_produtora_settings_v1',
  SKILLS_CATALOG: 'poc2_produtora_skills_catalog_v1',
  GATE_ORDER: 'poc2_produtora_gate_order_v1',
  SKILL_ORDER: 'poc2_produtora_skill_order_v1',
  INTAKE: 'poc2_produtora_intake_v1',
  OUTPUTS: 'poc2_produtora_outputs_v1',
  VERDICTS: 'poc2_produtora_verdicts_v1',
} as const;
