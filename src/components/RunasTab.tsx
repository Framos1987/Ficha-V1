import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Power, Zap, Info, Package, User } from "lucide-react";
import { InventoryItem, EquippedRunes, ActiveRune, EquippedWeapons, EquippedArmor, EquippedAccessories } from "../types";
import { RUNE_COLOR_CLASSES } from "../lib/runeCatalog";

interface RunasTabProps {
  inventory: InventoryItem[];
  equippedRunes: EquippedRunes;
  setEquippedRunes: (r: EquippedRunes) => void;
  equippedWeapons?: EquippedWeapons;
  equippedArmor?: EquippedArmor;
  equippedAccessories?: EquippedAccessories;
}

// Collect all equipped items (weapons + armor + accessories) for object rune assignment
function getEquippableItems(
  equippedWeapons?: EquippedWeapons,
  equippedArmor?: EquippedArmor,
  equippedAccessories?: EquippedAccessories
): { id: string; label: string; item: InventoryItem }[] {
  const result: { id: string; label: string; item: InventoryItem }[] = [];

  if (equippedWeapons?.mainHand) result.push({ id: equippedWeapons.mainHand.id, label: `Mão Direita — ${equippedWeapons.mainHand.name}`, item: equippedWeapons.mainHand });
  if (equippedWeapons?.offHand) result.push({ id: equippedWeapons.offHand.id, label: `Mão Esquerda — ${equippedWeapons.offHand.name}`, item: equippedWeapons.offHand });

  if (equippedArmor) {
    Object.entries(equippedArmor).forEach(([part, layers]) => {
      Object.entries(layers).forEach(([layer, item]) => {
        if (item) result.push({ id: item.id, label: `${part} (${layer}) — ${item.name}`, item });
      });
    });
  }

  if (equippedAccessories) {
    Object.entries(equippedAccessories).forEach(([slot, item]) => {
      if (item) result.push({ id: item.id, label: `${slot} — ${item.name}`, item });
    });
  }

  // Deduplicate by item id
  const seen = new Set<string>();
  return result.filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true; });
}

// Get color palette from a rune item name
function getRuneColor(item: InventoryItem) {
  const n = item.name;
  if (n.includes("Conservação")) return RUNE_COLOR_CLASSES.emerald;
  if (n.includes("Preservação")) return RUNE_COLOR_CLASSES.cyan;
  if (n.includes("Destruição")) return RUNE_COLOR_CLASSES.red;
  if (n.includes("Morte")) return RUNE_COLOR_CLASSES.violet;
  if (n.includes("Alvorada")) return RUNE_COLOR_CLASSES.yellow;
  if (n.includes("Crepúsculo")) return RUNE_COLOR_CLASSES.indigo;
  if (n.includes("Aquecimento")) return RUNE_COLOR_CLASSES.orange;
  if (n.includes("Resfriamento")) return RUNE_COLOR_CLASSES.blue;
  return RUNE_COLOR_CLASSES.indigo;
}

