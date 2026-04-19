import React, { useState, useMemo } from 'react';
import { InventoryItem } from '../types';
import { Sword, ChevronDown, ChevronUp, Hand, Grip, AlertTriangle } from 'lucide-react';

interface WeaponCardProps {
  weapon: InventoryItem;
  attributeBonus: number;  // The raw attribute/5 bonus for flat damage
  dificuldadeBase: number; // Dificuldade Armada (Destreza)
}

// Parse weapon data from description: e.g. "Ataque Físico Armado + 6d10 (Físico)"
function parseWeaponData(desc?: string) {
  if (!desc) return null;
  
  const atkMatch = desc.match(/Ataque (Físico|Mágico|Místico) (Armado|Desarmado|Propulsivo)\s*\+\s*(.+?)(?:\||$)/);
  if (!atkMatch) return null;

  const damageType = atkMatch[1]; // Físico, Mágico, Místico
  const weaponStyle = atkMatch[2]; // Armado, Desarmado, Propulsivo
  const diceExpr = atkMatch[3].trim(); // e.g. "6d10" or "3d6 + 2"

  // Parse dice: NdX
  const diceMatch = diceExpr.match(/(\d+)d(\d+)/);
  const numDice = diceMatch ? parseInt(diceMatch[1]) : 1;
  const dieSize = diceMatch ? parseInt(diceMatch[2]) : 1;

  return { damageType, weaponStyle, diceExpr, numDice, dieSize };
}

// Attack type conditions
const ATTACK_TYPES = [
  { id: 'simple', label: 'Simples', cost: '1 Ação', diffMod: 0, note: '' },
  { id: 'head', label: 'Preciso — Cabeça', cost: '1 Ação', diffMod: 20, note: 'Ignora armaduras que não protegem o crânio.' },
  { id: 'eyes', label: 'Preciso — Olhos/Ouvidos', cost: '1 Ação', diffMod: 50, note: 'Dano localizado em órgão sensorial.' },
  { id: 'breach', label: 'Brecha / Oportunidade', cost: '1 Reação', diffMod: 0, note: 'Consome Reação ao invés de Ação.' },
  { id: 'break', label: 'Disputa de Quebra', cost: '1 Ação', diffMod: 0, note: 'Visa destruir um membro específico.' },
];

const BREAK_TARGETS = [
  { label: 'Ombro / Braço', mult: 'Con ×10' },
  { label: 'Cabeça / Costas', mult: 'Con ×25' },
  { label: 'Cotovelo / Mão / Dedo', mult: 'Con ×2' },
];

const CONDITION_CHECKS = [
  { id: 'altiva', label: 'Altiva', diffMod: -5, damageMult: 1, note: '' },
  { id: 'cercada', label: 'Cercada', diffMod: -10, damageMult: 1, note: '' },
  { id: 'derrubada', label: 'Derrubada', diffMod: -10, damageMult: 1, note: '' },
  { id: 'flanqueada', label: 'Flanqueada', diffMod: -5, damageMult: 1, note: '' },
  { id: 'furtiva', label: 'Furtiva / Oculta', diffMod: -25, damageMult: 2, note: '' },
  { id: 'assassina', label: 'Assassina', diffMod: -50, damageMult: 2, note: 'Requer: Alvo Paralisado.' },
  { id: 'misericordiosa', label: 'Misericordiosa', diffMod: -100, damageMult: 10, note: 'Requer: Alvo Inconsciente.' },
  { id: 'mortal', label: 'Mortal', diffMod: 0, damageMult: 3, note: 'Requer: Conhecer fraqueza.' },
];

