export interface CharacterInfo {
  name: string;
  level: number;
  race: string;
  constellation: string;
  height: number;
  weight: number;
  physicalLevel?: number;
  physicalValue?: number;
  intellectualLevel?: number;
  intellectualValue?: number;
  socialLevel?: number;
  socialValue?: number;
}

export type AttributeData = { base: number; bonus: number };
export type Attributes = Record<string, AttributeData>;

export type AccessorySlot = 'Cabeça' | 'Garganta' | 'Ouvido E' | 'Ouvido D' | 'Antebraço' | 'Mão' | 'Pulso E' | 'Pulso D' | 'Dedo 1' | 'Dedo 2' | 'Dedo 3' | 'Dedo 4' | 'Dedo 5' | 'Dedo 6' | 'Dedo 7' | 'Dedo 8' | 'Dedo 9' | 'Dedo 10' | 'Cintura' | 'Tornozelo E' | 'Tornozelo D';

export interface GemEffect {
  category: string; // e.g., 'Ampliadoras (Atributos)', 'Indutoras'
  target: string;   // e.g., 'Carisma', 'Vital'
  value: number;    // The numerical effect value
  runas: number;    // Runa cost
  prefix: string;   // e.g., 'Ataques', 'Regeneração'
}

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
  requiredTier?: number;       // 1-10 (Novato=1 … Grão Mestre=10)
  
  // Acessórios e Gemas
  accessorySlot?: string;
  gemCapacity?: number;
  maxGemTier?: string; // e.g. "E" to "☆☆☆" (we'll compare via arrays or just metadata)
  gemEffect?: GemEffect;
  socketedGemIds?: string[];
}

export type BodyPart = 'Cabeça' | 'Pescoço' | 'Tronco' | 'Ombro' | 'Braço' | 'Cotovelo' | 'Antebraço' | 'Mão' | 'Coxa' | 'Joelho' | 'Perna' | 'Pé';
export type ArmorLayer = 'Interna' | 'Central' | 'Externa';

export interface EquippedArmor {
  [part in BodyPart]: {
    [layer in ArmorLayer]: InventoryItem | null;
  };
}

export interface EquippedWeapons {
  mainHand: InventoryItem | null;
  offHand: InventoryItem | null;
}

/** Maps aptidão name → proficiency (0-100) */
export type AptidoesState = Record<string, number>;

export interface EquippedAccessories {
  [slot: string]: InventoryItem | null;
}