// Toggle Switch component
function ToggleSwitch({ active, onChange, disabled }: { active: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shrink-0 ${
        active ? "bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" : "bg-slate-700"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          active ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// Rune Card component
function RuneCard({
  item,
  activeRune,
  onToggle,
  onChangeTarget,
  equippableItems,
  isObject,
}: {
  item: InventoryItem;
  activeRune: ActiveRune | null;
  onToggle: () => void;
  onChangeTarget?: (itemId: string) => void;
  equippableItems?: { id: string; label: string; item: InventoryItem }[];
  isObject: boolean;
}) {
  const colors = getRuneColor(item);
  const isActive = activeRune?.active ?? false;
  const [showInfo, setShowInfo] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-4 transition-all duration-300 ${
        isActive
          ? `${colors.border} ${colors.bg} shadow-lg`
          : "border-slate-700/60 bg-slate-900/40"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Toggle */}
        <div className="mt-0.5">
          <ToggleSwitch active={isActive} onChange={onToggle} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-sm font-bold ${isActive ? colors.text : "text-slate-300"}`}>
              {item.name}
            </span>
            {item.runePotenciaName && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${colors.badge}`}>
                {item.runePotenciaName}
              </span>
            )}
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
              item.runeAnchor === 'Ser'
                ? 'border-violet-500/40 text-violet-400 bg-violet-900/20'
                : 'border-amber-500/40 text-amber-400 bg-amber-900/20'
            }`}>
              {item.runeAnchor === 'Ser' ? '👤 Ser' : '📦 Objeto'}
            </span>
          </div>

          {item.runeEffect && (
            <p className={`text-xs leading-relaxed ${isActive ? colors.text : "text-slate-500"}`}>
              {item.runeEffect.description}
            </p>
          )}

          {/* Object target selector */}
          {isObject && isActive && equippableItems && onChangeTarget && (
            <div className="mt-3">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">
                Aplicar em:
              </label>
              <select
                value={activeRune?.appliedToItemId || ""}
                onChange={e => onChangeTarget(e.target.value)}
                className={`w-full bg-slate-800 border rounded-xl px-3 py-1.5 text-xs focus:outline-none transition-colors ${colors.border} ${colors.text}`}
              >
                <option value="">— Selecionar Item Equipado —</option>
                {equippableItems.map(ei => (
                  <option key={ei.id} value={ei.id}>{ei.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Info tooltip */}
          {item.description && (
            <button
              onClick={() => setShowInfo(v => !v)}
              className="mt-2 flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
            >
              <Info size={11} />
              {showInfo ? "Ocultar detalhes" : "Ver detalhes"}
            </button>
          )}
          <AnimatePresence>
            {showInfo && item.description && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="mt-2 text-[11px] text-slate-400 leading-relaxed bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                  {item.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export function RunasTab({
  inventory,
  equippedRunes,
  setEquippedRunes,
  equippedWeapons,
  equippedArmor,
  equippedAccessories,
}: RunasTabProps) {
  const [activeSection, setActiveSection] = useState<'ser' | 'objeto'>('ser');

  const bodyRuneItems = inventory.filter(i => i.category === 'Runas' && i.runeAnchor === 'Ser');
  const objectRuneItems = inventory.filter(i => i.category === 'Runas' && i.runeAnchor === 'Objeto');
  const equippableItems = getEquippableItems(equippedWeapons, equippedArmor, equippedAccessories);

  const activeBodyCount = equippedRunes.bodyRunes.filter(r => r.active).length;
  const activeObjectCount = equippedRunes.objectRunes.filter(r => r.active).length;

  const getBodyRune = (itemId: string): ActiveRune | null =>
    equippedRunes.bodyRunes.find(r => r.runeInventoryId === itemId) ?? null;

  const getObjectRune = (itemId: string): ActiveRune | null =>
    equippedRunes.objectRunes.find(r => r.runeInventoryId === itemId) ?? null;

  // Toggle a body rune
  const handleToggleBodyRune = (itemId: string) => {
    const existing = equippedRunes.bodyRunes.find(r => r.runeInventoryId === itemId);
    let newRunes: ActiveRune[];
    if (existing) {
      newRunes = equippedRunes.bodyRunes.map(r =>
        r.runeInventoryId === itemId ? { ...r, active: !r.active } : r
      );
    } else {
      newRunes = [...equippedRunes.bodyRunes, { runeInventoryId: itemId, active: true }];
    }
    setEquippedRunes({ ...equippedRunes, bodyRunes: newRunes });
  };

  // Toggle an object rune
  const handleToggleObjectRune = (itemId: string) => {
    const existing = equippedRunes.objectRunes.find(r => r.runeInventoryId === itemId);
    let newRunes: ActiveRune[];
    if (existing) {
      newRunes = equippedRunes.objectRunes.map(r =>
        r.runeInventoryId === itemId ? { ...r, active: !r.active } : r
      );
    } else {
      newRunes = [...equippedRunes.objectRunes, { runeInventoryId: itemId, active: true }];
    }
    setEquippedRunes({ ...equippedRunes, objectRunes: newRunes });
  };

  // Set the target item for an object rune
  const handleSetObjectTarget = (runeItemId: string, targetItemId: string) => {
    const existing = equippedRunes.objectRunes.find(r => r.runeInventoryId === runeItemId);
    let newRunes: ActiveRune[];
    if (existing) {
      newRunes = equippedRunes.objectRunes.map(r =>
        r.runeInventoryId === runeItemId ? { ...r, appliedToItemId: targetItemId || undefined } : r
      );
    } else {
      newRunes = [...equippedRunes.objectRunes, { runeInventoryId: runeItemId, active: true, appliedToItemId: targetItemId || undefined }];
    }
    setEquippedRunes({ ...equippedRunes, objectRunes: newRunes });
  };

  // Deactivate all
  const handleDeactivateAll = () => {
    setEquippedRunes({
      bodyRunes: equippedRunes.bodyRunes.map(r => ({ ...r, active: false })),
      objectRunes: equippedRunes.objectRunes.map(r => ({ ...r, active: false })),
    });
  };

  return (
    <div className="bg-slate-800 rounded-3xl border border-slate-700 p-6 shadow-xl flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-2xl">ᚱ</span>
            Runas Ativas
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ative ou desative runas mentalmente a qualquer momento
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 text-xs">
            <span className="px-2 py-1 rounded-lg bg-violet-900/30 border border-violet-500/30 text-violet-300">
              <User size={11} className="inline mr-1" />
              {activeBodyCount} corporal{activeBodyCount !== 1 ? 'is' : ''}
            </span>
            <span className="px-2 py-1 rounded-lg bg-amber-900/30 border border-amber-500/30 text-amber-300">
              <Package size={11} className="inline mr-1" />
              {activeObjectCount} em objeto{activeObjectCount !== 1 ? 's' : ''}
            </span>
          </div>
          {(activeBodyCount + activeObjectCount) > 0 && (
            <button
              onClick={handleDeactivateAll}
              className="text-[11px] text-red-400/70 hover:text-red-400 transition-colors border border-red-500/20 hover:border-red-500/40 px-2 py-1 rounded-lg"
            >
              Desativar Todas
            </button>
          )}
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-700/50">
        <button
          onClick={() => setActiveSection('ser')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeSection === 'ser'
              ? 'bg-violet-600/80 text-white shadow-lg shadow-violet-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <User size={16} />
          Runas Corporais
          {bodyRuneItems.length > 0 && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeSection === 'ser' ? 'bg-white/20' : 'bg-slate-700'}`}>
              {bodyRuneItems.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSection('objeto')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeSection === 'objeto'
              ? 'bg-amber-600/80 text-white shadow-lg shadow-amber-900/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Package size={16} />
          Runas em Objetos
          {objectRuneItems.length > 0 && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeSection === 'objeto' ? 'bg-white/20' : 'bg-slate-700'}`}>
              {objectRuneItems.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeSection === 'ser' && (
          <motion.div
            key="ser"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2 }}
          >
            {bodyRuneItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-4">
                <span className="text-6xl opacity-20">ᚱ</span>
                <div className="text-center">
                  <p className="font-medium">Nenhuma Runa Corporal no Inventário</p>
                  <p className="text-xs mt-1 text-slate-600">Adicione Runas do tipo <strong>Ser</strong> pelo Catálogo de Itens no Inventário</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Active Effect Summary */}
                {activeBodyCount > 0 && (
                  <div className="bg-violet-900/20 border border-violet-500/30 rounded-2xl p-4 mb-4">
                    <h4 className="text-xs font-bold text-violet-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Zap size={12} />
                      Efeitos Ativos
                    </h4>
                    <div className="space-y-1">
                      {equippedRunes.bodyRunes
                        .filter(r => r.active)
                        .map(r => {
                          const item = inventory.find(i => i.id === r.runeInventoryId);
                          if (!item?.runeEffect) return null;
                          const colors = getRuneColor(item);
                          return (
                            <div key={r.runeInventoryId} className={`text-xs ${colors.text} flex items-center gap-2`}>
                              <Power size={10} className="shrink-0" />
                              {item.runeEffect.description}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {bodyRuneItems.map(item => (
                  <RuneCard
                    key={item.id}
                    item={item}
                    activeRune={getBodyRune(item.id)}
                    onToggle={() => handleToggleBodyRune(item.id)}
                    isObject={false}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeSection === 'objeto' && (
          <motion.div
            key="objeto"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            {objectRuneItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-4">
                <span className="text-6xl opacity-20">ᚱ</span>
                <div className="text-center">
                  <p className="font-medium">Nenhuma Runa de Objeto no Inventário</p>
                  <p className="text-xs mt-1 text-slate-600">Adicione Runas do tipo <strong>Objeto</strong> pelo Catálogo de Itens no Inventário</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Active Object Runes Summary */}
                {activeObjectCount > 0 && (
                  <div className="bg-amber-900/20 border border-amber-500/30 rounded-2xl p-4 mb-4">
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Zap size={12} />
                      Efeitos em Objetos
                    </h4>
                    <div className="space-y-1">
                      {equippedRunes.objectRunes
                        .filter(r => r.active)
                        .map(r => {
                          const item = inventory.find(i => i.id === r.runeInventoryId);
                          if (!item?.runeEffect) return null;
                          const targetItem = equippableItems.find(ei => ei.id === r.appliedToItemId);
                          const colors = getRuneColor(item);
                          return (
                            <div key={r.runeInventoryId} className={`text-xs ${colors.text} flex items-center gap-2`}>
                              <Power size={10} className="shrink-0" />
                              {item.runeEffect.description}
                              {targetItem && (
                                <span className="text-slate-500">
                                  → {targetItem.item.name}
                                </span>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {objectRuneItems.map(item => (
                  <RuneCard
                    key={item.id}
                    item={item}
                    activeRune={getObjectRune(item.id)}
                    onToggle={() => handleToggleObjectRune(item.id)}
                    onChangeTarget={(targetId) => handleSetObjectTarget(item.id, targetId)}
                    equippableItems={equippableItems}
                    isObject={true}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
