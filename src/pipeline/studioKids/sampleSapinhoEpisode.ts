import { StudioKidsIntake } from './types';

/**
 * Blank Intake State for initial fresh testing in Poc 2
 */
export const BLANK_STUDIO_KIDS_INTAKE: StudioKidsIntake = {
  episode_title: '',
  theme_id: 'THEME_09_HIGIENE_LAVAR_MAOS',
  theme_label: 'Higiene & Rotina Saudável',
  target_audience_years: '4-6',
  visual_style: '3D_PIXAR_TACTILE',
  raw_lyrics: '',
  lead_character_name: '',
  canonical_color_palette: {
    skin_primary: '#4ADE80',
    belly_accent: '#FEF08A',
    eye_color: '#B45309',
    cheek_tint: '#F472B6',
  },
  forbidden_negative_traits: [
    'verrugas ou textura repulsiva',
    'olhos hiper-realistas assustadores',
    'ambientes escuros ou ameaçadores',
    'proporções anatômicas de anfíbio real',
  ],
};

/**
 * Canonical Preset: "O Sapinho Colorido na Lagoa Encantada"
 * Directly extracted from Manual Operacional & Guia Consolidado Studio Kids.
 */
export const CANONICAL_SAPINHO_INTAKE: StudioKidsIntake = {
  episode_title: 'O Sapinho Colorido na Lagoa Encantada',
  theme_id: 'THEME_09_HIGIENE_LAVAR_MAOS',
  theme_label: 'Higiene & Brincadeira da Água Limpa',
  target_audience_years: '4-6',
  visual_style: '3D_PIXAR_TACTILE',
  raw_lyrics: `(Estrofe 1)
Lá na lagoa verdejante o sol já vai brilhar,
O sapinho colorido acorda pra brincar!
Com as patinhas bem limpinhas ele pula sem parar,
Tchibum na água fresca, vamos todos celebrar!

(Refrão)
Pula, pula, sapinho, plic, ploc no aguapé!
Lava a mão, lava a patinha, lava a ponta do seu pé!
A água limpa brilha, a borboleta vem dançar,
No reino encantado é hora de cantar!`,
  lead_character_name: 'Sapinho Pipo',
  canonical_color_palette: {
    skin_primary: '#48BB78', // Verde folha vibrante
    belly_accent: '#F6E05E', // Amarelo dourado suave
    eye_color: '#975A16', // Castanho dourado expressivo
    cheek_tint: '#F687B3', // Bochechas rosadas suaves
  },
  forbidden_negative_traits: [
    'pele verrugosa ou enrugada',
    'língua longa viscosa com inseto',
    'olhos vítreos sem pupila ou olhar distante',
    'lama escura fétida ou água turva',
    'movimento errático ou agressivo',
  ],
};
