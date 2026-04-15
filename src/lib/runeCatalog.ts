import { RuneEffect, RuneAnchor } from "../types";

export const RUNE_POTENCIAS = [
  "Mundano", "Mínimo", "Ínfimo", "Inferior", "Irregular",
  "Regular", "Superior", "Colossal", "Máximo", "Supremo"
] as const;

export type PotenciaName = typeof RUNE_POTENCIAS[number];

export interface RuneCatalogEntry {
  baseName: string;
  anchor: RuneAnchor;
  category: string; // 'Proteção', 'Combate', 'Ambiental'
  color: string;    // Tailwind color class prefix
  icon: string;     // Emoji icon
  weight: number;
  getPotenciaEffect: (potenciaIndex: number) => RuneEffect;
}

// ── Helper builders ──────────────────────────────────────────────────────────

const conservacaoVidaVals    = [10,20,30,40,50,60,70,80,90,100];
const preservacaoDefVals     = [10,20,30,40,50,60,70,80,90,100];
const destruicaoMultVals     = [1.5,2,3,4,5,6,7,8,9,10];
const morteChanceVals        = [5,10,15,20,25,30,35,40,45,50];
const alvoradaLuxVals        = [100,300,400,400,500,600,700,800,900,1000];
const crepusculoLuxVals      = [1000,2000,3000,4000,5000,6000,7000,8000,9000,10000];
const aquecimentoObjTempVals = [1,2,3,4,5,6,7,8,9,10];
const aquecimentoSerTempVals = [5,10,15,20,25,30,35,40,45,50];
const resfriObjTempVals      = [1,2,3,4,5,6,7,8,9,10];
const resfriSerTempVals      = [2,5,7,10,12,15,17,20,22,25];

// ── Catalog Entries ──────────────────────────────────────────────────────────