export function WeaponCard({ weapon, attributeBonus, dificuldadeBase }: WeaponCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [twoHanded, setTwoHanded] = useState(false);
  const [attackType, setAttackType] = useState('simple');
  const [breakTarget, setBreakTarget] = useState(0);
  const [conditions, setConditions] = useState<Record<string, boolean>>({});

  const parsed = useMemo(() => parseWeaponData(weapon.description), [weapon.description]);

  // Statistical analysis tag
  const isBellCurve = parsed && parsed.numDice > 1;
  const statTag = isBellCurve
    ? { label: '🔔 Curva de Sino', color: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40' }
    : { label: '⚠️ Dano Caótico', color: 'text-amber-400 bg-amber-950/40 border-amber-800/40' };

  // Compute effective attribute bonus based on grip
  const effectiveAttrBonus = twoHanded ? attributeBonus * 2 : attributeBonus;

  // Compute difficulty modifier
  const selectedAttackType = ATTACK_TYPES.find(a => a.id === attackType) || ATTACK_TYPES[0];
  const conditionDiffMod = Object.entries(conditions)
    .filter(([_, active]) => active)
    .reduce((sum, [id]) => {
      const c = CONDITION_CHECKS.find(cc => cc.id === id);
      return sum + (c?.diffMod || 0);
    }, 0);
  const totalDiffMod = selectedAttackType.diffMod + conditionDiffMod;

  // Compute damage multiplier from conditions
  const conditionDamageMult = Object.entries(conditions)
    .filter(([_, active]) => active)
    .reduce((mult, [id]) => {
      const c = CONDITION_CHECKS.find(cc => cc.id === id);
      return c && c.damageMult > 1 ? mult * c.damageMult : mult;
    }, 1);

  const diceStr = parsed ? `${parsed.numDice}d${parsed.dieSize}` : '?';
  const damageFormula = `(${diceStr}) + ${effectiveAttrBonus}`;
  const fullFormula = conditionDamageMult > 1
    ? `[ ${damageFormula} ] × ${conditionDamageMult}`
    : damageFormula;

  // Damage type color
  const typeColor = parsed?.damageType === 'Físico' ? 'text-red-400' : parsed?.damageType === 'Mágico' ? 'text-blue-400' : 'text-purple-400';
  const typeBorder = parsed?.damageType === 'Físico' ? 'border-l-red-600' : parsed?.damageType === 'Mágico' ? 'border-l-blue-600' : 'border-l-purple-600';

  return (
    <div className={`bg-slate-900/80 rounded-2xl border border-slate-700/50 border-l-4 ${typeBorder} overflow-hidden transition-all duration-300`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Sword size={18} className={typeColor} />
          <div className="text-left">
            <div className="font-bold text-slate-200 text-sm">{weapon.name}</div>
            <div className="flex items-center gap-2 mt-0.5">
              {parsed && (
                <span className={`text-[10px] font-bold ${typeColor}`}>
                  Dano {parsed.damageType} {parsed.weaponStyle}
                </span>
              )}
              <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${statTag.color}`}>
                {statTag.label}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className={`font-mono font-bold text-sm ${typeColor}`}>{diceStr} + {effectiveAttrBonus}</div>
            <div className="text-[10px] text-slate-500">{weapon.weight.toFixed(2)} kg</div>
          </div>
          {expanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-slate-800 p-4 space-y-4">
          {/* Grip Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Empunhadura:</span>
            <div className="flex bg-slate-800 rounded-xl p-0.5 border border-slate-700">
              <button
                onClick={() => setTwoHanded(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!twoHanded ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                <Hand size={14} /> 1 Mão
              </button>
              <button
                onClick={() => setTwoHanded(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${twoHanded ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                <Grip size={14} /> 2 Mãos
              </button>
            </div>
            {twoHanded && (
              <span className="text-[10px] text-emerald-400 font-mono">Bônus Fixo ×2 → +{effectiveAttrBonus}</span>
            )}
          </div>

          {/* Attack Type */}
          <div>
            <label className="block text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1.5">Tipo de Ataque</label>
            <select
              value={attackType}
              onChange={e => setAttackType(e.target.value)}
              className="w-full bg-black/40 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-red-700 outline-none"
            >
              {ATTACK_TYPES.map(at => (
                <option key={at.id} value={at.id}>{at.label} ({at.cost})</option>
              ))}
            </select>
            {selectedAttackType.diffMod > 0 && (
              <div className="mt-1.5 flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                <AlertTriangle size={12} />
                Modificador de Dificuldade: +{selectedAttackType.diffMod}
              </div>
            )}
            {selectedAttackType.note && (
              <div className="mt-1 text-[10px] text-slate-500 italic">{selectedAttackType.note}</div>
            )}

            {/* Break sub-targets */}
            {attackType === 'break' && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {BREAK_TARGETS.map((bt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setBreakTarget(idx)}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                      breakTarget === idx
                        ? 'bg-red-900/40 border-red-700/50 text-red-300'
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div>{bt.label}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">Defesa: {bt.mult}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Condition Checkboxes */}
          <div>
            <label className="block text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Condições de Ataque</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
              {CONDITION_CHECKS.map(cc => (
                <label key={cc.id} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border cursor-pointer transition-all text-[10px] font-medium ${
                  conditions[cc.id]
                    ? 'bg-red-900/30 border-red-700/40 text-red-300'
                    : 'bg-slate-800/30 border-slate-700/40 text-slate-500 hover:text-slate-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={conditions[cc.id] || false}
                    onChange={e => setConditions(prev => ({ ...prev, [cc.id]: e.target.checked }))}
                    className="w-3 h-3 accent-red-500"
                  />
                  <span>{cc.label}</span>
                  {cc.diffMod !== 0 && <span className="text-emerald-400 ml-auto">{cc.diffMod}</span>}
                  {cc.damageMult > 1 && <span className="text-red-400">×{cc.damageMult}</span>}
                </label>
              ))}
            </div>
          </div>

          {/* LCD Resolution Display */}
          <div className="bg-black rounded-2xl border border-cyan-900/50 p-4 font-mono shadow-[0_0_20px_rgba(6,182,212,0.08)]">
            <div className="text-[9px] text-cyan-700 uppercase tracking-[0.2em] mb-3">⬡ VISOR DE RESOLUÇÃO</div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[9px] text-slate-600 uppercase tracking-widest mb-1">Dificuldade</div>
                <div className="text-2xl font-black text-cyan-400">
                  {dificuldadeBase}
                  {totalDiffMod !== 0 && (
                    <span className={totalDiffMod > 0 ? 'text-red-400' : 'text-emerald-400'}>
                      {' '}{totalDiffMod > 0 ? '+' : ''}{totalDiffMod}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-600">
                  Rolagem alvo: {dificuldadeBase + totalDiffMod}
                </div>
              </div>

              <div>
                <div className="text-[9px] text-slate-600 uppercase tracking-widest mb-1">Dano</div>
                <div className={`text-lg font-black ${typeColor}`}>
                  {fullFormula}
                </div>
                {parsed && (
                  <div className="text-[10px] text-slate-600">
                    Min: {parsed.numDice + effectiveAttrBonus}{conditionDamageMult > 1 ? ` × ${conditionDamageMult} = ${(parsed.numDice + effectiveAttrBonus) * conditionDamageMult}` : ''}
                    {' '}| Méd: {Math.floor(parsed.numDice * (parsed.dieSize + 1) / 2) + effectiveAttrBonus}{conditionDamageMult > 1 ? ` × ${conditionDamageMult} = ${(Math.floor(parsed.numDice * (parsed.dieSize + 1) / 2) + effectiveAttrBonus) * conditionDamageMult}` : ''}
                    {' '}| Max: {parsed.numDice * parsed.dieSize + effectiveAttrBonus}{conditionDamageMult > 1 ? ` × ${conditionDamageMult} = ${(parsed.numDice * parsed.dieSize + effectiveAttrBonus) * conditionDamageMult}` : ''}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
