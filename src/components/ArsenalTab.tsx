import { useState } from "react";
import { Shield, Sword, Crown, Gem, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { InventoryItem, EquippedArmor, EquippedWeapons, EquippedAccessories, AccessorySlot, BodyPart, ArmorLayer } from "../types";

interface ArsenalTabProps {
  inventory: InventoryItem[];
  setInventory?: (inv: InventoryItem[]) => void;
  equippedArmor: EquippedArmor;
  setEquippedArmor: (armor: EquippedArmor) => void;
  equippedWeapons: EquippedWeapons;
  setEquippedWeapons: (weapons: EquippedWeapons) => void;
  equippedAccessories?: EquippedAccessories;
  setEquippedAccessories?: (acc: EquippedAccessories) => void;
  aptidoes?: Record<string, number>;
}

// ── Material → Required Aptitude Tier (0 = free) ────────────────────────────
// Tier = required rank (Novato=1, Aprendiz=2 … Grão Mestre=10)
const MATERIAL_TIER: Record<string, number> = {
  'Alumínio': 0, 'Quartzo': 0,  // free
  'Cobre': 1,   'Ónix': 1,   'Ônix': 1,   'Eucalipto': 1,
  'Ferro': 2,   'Granada': 2, 'Pinheiro': 2,
  'Níquel': 3,  'Peridoto': 3, 'Freixo': 3,
  'Vanádio': 4, 'Turmalina': 4, 'Bétula': 4,
  'Titânio': 5, 'Topázio': 5, 'Cedro': 5,
  'Cromo': 6,   'Ametista': 6, 'Mogno': 6,
  'Cobalto': 7, 'Esmeralda': 7, 'Figueira': 7,
  'Irídio': 8,  'Safira': 8, 'Carvalho': 8,
  'Rênio': 9,   'Rubi': 9,  'Álamo': 9,
  'Volfrâmio': 10, 'Diamante': 10, 'Sequoia': 10,
};

const RANK_NAMES = ['Novato','Aprendiz','Iniciado','Adepto','Veterano','Expert','Virtuoso','Sábio','Mestre','Grão Mestre'];

/** Map item category → aptidao name that governs it */
const CATEGORY_APTIDAO: Record<string, string> = {
  'Escudos': 'Escuderia',
  'Armaduras': 'Armadura Média', // fallback
  'Esgrima Civil': 'Esgrima Civil',
  'Esgrima Marcial': 'Esgrima Marcial',
  'Esgrima Militar': 'Esgrima Militar',
  'Artilharia Civil': 'Artilharia Civil',
  'Artilharia Marcial': 'Artilharia Marcial',
  'Artilharia Militar': 'Artilharia Militar',
  'Arremesso': 'Arremesso',
  'Pancrácio': 'Pancrácio',
  'Soqueiras': 'Pugilismo',
  'Manejo Arcano': 'Manejo Arcano',
  'Manejo Astral': 'Manejo Astral',
};

const BODY_PARTS: BodyPart[] = ['Cabeça', 'Pescoço', 'Tronco', 'Ombro', 'Braço', 'Cotovelo', 'Antebraço', 'Mão', 'Coxa', 'Joelho', 'Perna', 'Pé'];
const LAYERS: ArmorLayer[] = ['Interna', 'Central', 'Externa'];

const LEFT_PARTS: BodyPart[] = ['Cabeça', 'Ombro', 'Braço', 'Cotovelo', 'Antebraço', 'Mão'];
const RIGHT_PARTS: BodyPart[] = ['Pescoço', 'Tronco', 'Coxa', 'Joelho', 'Perna', 'Pé'];

const BodySilhouette = ({ equippedArmor, inventory }: { equippedArmor: EquippedArmor, inventory: InventoryItem[] }) => {
  const getDominantArmorType = (part: BodyPart) => {
    const partArmor = equippedArmor[part];
    if (!partArmor) return null;
    
    const determineType = (item: InventoryItem | null | undefined) => {
      if (!item || !item.id) return 0;
      const fullItem = inventory.find(i => i.id === item.id);
      if (!fullItem) return 0;
      if (fullItem.requiredAptitude?.includes("Leve")) return 1;
      if (fullItem.requiredAptitude?.includes("Média")) return 2;
      if (fullItem.requiredAptitude?.includes("Pesada")) return 3;
      return 1;
    }

    const t1 = determineType(partArmor.Interna);
    const t2 = determineType(partArmor.Central);
    const t3 = determineType(partArmor.Externa);
    
    const heaviest = Math.max(t1, t2, t3);
    
    if (heaviest === 3) return 'pesada';
    if (heaviest === 2) return 'media';
    if (heaviest === 1) return 'leve';
    return null;
  };

  const getColor = (part: BodyPart) => {
    const type = getDominantArmorType(part);
    if (!type) return "text-slate-200/30"; // BRANCO / empty
    if (type === 'leve') return "text-emerald-500";
    if (type === 'media') return "text-cyan-400";
    if (type === 'pesada') return "text-slate-500";
    return "text-slate-200/30";
  };

  const getGlow = (part: BodyPart) => {
    const type = getDominantArmorType(part);
    if (!type) return "";
    if (type === 'leve') return "drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]";
    if (type === 'media') return "drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]";
    if (type === 'pesada') return "drop-shadow-[0_0_8px_rgba(100,116,139,0.8)]";
    return "";
  };

  return (
    <svg viewBox="0 0 200 450" className="w-full h-auto max-h-[700px] lg:max-h-[800px] transition-all duration-500">
      {/* Cabeça */}
      <g className={`${getColor('Cabeça')} ${getGlow('Cabeça')} transition-colors duration-300`}>
        <circle cx="100" cy="50" r="22" fill="currentColor" />
      </g>
      
      {/* Pescoço */}
      <g className={`${getColor('Pescoço')} ${getGlow('Pescoço')} transition-colors duration-300`}>
        <rect x="92" y="73" width="16" height="15" fill="currentColor" />
      </g>

      {/* Tronco */}
      <g className={`${getColor('Tronco')} ${getGlow('Tronco')} transition-colors duration-300`}>
        <path d="M65 90 L135 90 L125 220 L75 220 Z" fill="currentColor" />
      </g>

      {/* Ombro (Left/Right) */}
      <g className={`${getColor('Ombro')} ${getGlow('Ombro')} transition-colors duration-300`}>
        <circle cx="55" cy="100" r="16" fill="currentColor" />
        <circle cx="145" cy="100" r="16" fill="currentColor" />
      </g>

      {/* Braço */}
      <g className={`${getColor('Braço')} ${getGlow('Braço')} transition-colors duration-300`}>
        <rect x="38" y="105" width="18" height="55" rx="9" transform="rotate(15 47 105)" fill="currentColor" />
        <rect x="144" y="105" width="18" height="55" rx="9" transform="rotate(-15 153 105)" fill="currentColor" />
      </g>

      {/* Cotovelo */}
      <g className={`${getColor('Cotovelo')} ${getGlow('Cotovelo')} transition-colors duration-300`}>
        <circle cx="33" cy="165" r="10" fill="currentColor" />
        <circle cx="167" cy="165" r="10" fill="currentColor" />
      </g>

      {/* Antebraço */}
      <g className={`${getColor('Antebraço')} ${getGlow('Antebraço')} transition-colors duration-300`}>
        <rect x="23" y="175" width="14" height="50" rx="7" transform="rotate(10 30 175)" fill="currentColor" />
        <rect x="163" y="175" width="14" height="50" rx="7" transform="rotate(-10 170 175)" fill="currentColor" />
      </g>

      {/* Mão */}
      <g className={`${getColor('Mão')} ${getGlow('Mão')} transition-colors duration-300`}>
        <circle cx="20" cy="235" r="11" fill="currentColor" />
        <circle cx="180" cy="235" r="11" fill="currentColor" />
      </g>

      {/* Coxa */}
      <g className={`${getColor('Coxa')} ${getGlow('Coxa')} transition-colors duration-300`}>
        <rect x="72" y="225" width="24" height="80" rx="12" fill="currentColor" />
        <rect x="104" y="225" width="24" height="80" rx="12" fill="currentColor" />
      </g>

      {/* Joelho */}
      <g className={`${getColor('Joelho')} ${getGlow('Joelho')} transition-colors duration-300`}>
        <circle cx="84" cy="315" r="11" fill="currentColor" />
        <circle cx="116" cy="315" r="11" fill="currentColor" />
      </g>

      {/* Perna */}
      <g className={`${getColor('Perna')} ${getGlow('Perna')} transition-colors duration-300`}>
        <rect x="74" y="325" width="20" height="70" rx="10" fill="currentColor" />
        <rect x="106" y="325" width="20" height="70" rx="10" fill="currentColor" />
      </g>

      {/* Pé */}
      <g className={`${getColor('Pé')} ${getGlow('Pé')} transition-colors duration-300`}>
        <path d="M65 400 L93 400 L93 415 L60 415 Z" fill="currentColor" />
        <path d="M107 400 L135 400 L140 415 L107 415 Z" fill="currentColor" />
      </g>
    </svg>
  );
};

export function ArsenalTab({ inventory, setInventory, equippedArmor, setEquippedArmor, equippedWeapons, setEquippedWeapons, equippedAccessories, setEquippedAccessories, aptidoes = {} }: ArsenalTabProps) {
  const [activeTab, setActiveTab] = useState<'weapons' | 'armor' | 'accessories'>('weapons');

  const armorItems = inventory.filter(item => item.category === 'Armaduras');
  const weaponItems = inventory.filter(item => item.category === 'Armas');
  const shieldItems = inventory.filter(item => item.category === 'Escudos');
  const accessoryItems = inventory.filter(item => item.category === 'Acessórios');
  const gemItems = inventory.filter(item => item.category === 'Gemas');
  // Both slots now accept weapons AND shields (no directional restriction)
  const allHandItems = [...weaponItems, ...shieldItems];

  const accessorySlots: AccessorySlot[] = ['Cabeça', 'Garganta', 'Ouvido E', 'Ouvido D', 'Antebraço', 'Mão', 'Pulso E', 'Pulso D', 'Cintura', 'Tornozelo E', 'Tornozelo D'];
  const fingerSlots: AccessorySlot[] = ['Dedo 1', 'Dedo 2', 'Dedo 3', 'Dedo 4', 'Dedo 5', 'Dedo 6', 'Dedo 7', 'Dedo 8', 'Dedo 9', 'Dedo 10'];
  const FINGER_LABELS = ['Mínimo E', 'Anelar E', 'Médio E', 'Indicador E', 'Polegar E', 'Polegar D', 'Indicador D', 'Médio D', 'Anelar D', 'Mínimo D'];
  // Map paired slots to their catalog base name for filtering
  const SLOT_CATALOG_MAP: Record<string, string> = {
    'Ouvido E': 'Ouvido', 'Ouvido D': 'Ouvido',
    'Pulso E': 'Pulso', 'Pulso D': 'Pulso',
    'Tornozelo E': 'Tornozelo', 'Tornozelo D': 'Tornozelo',
  };
  const [socketingSlot, setSocketingSlot] = useState<AccessorySlot | null>(null);

  const getSocketedGemsGlobal = () => {
    const ids = new Set<string>();
    if (!equippedAccessories) return ids;
    Object.values(equippedAccessories).forEach(item => {
      if (item && item.socketedGemIds) {
        item.socketedGemIds.forEach(id => ids.add(id));
      }
    });
    return ids;
  };
  const usedGemIds = getSocketedGemsGlobal();

  const handleEquipAccessory = (slot: AccessorySlot, itemId: string) => {
    if (!setEquippedAccessories || !equippedAccessories) return;
    const item = accessoryItems.find(i => i.id === itemId) || null;
    setEquippedAccessories({ ...equippedAccessories, [slot]: item });
  };

  const handleSocketGem = (gemId: string) => {
    if (!socketingSlot || !equippedAccessories || !setEquippedAccessories || !setInventory) return;
    const item = equippedAccessories[socketingSlot];
    if (!item) return;

    const updatedGemIds = [...(item.socketedGemIds || []), gemId];
    const updatedItem = { ...item, socketedGemIds: updatedGemIds };

    // 1. Update Equipped State
    setEquippedAccessories({
      ...equippedAccessories,
      [socketingSlot]: updatedItem
    });

    // 2. Synchronize back to Inventory
    setInventory(prev => prev.map(invItem => 
      invItem.id === item.id ? updatedItem : invItem
    ));

    setSocketingSlot(null);
  };

  const handleUnsocketGem = (slot: AccessorySlot, gemId: string) => {
    if (!equippedAccessories || !setEquippedAccessories || !setInventory) return;
    const item = equippedAccessories[slot];
    if (!item || !item.socketedGemIds) return;

    const updatedGemIds = item.socketedGemIds.filter(id => id !== gemId);
    const updatedItem = { ...item, socketedGemIds: updatedGemIds };

    // 1. Update Equipped State
    setEquippedAccessories({
      ...equippedAccessories,
      [slot]: updatedItem
    });

    // 2. Synchronize back to Inventory
    setInventory(prev => prev.map(invItem => 
      invItem.id === item.id ? updatedItem : invItem
    ));
  };

  // ── Penalty helpers ────────────────────────
  const getItemRequiredTier = (item: InventoryItem): number => {
    // Try requiredTier field first (set by catalog on new items)
    if (item.requiredTier !== undefined) return item.requiredTier;
    // Otherwise detect material from item name
    for (const [mat, tier] of Object.entries(MATERIAL_TIER)) {
      if (item.name.includes(mat)) return tier;
    }
    return 0; // no requirement
  };

  const getItemAptidao = (item: InventoryItem): string | null => {
    if (item.requiredAptitude) return item.requiredAptitude;
    return CATEGORY_APTIDAO[item.category] ?? null;
  };

  const getItemPenalty = (item: InventoryItem): { tiers: number; requiredTier: number; aptidao: string } | null => {
    const aptidao = getItemAptidao(item);
    const requiredTier = getItemRequiredTier(item);
    if (!aptidao || requiredTier <= 0) return null;
    const playerProf = (aptidoes as Record<string, number>)[aptidao] ?? 0;
    const playerTier = Math.min(10, Math.floor(playerProf / 10));
    const diff = requiredTier - playerTier;
    if (diff <= 0) return null;
    return { tiers: diff, requiredTier, aptidao };
  };

  const PenaltyBadge = ({ item }: { item: InventoryItem }) => {
    const penalty = getItemPenalty(item);
    if (!penalty) return null;
    return (
      <div className="mt-2 flex items-start gap-1.5 bg-red-900/30 border border-red-700/50 rounded-xl px-3 py-2 text-[11px] text-red-300">
        <span className="text-red-400 shrink-0 mt-0.5">⚠️</span>
        <span>
          Penalidade <strong>{penalty.tiers * 10}%</strong> — Requer {RANK_NAMES[penalty.requiredTier - 1]} em <em>{penalty.aptidao}</em>
        </span>
      </div>
    );
  };

  const handleEquipArmor = (part: BodyPart, layer: ArmorLayer, itemId: string) => {
    const item = armorItems.find(i => i.id === itemId) || null;
    setEquippedArmor({
      ...equippedArmor,
      [part]: {
        ...equippedArmor[part],
        [layer]: item
      }
    });
  };

  const handleEquipAllArmor = () => {
    const sortedArmors = [...armorItems].sort((a, b) => (b.requiredTier || 0) - (a.requiredTier || 0));
    
    const baseArmor: EquippedArmor = {
      Cabeça: { Interna: null, Central: null, Externa: null },
      Pescoço: { Interna: null, Central: null, Externa: null },
      Tronco: { Interna: null, Central: null, Externa: null },
      Ombro: { Interna: null, Central: null, Externa: null },
      Braço: { Interna: null, Central: null, Externa: null },
      Cotovelo: { Interna: null, Central: null, Externa: null },
      Antebraço: { Interna: null, Central: null, Externa: null },
      Mão: { Interna: null, Central: null, Externa: null },
      Coxa: { Interna: null, Central: null, Externa: null },
      Joelho: { Interna: null, Central: null, Externa: null },
      Perna: { Interna: null, Central: null, Externa: null },
      Pé: { Interna: null, Central: null, Externa: null },
    };
    
    const usedIds = new Set<string>();
    
    for (const item of sortedArmors) {
      if (!item.armorPart || !item.armorLayer) continue;
      
      if (!baseArmor[item.armorPart][item.armorLayer]) {
        if (!usedIds.has(item.id)) {
           baseArmor[item.armorPart][item.armorLayer] = item;
           usedIds.add(item.id);
        }
      }
    }
    setEquippedArmor(baseArmor);
  };


  const getAvailableArmorItems = (part: BodyPart, layer: ArmorLayer) => {
    return armorItems.filter(item => {
      if (item.armorPart && item.armorPart !== part) return false;
      if (item.armorLayer && item.armorLayer !== layer) return false;
      
      let isEquippedElsewhere = false;
      for (const p of BODY_PARTS) {
        for (const l of LAYERS) {
          if (p === part && l === layer) continue;
          if (equippedArmor[p]?.[l]?.id === item.id) {
            isEquippedElsewhere = true;
          }
        }
      }
      return !isEquippedElsewhere;
    });
  };

  const getAvailableWeaponItems = (slot: 'mainHand' | 'offHand') => {
    // Both slots draw from full pool (weapons + shields)
    return allHandItems.filter(item => {
      const otherSlot = slot === 'mainHand' ? 'offHand' : 'mainHand';
      if (equippedWeapons[otherSlot]?.id === item.id) {
        if ((item.quantity || 1) <= 1) return false;
      }
      return true;
    });
  };

  const isTwoHanded = (item: InventoryItem | null): boolean => {
    if (!item) return false;
    return /arco|longbow|shortbow/i.test(item.name);
  };

  const handleEquipWeapon = (slot: 'mainHand' | 'offHand', itemId: string) => {
    const item = allHandItems.find(i => i.id === itemId) || null;
    if (slot === 'mainHand') {
      setEquippedWeapons({
        ...equippedWeapons,
        mainHand: item,
        offHand: isTwoHanded(item) ? null : equippedWeapons.offHand,
      });
    } else {
      setEquippedWeapons({ ...equippedWeapons, offHand: item });
    }
  };

  const renderBodyPart = (part: BodyPart) => (
    <motion.div 
      key={part} 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 shadow-inner relative overflow-hidden group hover:border-emerald-500/50 transition-colors"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <h4 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider border-b border-slate-700/50 pb-2 flex items-center gap-2 relative z-10">
        <Shield size={14} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
        {part}
      </h4>
      <div className="space-y-3 relative z-10">
        {LAYERS.map(layer => {
          const equippedItem = equippedArmor[part]?.[layer];
          const isItemValid = equippedItem && inventory.some(i => i.id === equippedItem.id);
          const fullItem = isItemValid ? inventory.find(i => i.id === equippedItem.id) : null;
          const availableItems = getAvailableArmorItems(part, layer);
          
          let borderColorClass = 'border-slate-700 text-slate-400';
          if (fullItem) {
             if (fullItem.requiredAptitude?.includes("Pesada")) borderColorClass = 'border-slate-500/50 bg-slate-900 text-slate-300';
             else if (fullItem.requiredAptitude?.includes("Média")) borderColorClass = 'border-cyan-500/50 bg-cyan-900/20 text-cyan-300';
             else if (fullItem.requiredAptitude?.includes("Leve")) borderColorClass = 'border-emerald-500/50 bg-emerald-900/20 text-emerald-300';
             else borderColorClass = 'border-emerald-500/50 text-emerald-300';
          }

          return (
            <div key={layer} className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold ml-1">{layer}</label>
              <select
                value={isItemValid ? equippedItem.id : ""}
                onChange={(e) => handleEquipArmor(part, layer, e.target.value)}
                className={`w-full bg-slate-800 border rounded-lg px-2 py-1.5 text-xs focus:outline-none transition-colors ${borderColorClass}`}
              >
                <option value="" className="text-slate-500">-- Vazio --</option>
                {availableItems.map(item => (
                  <option key={item.id} value={item.id} className="text-slate-200">{item.name}</option>
                ))}
              </select>
              {fullItem && (
                <div className="text-[10px] mt-0.5 ml-1 text-slate-400/80">
                  {fullItem.description?.match(/Defesa[^|]*/)?.[0] || 'Sem defesa'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );

  return (
    <div className="bg-slate-800 rounded-3xl border border-slate-700 p-6 shadow-xl flex flex-col h-full">
      
      {/* Animated Tab Bar */}
      <div className="flex gap-4 mb-6 border-b border-slate-700 pb-4 relative">
        <button
          onClick={() => setActiveTab('weapons')}
          className={`relative flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors z-10 ${
            activeTab === 'weapons' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === 'weapons' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-amber-500/20 border border-amber-500/50 rounded-xl -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <Sword size={20} />
          Armas
        </button>
        
        <button
          onClick={() => setActiveTab('armor')}
          className={`relative flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors z-10 ${
            activeTab === 'armor' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === 'armor' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-emerald-500/20 border border-emerald-500/50 rounded-xl -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <Shield size={20} />
          Armaduras
        </button>

        <button
          onClick={() => setActiveTab('accessories')}
          className={`relative flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors z-10 ${
            activeTab === 'accessories' ? 'text-pink-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === 'accessories' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-pink-500/20 border border-pink-500/50 rounded-xl -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <Crown size={20} />
          Acessórios
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <AnimatePresence mode="wait">
          {activeTab === 'weapons' && (
            <motion.div 
              key="weapons"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900/40 p-6 rounded-3xl border border-slate-700/50"
            >
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Sword size={20} className="text-amber-400" />
                Armas Equipadas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                {/* Mão Direita */}
                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 shadow-inner group hover:border-amber-500/50 transition-colors">
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider group-hover:text-amber-400 transition-colors">Mão Direita</label>
                  <select
                    value={equippedWeapons.mainHand?.id || ""}
                    onChange={(e) => handleEquipWeapon('mainHand', e.target.value)}
                    className={`w-full bg-slate-800 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors ${
                      equippedWeapons.mainHand
                        ? shieldItems.some(s => s.id === equippedWeapons.mainHand?.id)
                          ? 'border-cyan-500/50 text-cyan-300'
                          : 'border-amber-500/50 text-amber-300'
                        : 'border-slate-700 text-slate-400'
                    }`}
                  >
                    <option value="">-- Desarmado --</option>
                    {getAvailableWeaponItems('mainHand').map(item => (
                      <option key={item.id} value={item.id} className="text-slate-200">
                        {item.name}{item.category === 'Escudos' ? ' 🛡️' : ''}{isTwoHanded(item) ? ' « ambas »' : ''}
                      </option>
                    ))}
                  </select>
                  {isTwoHanded(equippedWeapons.mainHand) && (
                    <p className="text-[11px] text-yellow-400 mt-2">⚠️ Arco — ocupa ambas as mãos</p>
                  )}
                  {equippedWeapons.mainHand && <PenaltyBadge item={equippedWeapons.mainHand} />}
                </div>

                {/* Mão Esquerda */}
                <div className={`bg-slate-900/80 p-4 rounded-2xl border shadow-inner transition-colors ${
                  isTwoHanded(equippedWeapons.mainHand)
                    ? 'border-yellow-700/40 opacity-50 pointer-events-none'
                    : 'border-slate-700/80 group hover:border-amber-500/50'
                }`}>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider group-hover:text-cyan-400 transition-colors">
                    Mão Esquerda
                    {isTwoHanded(equippedWeapons.mainHand) && <span className="ml-2 text-yellow-500 normal-case">(bloqueada)</span>}
                  </label>
                  <select
                    disabled={isTwoHanded(equippedWeapons.mainHand)}
                    value={equippedWeapons.offHand?.id || ""}
                    onChange={(e) => handleEquipWeapon('offHand', e.target.value)}
                    className={`w-full bg-slate-800 border rounded-xl px-3 py-2 text-sm focus:outline-none transition-colors ${
                      equippedWeapons.offHand
                        ? shieldItems.some(s => s.id === equippedWeapons.offHand?.id)
                          ? 'border-cyan-500/50 text-cyan-300 focus:border-cyan-500'
                          : 'border-amber-500/50 text-amber-300 focus:border-amber-500'
                        : 'border-slate-700 text-slate-400 focus:border-amber-500'
                    }`}
                  >
                    <option value="">-- Desarmado --</option>
                    {getAvailableWeaponItems('offHand').map(item => (
                      <option key={item.id} value={item.id} className="text-slate-200">
                        {item.name}{item.category === 'Escudos' ? ' 🛡️' : ''}
                      </option>
                    ))}
                  </select>
                  {equippedWeapons.offHand && <PenaltyBadge item={equippedWeapons.offHand} />}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'armor' && (
            <motion.div 
              key="armor"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900/40 p-6 rounded-3xl border border-slate-700/50 relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Shield size={20} className="text-emerald-400" />
                  Armaduras Equipadas
                </h3>
                <button
                  onClick={handleEquipAllArmor}
                  className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-bold transition-colors shadow-inner flex items-center"
                >
                  ✨ Equipar Tudo (Otimizado)
                </button>
              </div>
              
              <div className="flex flex-col lg:grid lg:grid-cols-[1fr_300px_1fr] xl:grid-cols-[1fr_400px_1fr] gap-6 items-start relative z-10">
                
                {/* Center Silhouette (Mobile) */}
                <div className="flex lg:hidden justify-center items-center w-full mb-4">
                  <div className="relative w-full max-w-[200px] flex justify-center">
                    <BodySilhouette equippedArmor={equippedArmor} inventory={inventory} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>

                {/* Left Column */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 w-full">
                  {LEFT_PARTS.map(part => renderBodyPart(part))}
                </div>

                {/* Center Silhouette (Desktop) */}
                <div className="hidden lg:flex justify-center items-start sticky top-4">
                  <div className="relative w-full flex justify-center">
                    <BodySilhouette equippedArmor={equippedArmor} inventory={inventory} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>

                {/* Right Column */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 w-full">
                  {RIGHT_PARTS.map(part => renderBodyPart(part))}
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'accessories' && equippedAccessories && (
            <motion.div
              key="accessories"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900/40 p-6 rounded-3xl border border-slate-700/50 relative overflow-hidden"
            >
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Crown size={20} className="text-pink-400" />
                Acessórios Equipados e Engaste
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accessorySlots.map(slot => {
                  const equippedItem = equippedAccessories[slot];
                  const catalogSlot = SLOT_CATALOG_MAP[slot] || slot;
                  // Find paired sibling to exclude already-equipped unique items
                  const siblingSlots = accessorySlots.filter(s => s !== slot && (SLOT_CATALOG_MAP[s] || s) === catalogSlot);
                  const siblingEquippedIds = new Set(siblingSlots.map(s => equippedAccessories[s]?.id).filter(Boolean));
                  const availableForSlot = accessoryItems.filter(i => i.accessorySlot === catalogSlot && (!siblingEquippedIds.has(i.id) || (i.quantity || 1) > 1));

                  return (
                    <div key={slot} className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 shadow-inner group hover:border-pink-500/50 transition-colors">
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider group-hover:text-pink-400 transition-colors">{slot}</label>
                      <select
                        value={equippedItem?.id || ""}
                        onChange={(e) => handleEquipAccessory(slot, e.target.value)}
                        className={`w-full bg-slate-800 border rounded-xl px-3 py-2 text-sm focus:outline-none transition-colors mb-3 ${
                          equippedItem ? 'border-pink-500/50 text-pink-300' : 'border-slate-700 text-slate-400'
                        }`}
                      >
                        <option value="">-- Vazio --</option>
                        {availableForSlot.map(item => (
                          <option key={item.id} value={item.id} className="text-slate-200">{item.name}</option>
                        ))}
                      </select>

                      {/* Engaste Sub-painel */}
                      {equippedItem && (
                        <div className="mt-4 pt-3 border-t border-slate-700/50 space-y-2">
                          <div className="flex justify-between items-center text-xs px-1">
                            <span className="text-slate-400">Engaste ({equippedItem.socketedGemIds?.length || 0}/{equippedItem.gemCapacity || 0})</span>
                            <span className="text-slate-500 font-mono">Max: {equippedItem.maxGemTier || '?'}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {Array.from({ length: equippedItem.gemCapacity || 0 }).map((_, idx) => {
                              const gemId = equippedItem.socketedGemIds?.[idx];
                              const actualGem = gemId ? inventory.find(i => i.id === gemId) : null;

                              if (actualGem) {
                                return (
                                  <div key={idx} className="relative group/gem cursor-pointer" onClick={() => handleUnsocketGem(slot, gemId)}>
                                    <div className="w-10 h-10 rounded-xl bg-pink-900/40 border border-pink-500/50 flex items-center justify-center shadow-lg shadow-pink-500/10 hover:bg-pink-900/60 transition-colors">
                                      <Gem size={16} className="text-pink-300" />
                                    </div>
                                    <div className="absolute opacity-0 group-hover/gem:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] bg-slate-900 border border-pink-500/50 text-slate-200 text-[10px] p-2 rounded-lg shadow-xl z-20 pointer-events-none transition-opacity">
                                      <div className="font-bold text-pink-300 mb-1">{actualGem.name}</div>
                                      <div className="text-slate-400">{actualGem.gemEffect?.category} | +{actualGem.gemEffect?.value}</div>
                                      <div className="text-red-400 mt-1 font-bold">Clique para Remover</div>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div 
                                  key={idx} 
                                  onClick={() => setSocketingSlot(slot)}
                                  className="w-10 h-10 rounded-xl bg-slate-900 border border-dashed border-slate-700 flex items-center justify-center cursor-pointer hover:border-pink-500/50 hover:bg-pink-900/20 transition-all text-slate-500 hover:text-pink-400 shadow-inner"
                                >
                                  +
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ── Anéis (10 Dedos) — Compact Ring Panel ── */}
              <div className="mt-6 bg-slate-900/80 p-5 rounded-2xl border border-slate-700/80 shadow-inner hover:border-amber-500/30 transition-colors">
                <label className="block text-xs font-bold text-amber-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                  💍 Anéis — 10 Dedos
                  <span className="text-slate-500 font-normal normal-case text-[10px]">
                    ({fingerSlots.filter(s => equippedAccessories[s]).length}/10 equipados)
                  </span>
                </label>
                
                <div className="grid grid-cols-2 gap-x-6 gap-y-0">
                  {/* Left Hand Header */}
                  <div className="text-center text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2 pb-1 border-b border-slate-700/50">
                    🤚 Mão Esquerda
                  </div>
                  {/* Right Hand Header */}
                  <div className="text-center text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2 pb-1 border-b border-slate-700/50">
                    Mão Direita 🤚
                  </div>
                  
                  {fingerSlots.slice(0, 5).map((slot, idx) => {
                    const equippedItem = equippedAccessories[slot];
                    const ringItems = accessoryItems.filter(i => i.accessorySlot === 'Dedo');
                    const alreadyEquippedIds = new Set(
                      fingerSlots.filter(s => s !== slot).map(s => equippedAccessories[s]?.id).filter(Boolean)
                    );
                    const availableRings = ringItems.filter(i => !alreadyEquippedIds.has(i.id) || (i.quantity || 1) > 1);
                    const rightSlot = fingerSlots[idx + 5];
                    const rightEquipped = equippedAccessories[rightSlot];
                    const rightAlreadyIds = new Set(
                      fingerSlots.filter(s => s !== rightSlot).map(s => equippedAccessories[s]?.id).filter(Boolean)
                    );
                    const rightAvailable = ringItems.filter(i => !rightAlreadyIds.has(i.id) || (i.quantity || 1) > 1);

                    return (
                      <div key={slot} className="contents">
                        {/* Left finger */}
                        <div className="flex items-center gap-2 py-1.5 group/finger">
                          <span className="text-[10px] text-slate-500 w-[70px] text-right shrink-0 group-hover/finger:text-amber-400 transition-colors">{FINGER_LABELS[idx]}</span>
                          <select
                            value={equippedItem?.id || ""}
                            onChange={(e) => handleEquipAccessory(slot, e.target.value)}
                            className={`flex-1 bg-slate-800 border rounded-lg px-2 py-1 text-xs focus:outline-none transition-colors min-w-0 ${
                              equippedItem ? 'border-amber-500/40 text-amber-300' : 'border-slate-700/50 text-slate-500'
                            }`}
                          >
                            <option value="">—</option>
                            {availableRings.map(item => (
                              <option key={item.id} value={item.id} className="text-slate-200">{item.name}</option>
                            ))}
                          </select>
                          {equippedItem && equippedItem.gemCapacity && equippedItem.gemCapacity > 0 && (
                            <button
                              onClick={() => setSocketingSlot(slot)}
                              className="w-6 h-6 rounded-md bg-pink-900/30 border border-pink-500/30 flex items-center justify-center text-pink-400 hover:bg-pink-900/60 transition-colors shrink-0"
                              title="Engastar gema"
                            >
                              <Gem size={10} />
                            </button>
                          )}
                        </div>
                        {/* Right finger */}
                        <div className="flex items-center gap-2 py-1.5 group/finger">
                          <select
                            value={rightEquipped?.id || ""}
                            onChange={(e) => handleEquipAccessory(rightSlot, e.target.value)}
                            className={`flex-1 bg-slate-800 border rounded-lg px-2 py-1 text-xs focus:outline-none transition-colors min-w-0 ${
                              rightEquipped ? 'border-amber-500/40 text-amber-300' : 'border-slate-700/50 text-slate-500'
                            }`}
                          >
                            <option value="">—</option>
                            {rightAvailable.map(item => (
                              <option key={item.id} value={item.id} className="text-slate-200">{item.name}</option>
                            ))}
                          </select>
                          <span className="text-[10px] text-slate-500 w-[70px] text-left shrink-0 group-hover/finger:text-amber-400 transition-colors">{FINGER_LABELS[idx + 5]}</span>
                          {rightEquipped && rightEquipped.gemCapacity && rightEquipped.gemCapacity > 0 && (
                            <button
                              onClick={() => setSocketingSlot(rightSlot)}
                              className="w-6 h-6 rounded-md bg-pink-900/30 border border-pink-500/30 flex items-center justify-center text-pink-400 hover:bg-pink-900/60 transition-colors shrink-0"
                              title="Engastar gema"
                            >
                              <Gem size={10} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Show socketed gems summary for equipped rings */}
                {fingerSlots.some(s => equippedAccessories[s]?.socketedGemIds?.length) && (
                  <div className="mt-3 pt-3 border-t border-slate-700/30">
                    <div className="flex flex-wrap gap-1.5">
                      {fingerSlots.map(slot => {
                        const item = equippedAccessories[slot];
                        if (!item?.socketedGemIds?.length) return null;
                        return item.socketedGemIds.map((gemId, gi) => {
                          const gem = inventory.find(i => i.id === gemId);
                          if (!gem) return null;
                          return (
                            <div 
                              key={`${slot}-${gi}`}
                              onClick={() => handleUnsocketGem(slot, gemId)}
                              className="relative group/rg cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-lg bg-pink-900/30 border border-pink-500/40 flex items-center justify-center hover:bg-pink-900/50 transition-colors">
                                <Gem size={11} className="text-pink-300" />
                              </div>
                              <div className="absolute opacity-0 group-hover/rg:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[180px] bg-slate-900 border border-pink-500/50 text-slate-200 text-[10px] p-2 rounded-lg shadow-xl z-20 pointer-events-none transition-opacity">
                                <div className="font-bold text-pink-300">{gem.name}</div>
                                <div className="text-slate-400 text-[9px]">{slot} • {gem.gemEffect?.category}</div>
                                <div className="text-red-400 mt-0.5 font-bold">Clique p/ Remover</div>
                              </div>
                            </div>
                          );
                        });
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de Engaste */}
      <AnimatePresence>
        {socketingSlot && equippedAccessories && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-pink-500/30 rounded-3xl p-6 shadow-2xl shadow-pink-900/20 max-w-lg w-full max-h-[80vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Gem className="text-pink-400" /> Selecionar Gema
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Slot: <span className="text-pink-300 font-bold">{socketingSlot}</span>
                  </p>
                </div>
                <button 
                  onClick={() => setSocketingSlot(null)}
                  className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                {gemItems.filter(g => !usedGemIds.has(g.id)).map(gem => {
                   return (
                     <div key={gem.id} className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex justify-between items-center hover:border-pink-500/50 transition-colors">
                       <div>
                         <div className="font-bold text-slate-200 text-sm">{gem.name}</div>
                         <div className="text-xs text-slate-400 mt-1">{gem.description}</div>
                       </div>
                       <button
                         onClick={() => handleSocketGem(gem.id)}
                         className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-lg text-sm transition-colors"
                       >
                         Selecionar
                       </button>
                     </div>
                   );
                })}
                {gemItems.filter(g => !usedGemIds.has(g.id)).length === 0 && (
                   <div className="text-center py-10 text-slate-500 italic">
                     Nenhuma gema disponível no inventário.
                   </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