export const RUNE_CATALOG: RuneCatalogEntry[] = [

  // ── 1. Conservação (Ser) ─────────────────────────────────────────────
  {
    baseName: "Runa da Conservação",
    anchor: "Ser",
    category: "Proteção",
    color: "emerald",
    icon: "🌿",
    weight: 0,
    getPotenciaEffect: (i) => ({
      type: "status_percent",
      target: "vida",
      value: conservacaoVidaVals[i],
      unit: "%",
      description: `Vida Máxima +${conservacaoVidaVals[i]}%`,
    }),
  },

  // ── 1.1 Conservação (Objeto) ─────────────────────────────────────────
  {
    baseName: "Runa da Conservação",
    anchor: "Objeto",
    category: "Proteção",
    color: "emerald",
    icon: "🌿",
    weight: 0,
    getPotenciaEffect: (i) => ({
      type: "status_percent", // informational for objects
      target: "durabilidade",
      value: conservacaoVidaVals[i],
      unit: "%",
      description: `Durabilidade +${conservacaoVidaVals[i]}%`,
    }),
  },

  // ── 2. Preservação (Ser) ─────────────────────────────────────────────
  {
    baseName: "Runa da Preservação",
    anchor: "Ser",
    category: "Proteção",
    color: "cyan",
    icon: "🛡️",
    weight: 0,
    getPotenciaEffect: (i) => ({
      type: "derived_percent",
      target: "Defesa Universal",
      value: preservacaoDefVals[i],
      unit: "%",
      description: `Defesa Universal +${preservacaoDefVals[i]}%`,
    }),
  },

  // ── 2.2 Preservação (Objeto) ─────────────────────────────────────────
  {
    baseName: "Runa da Preservação",
    anchor: "Objeto",
    category: "Proteção",
    color: "cyan",
    icon: "🛡️",
    weight: 0,
    getPotenciaEffect: (i) => ({
      type: "derived_percent",
      target: "Defesa Universal",
      value: preservacaoDefVals[i],
      unit: "%",
      description: `Defesa Universal +${preservacaoDefVals[i]}%`,
    }),
  },

  // ── 3. Destruição (Ser) ──────────────────────────────────────────────
  {
    baseName: "Runa da Destruição",
    anchor: "Ser",
    category: "Combate",
    color: "red",
    icon: "💥",
    weight: 0,
    getPotenciaEffect: (i) => ({
      type: "damage_mult_objects",
      target: "objetos",
      value: destruicaoMultVals[i],
      unit: "x",
      description: `Ataques Desarmados causam Dano ×${destruicaoMultVals[i]} a Objetos`,
    }),
  },

  // ── 3.1 Destruição (Objeto) ──────────────────────────────────────────
  {
    baseName: "Runa da Destruição",
    anchor: "Objeto",
    category: "Combate",
    color: "red",
    icon: "💥",
    weight: 0,
    getPotenciaEffect: (i) => ({
      type: "damage_mult_objects",
      target: "objetos",
      value: destruicaoMultVals[i],
      unit: "x",
      description: `Ataques com o Objeto causam Dano ×${destruicaoMultVals[i]} a Objetos`,
    }),
  },

  // ── 4. Morte (Ser) ───────────────────────────────────────────────────
  {
    baseName: "Runa da Morte",
    anchor: "Ser",
    category: "Combate",
    color: "violet",
    icon: "💀",
    weight: 0,
    getPotenciaEffect: (i) => ({
      type: "kill_chance",
      target: "seres inferiores",
      value: morteChanceVals[i],
      unit: "%",
      description: `Ataques Desarmados têm ${morteChanceVals[i]}% de chance de matar seres cujo Nível de Perigo seja inferior ao Nível Total do portador`,
    }),
  },

  // ── 4.1 Morte (Objeto) ───────────────────────────────────────────────
  {
    baseName: "Runa da Morte",
    anchor: "Objeto",
    category: "Combate",
    color: "violet",
    icon: "💀",
    weight: 0,
    getPotenciaEffect: (i) => ({
      type: "kill_chance",
      target: "seres inferiores",
      value: morteChanceVals[i],
      unit: "%",
      description: `Ataques com o Objeto têm ${morteChanceVals[i]}% de chance de matar seres cujo Nível de Perigo seja inferior ao Nível Total do portador`,
    }),
  },

  // ── 5. Alvorada (Ser) ────────────────────────────────────────────────
  {
    baseName: "Runa da Alvorada",
    anchor: "Ser",
    category: "Ambiental",
    color: "yellow",
    icon: "☀️",
    weight: 0,
    getPotenciaEffect: (i) => ({
      type: "aura_light_up",
      target: "luminosidade",
      value: alvoradaLuxVals[i],
      unit: "lux",
      radius: 5,
      description: `Aumenta Sobrenaturalmente em até ${alvoradaLuxVals[i].toLocaleString('pt-BR')} Lux em raio de 5 m`,
    }),
  },

  // ── 5.1 Alvorada (Objeto) ────────────────────────────────────────────
  {
    baseName: "Runa da Alvorada",
    anchor: "Objeto",
    category: "Ambiental",
    color: "yellow",
    icon: "☀️",
    weight: 0,
    getPotenciaEffect: (i) => ({
      type: "object_light_up",
      target: "luminosidade",
      value: alvoradaLuxVals[i],
      unit: "lux",
      radius: 5,
      description: `Aumenta Sobrenaturalmente em até ${alvoradaLuxVals[i].toLocaleString('pt-BR')} Lux em raio de 5 m`,
    }),
  },

  // ── 6. Crepúsculo (Ser) ──────────────────────────────────────────────
  {
    baseName: "Runa do Crepúsculo",
    anchor: "Ser",
    category: "Ambiental",
    color: "indigo",
    icon: "🌑",
    weight: 0,
    getPotenciaEffect: (i) => ({
      type: "aura_light_down",
      target: "luminosidade",
      value: crepusculoLuxVals[i],
      unit: "lux",
      radius: 5,
      description: `Reduz Sobrenaturalmente em até ${crepusculoLuxVals[i].toLocaleString('pt-BR')} Lux em raio de 5 m`,
    }),
  },

  // ── 6.1 Crepúsculo (Objeto) ──────────────────────────────────────────
  {
    baseName: "Runa do Crepúsculo",
    anchor: "Objeto",
    category: "Ambiental",
    color: "indigo",
    icon: "🌑",
    weight: 0,
    getPotenciaEffect: (i) => ({
      type: "object_light_down",
      target: "luminosidade",
      value: crepusculoLuxVals[i],
      unit: "lux",
      radius: 5,
      description: `Reduz Sobrenaturalmente em até ${crepusculoLuxVals[i].toLocaleString('pt-BR')} Lux em raio de 5 m`,
    }),
  },

  // ── 7. Aquecimento (Ser) ─────────────────────────────────────────────
  {
    baseName: "Runa do Aquecimento",
    anchor: "Ser",
    category: "Ambiental",
    color: "orange",
    icon: "🔥",
    weight: 0,
    getPotenciaEffect: (i) => ({
      type: "derived_flat",
      target: "Temperatura Máxima",
      value: aquecimentoSerTempVals[i],
      unit: "°C",
      description: `Temperatura Máxima +${aquecimentoSerTempVals[i]}°C`,
    }),
  },

  // ── 7.1 Aquecimento (Objeto) ─────────────────────────────────────────
  {
    baseName: "Runa do Aquecimento",
    anchor: "Objeto",
    category: "Ambiental",
    color: "orange",
    icon: "🔥",
    weight: 0,
    getPotenciaEffect: (i) => ({
      type: "object_temp",
      target: "temperatura_interna",
      value: aquecimentoObjTempVals[i],
      unit: "°C",
      description: `Temperatura Interna do Objeto +${aquecimentoObjTempVals[i]}°C (sem condução/convecção/irradiação)`,
    }),
  },

  // ── 8. Resfriamento (Ser) ────────────────────────────────────────────
  {
    baseName: "Runa do Resfriamento",
    anchor: "Ser",
    category: "Ambiental",
    color: "blue",
    icon: "❄️",
    weight: 0,
    getPotenciaEffect: (i) => ({
      type: "derived_flat",
      target: "Temperatura Mínima",
      value: -resfriSerTempVals[i],
      unit: "°C",
      description: `Temperatura Mínima -${resfriSerTempVals[i]}°C`,
    }),
  },

  // ── 8.1 Resfriamento (Objeto) ────────────────────────────────────────
  {
    baseName: "Runa do Resfriamento",
    anchor: "Objeto",
    category: "Ambiental",
    color: "blue",
    icon: "❄️",
    weight: 0,
    getPotenciaEffect: (i) => ({
      type: "object_temp",
      target: "temperatura_interna",
      value: -resfriObjTempVals[i],
      unit: "°C",
      description: `Temperatura Interna do Objeto -${resfriObjTempVals[i]}°C (sem condução/convecção/irradiação)`,
    }),
  },
];

