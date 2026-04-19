export interface CharacterInfo {
  name: string;
  level: number;
  race: string;
  constellation: string;
  gender?: 'XY' | 'XX' | '\u2205\u2205';
  humanBonuses?: string[]; // Array of 3 attribute names
  height: number;
  weight: number;
  physicalLevel?: number;
  physicalValue?: number;
  intellectualLevel?: number;
  intellectualValue?: number;
  socialLevel?: number;
  socialValue?: number;
  imageUrl?: string;
}

export interface JournalNote {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

export interface NPC {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  strength: number;      // For capacity calculations
  inventory: InventoryItem[];
  notes: string;
}

export interface MasterState {
  messages: {
    id: string;
    sender: string;
    recipient: string; // "Todos" or char name
    content: string;
    timestamp: number;
    read: boolean;
  }[];
  npcs: NPC[];
  initiativeOrder: { id: string; name: string; value: number }[];
}

export type AttributeData = { base: number; bonus: number };
export type Attributes = Record<string, AttributeData>;

export type AccessorySlot =
  | 'Cabe\u00e7a'
  | 'Garganta'
  | 'Ouvido E'
  | 'Ouvido D'
  | 'Antebra\u00e7o'
  | 'M\u00e3o'
  | 'Pulso E'
  | 'Pulso D'
  | 'Dedo 1'
  | 'Dedo 2'
  | 'Dedo 3'
  | 'Dedo 4'
  | 'Dedo 5'
  | 'Dedo 6'
  | 'Dedo 7'
  | 'Dedo 8'
  | 'Dedo 9'
  | 'Dedo 10'
  | 'Cintura'
  | 'Tornozelo E'
  | 'Tornozelo D';

export interface GemEffect {
  category: string; // e.g., 'Ampliadoras (Atributos)', 'Indutoras'
  target: string;   // e.g., 'Carisma', 'Vital'
  value: number;    // The numerical effect value
  runas: number;    // Runa cost
  prefix: string;   // e.g., 'Ataques', 'Recupera\u00e7\u00e3o'
}

// \u2500\u2500 Rune System \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export type RuneAnchor = 'Ser' | 'Objeto';

export type RuneEffectType =
  | 'status_percent'       // Ex: Vida +X% (Conserva\u00e7\u00e3o Ser)
  | 'derived_percent'      // Ex: Defesa Universal +X% (Preserva\u00e7\u00e3o)
  | 'derived_flat'         // Ex: Temperatura M\u00e1xima +X\u00b0C (Aquecimento Ser)
  | 'object_temp'          // Ex: Temperatura interna do objeto +X\u00b0C
  | 'object_light_up'      // Ex: Aumenta Lux em raio (Alvorada Objeto)
  | 'object_light_down'    // Ex: Reduz Lux em raio (Crep\u00fasculo Objeto)
  | 'aura_light_up'        // Ex: Ser emite mais luz (Alvorada Ser)
  | 'aura_light_down'      // Ex: Ser absorve luz (Crep\u00fasculo Ser)
  | 'damage_mult_objects'  // Ex: Dano \u00d7N contra objetos (Destrui\u00e7\u00e3o)
  | 'kill_chance';         // Ex: X% chance de matar (Morte)

export interface RuneEffect {
  type: RuneEffectType;
  target: string;      // Ex: 'vida', 'Defesa Universal', 'Temperatura M\u00e1xima'
  value: number;       // Numeric magnitude (%, multiplier, \u00b0C, lux, etc.)
  unit?: string;       // Ex: '%', '\u00b0C', 'lux', 'x'
  radius?: number;     // For aura runes (meters)
  description: string; // Human-readable description of the effect
}

export interface ActiveRune {
  runeInventoryId: string; // ID of the InventoryItem (rune)
  active: boolean;          // Toggled on/off
  appliedToItemId?: string; // For object runes: which inventory item they're on
}

export interface EquippedRunes {
  bodyRunes: ActiveRune[];   // Runas no corpo do ser (tatuagens)
  objectRunes: ActiveRune[]; // Runas em objetos (decalques)
}

// \u2500\u2500 End Rune System \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  weight: number;
  quantity: number;
  description?: string;
  armorPart?: BodyPart;
  armorLayer?: ArmorLayer;
  requiredAptitude?: string;  // e.g. "Esgrima Civil"
  requiredTier?: number;       // 1-10 (Novato=1 \u2026 Gr\u00e3o Mestre=10)

  // Acess\u00f3rios e Gemas
  accessorySlot?: string;
  gemCapacity?: number;
  maxGemTier?: string;
  gemEffect?: GemEffect;
  socketedGemIds?: string[];

  // Runas
  runeEffect?: RuneEffect;
  runeAnchor?: RuneAnchor;       // 'Ser' ou 'Objeto'
  runePotenciaIndex?: number;    // 0-9
  runePotenciaName?: string;     // Ex: 'Mundano', 'Supremo'
}

export type BodyPart =
  | 'Cabe\u00e7a'
  | 'Pesco\u00e7o'
  | 'Tronco'
  | 'Ombro'
  | 'Bra\u00e7o'
  | 'Cotovelo'
  | 'Antebra\u00e7o'
  | 'M\u00e3o'
  | 'Coxa'
  | 'Joelho'
  | 'Perna'
  | 'P\u00e9';

export type ArmorLayer = 'Interna' | 'Central' | 'Externa';

export type EquippedArmor = {
  [part in BodyPart]: {
    [layer in ArmorLayer]: InventoryItem | null;
  };
};

export interface EquippedWeapons {
  mainHand: InventoryItem | null;
  offHand: InventoryItem | null;
}

/** Maps aptid\u00e3o name \u2192 proficiency (0-100) */
export type AptidoesState = Record<string, number>;

export type EquippedAccessories = {
  [slot in AccessorySlot]: InventoryItem | null;
};

// ── Tactical Terminal (Wounds & Combat State) ──────────────────────────────

export type WoundRegion =
  | 'Digital' | 'Manual' | 'Pedal'
  | 'Antebraquial' | 'Crural' | 'Cubital' | 'Genicular'
  | 'Braquial' | 'Meral' | 'Omal'
  | 'Pélvica' | 'Abdominal' | 'Lombar' | 'Torácica' | 'Dorsal'
  | 'Cervical' | 'Facial' | 'Cefálica' | 'Nasal' | 'Auricular' | 'Ocular' | 'Oral';

export type WoundTissue = 'Tegumentar' | 'Muscular' | 'Ósseo';
export type WoundSeverity = 'Leve' | 'Moderada' | 'Severa' | 'Extrema';

export interface Wound {
  id: string;
  region: WoundRegion;
  tissue: WoundTissue;
  severity: WoundSeverity;
  painLevel: number;       // 0-10+
  bleedingRate: number;    // vida perdida por turno (0.00 – 1.00+)
  debuff: string;          // descrição textual da debilitação funcional
  healingMode: 'natural' | 'treated';
  timestamp: number;
}

export interface TacticalState {
  wounds: Wound[];
  extrapolateChargesUsed: number;
}