/** Returns the full display name of a rune entry+potencia */
export function getRuneDisplayName(entry: RuneCatalogEntry, potenciaIndex: number): string {
  return `${entry.baseName} (${entry.anchor}) — ${RUNE_POTENCIAS[potenciaIndex]}`;
}

/** Returns the short key used in catalog: "Conservação Ser" */
export function getRuneShortKey(entry: RuneCatalogEntry): string {
  return `${entry.baseName.replace('Runa d', '').replace('a ', '').replace('o ', '').trim()} (${entry.anchor})`;
}

/** Color map per color string → Tailwind classes */
export const RUNE_COLOR_CLASSES: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  emerald: { border: "border-emerald-500/50", bg: "bg-emerald-900/20", text: "text-emerald-300", badge: "bg-emerald-500/20 text-emerald-300" },
  cyan:    { border: "border-cyan-500/50",    bg: "bg-cyan-900/20",    text: "text-cyan-300",    badge: "bg-cyan-500/20 text-cyan-300" },
  red:     { border: "border-red-500/50",     bg: "bg-red-900/20",     text: "text-red-300",     badge: "bg-red-500/20 text-red-300" },
  violet:  { border: "border-violet-500/50",  bg: "bg-violet-900/20",  text: "text-violet-300",  badge: "bg-violet-500/20 text-violet-300" },
  yellow:  { border: "border-yellow-500/50",  bg: "bg-yellow-900/20",  text: "text-yellow-300",  badge: "bg-yellow-500/20 text-yellow-300" },
  indigo:  { border: "border-indigo-500/50",  bg: "bg-indigo-900/20",  text: "text-indigo-300",  badge: "bg-indigo-500/20 text-indigo-300" },
  orange:  { border: "border-orange-500/50",  bg: "bg-orange-900/20",  text: "text-orange-300",  badge: "bg-orange-500/20 text-orange-300" },
  blue:    { border: "border-blue-500/50",    bg: "bg-blue-900/20",    text: "text-blue-300",    badge: "bg-blue-500/20 text-blue-300" },
};
