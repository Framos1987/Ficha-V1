import React, { useState, useMemo } from 'react';
import { 
  Crosshair, Heart, Brain, Zap, Droplets, Shield, Star, 
  Swords, MessageCircle, 
  ShieldAlert, ShieldCheck, Target,
  ChevronDown, ChevronUp, Plus, AlertTriangle, Skull,
  Grab, Footprints, Wind, Accessibility, ArrowUpCircle,
  Wrench, Hand, Sparkles, Package, EyeOff, RotateCcw
} from 'lucide-react';
import { InventoryItem, Wound, TacticalState } from '../types';
import { WeaponCard } from './WeaponCard';
import { WoundCard } from './WoundCard';

interface TacticalTerminalProps {
  currentStatus: Record<string, number>;
  maxStatus: Record<string, number>;
  computedAttributes: Record<string, { base: number; bonus: number }>;
  equippedWeapons: { mainHand: InventoryItem | null; offHand: InventoryItem | null };
  inventory: InventoryItem[];
  tacticalState: TacticalState;
  onTacticalStateChange: (state: TacticalState) => void;
  onStatusChange?: (key: string, val: number) => void;
  charInfo: { level?: number; physicalLevel?: number; intellectualLevel?: number; socialLevel?: number };
}

// ── ACTION DEFINITIONS ────────────────────────────────────────────────

const UNIVERSAL_ACTIONS = [
  { id: 'grab', label: 'Agarrar', icon: Grab, tooltip: 'Força uma Disputa de Vitalidade. Zera Velocidade do alvo.', cost: '1 Ação' },
  { id: 'walk', label: 'Andar', icon: Footprints, tooltip: 'Consome Tempo de Movimento. Move a Velocidade atual.', cost: 'Movimento' },
  { id: 'run', label: 'Correr', icon: Wind, tooltip: 'Consome 2 de Vigor + Tempo de Movimento. Dobra a Velocidade base.', cost: '2 Vigor' },
  { id: 'push', label: 'Empurrar', icon: Accessibility, tooltip: 'Disputa de Vitalidade. Empurra (Carga Horizontal − Peso do Alvo).', cost: '1 Ação' },
  { id: 'standup', label: 'Levantar', icon: ArrowUpCircle, tooltip: 'Encerra condição Derrubado. Custa 1 Seg. de Movimento.', cost: '1 Seg.' },
  { id: 'speak', label: 'Falar', icon: MessageCircle, tooltip: 'Custa Tempo de Fala. Até 10 segundos in-game.', cost: 'Fala' },
  { id: 'prepare', label: 'Preparar', icon: Target, tooltip: 'Reserva uma ação para um gatilho futuro.', cost: '1 Ação' },
  { id: 'break_obj', label: 'Quebrar', icon: Wrench, tooltip: 'Tenta destruir um objeto ou barreira.', cost: '1 Ação' },
  { id: 'interact', label: 'Interagir', icon: Hand, tooltip: 'Ação livre com um objeto (abrir porta, puxar alavanca).', cost: 'Livre' },
  { id: 'act', label: 'Agir', icon: Sparkles, tooltip: 'Ação genérica descrita pelo jogador.', cost: '1 Ação' },
  { id: 'rip', label: 'Arrancar', icon: Grab, tooltip: 'Tenta remover um item do alvo à força.', cost: '1 Ação' },
  { id: 'carry', label: 'Carregar', icon: Package, tooltip: 'Carrega um ser ou objeto. Velocidade reduzida.', cost: 'Contínuo' },
  { id: 'hide', label: 'Esconder', icon: EyeOff, tooltip: 'Requer cobertura. Entra em estado Oculto.', cost: '1 Ação' },
];

const REACTIONS_PRIMARY = [
  { id: 'dodge', label: 'Esquivar', tooltip: 'Custa Reação. Requer Velocidade > 0.', color: 'bg-amber-900/30 border-amber-700/40 text-amber-300 hover:bg-amber-900/50' },
  { id: 'defend', label: 'Defender', tooltip: 'Custa Reação. Requer Velocidade > 0 e Alcance. Pode redirecionar dano.', color: 'bg-blue-900/30 border-blue-700/40 text-blue-300 hover:bg-blue-900/50' },
  { id: 'resist', label: 'Resistir', tooltip: 'Custa Reação. Resiste a Disputas forçadas.', color: 'bg-violet-900/30 border-violet-700/40 text-violet-300 hover:bg-violet-900/50' },
  { id: 'flee', label: 'Fugir', tooltip: 'Custa Reação. Inicia Teste de Fuga.', color: 'bg-emerald-900/30 border-emerald-700/40 text-emerald-300 hover:bg-emerald-900/50' },
  { id: 'block', label: 'Impedir', tooltip: 'Custa Reação. Adiciona Força à defesa de Quebra.', color: 'bg-red-900/30 border-red-700/40 text-red-300 hover:bg-red-900/50' },
];

const REACTIONS_SECONDARY = [
  { id: 'help', label: 'Ajudar' }, { id: 'analyze', label: 'Analisar' },
  { id: 'appreciate', label: 'Apreciar' }, { id: 'conspire', label: 'Conspirar' },
  { id: 'deactivate', label: 'Desativar' }, { id: 'empower', label: 'Empoderar' },
  { id: 'feint', label: 'Fintar' }, { id: 'pursue', label: 'Perseguir' },
  { id: 'search', label: 'Procurar' }, { id: 'touch', label: 'Tocar' },
];

// ── VITAL BAR (compact for Terminal) ──────────────────────────────────

function VitalBar({ id, label, current, max, color, icon: Icon, onUpdate }: {
  id: string; label: string; current: number; max: number; color: string; icon: React.ElementType;
  onUpdate?: (id: string, newVal: number) => void;
}) {
  const pct = max > 0 ? Math.min(100, (current / max) * 100) : 0;
  const critical = pct < 20 && pct > 0;

  return (
    <div className="flex items-center gap-2">
      <Icon size={14} className={color} />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">{label}</span>
          <div className="flex items-center gap-1">
            {onUpdate && (
              <button 
                onClick={() => onUpdate(id, Math.max(0, current - 1))} 
                className="text-[10px] text-slate-500 hover:text-slate-200 px-1 hover:bg-slate-800 rounded transition-colors"
                title="Consumir / Sofrer Dano"
              ">−</button>
            )}
            <span className={`text-[10px] font-mono font-bold ${color}`}>{current}/{max}</span>
            {onUpdate && (
              <button 
                onClick={() => onUpdate(id, Math.min(max, current + 1))} 
                className="text-[10px] text-slate-500 hover:text-slate-200 px-1 hover:bg-slate-800 rounded transition-colors"
                title="Recuperar"
              >+</button>
            )}
          </div>
        </div>
        <div className="h-2 bg-black/60 rounded-full overflow-hidden border border-slate-800/50">
          <div
            className={`h-full rounded-full transition-all duration-700 ${critical ? 'animate-pulse' : ''}`}
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${color.includes('red') ? '#dc2626' : color.includes('blue') ? '#2563eb' : color.includes('amber') ? '#d97706' : color.includes('emerald') ? '#059669' : color.includes('violet') ? '#7c3aed' : color.includes('cyan') ? '#0891b2' : '#6366f1'}, ${color.includes('red') ? '#f87171' : color.includes('blue') ? '#60a5fa' : color.includes('amber') ? '#fbbf24' : color.includes('emerald') ? '#34d399' : color.includes('violet') ? '#a78bfa' : color.includes('cyan') ? '#22d3ee' : '#818cf8'})`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────

export function TacticalTerminal({
  currentStatus, maxStatus, computedAttributes,
  equippedWeapons, inventory, tacticalState, onTacticalStateChange, onStatusChange, charInfo,
}: TacticalTerminalProps) {

  const [showSecondaryReactions, setShowSecondaryReactions] = useState(false);
  const [traumaDamageInput, setTraumaDamageInput] = useState(0);
  const [showTraumaPanel, setShowTraumaPanel] = useState(true);

  // ── Computed values ──
  const totalLevel = (charInfo.physicalLevel || 0) + (charInfo.intellectualLevel || 0) + (charInfo.socialLevel || 0);
  const actionEconomy = 1 + Math.floor(totalLevel / 100);
  const reactionEconomy = 1 + Math.floor(totalLevel / 100);

  const getTot = (name: string) => (computedAttributes[name]?.base || 0) + (computedAttributes[name]?.bonus || 0);
  const sorte = getTot('Sorte');
  const constituicao = getTot('Constituição');
  const forca = getTot('Força');
  const destreza = getTot('Destreza');
  const inteligencia = getTot('Inteligência');
  const carisma = getTot('Carisma');

  const extrapolateMaxCharges = Math.max(1, Math.floor(sorte / 10));
  const extrapolateChargesLeft = extrapolateMaxCharges - tacticalState.extrapolateChargesUsed;

  // ── Global wound aggregation ──
  const globalPain = tacticalState.wounds.reduce((sum, w) => sum + w.painLevel, 0);
  const globalBleeding = tacticalState.wounds.reduce((sum, w) => sum + w.bleedingRate, 0);

  // ── Trauma severity from raw damage ──
  const traumaSeverity = useMemo(() => {
    if (traumaDamageInput <= 0) return null;
    if (traumaDamageInput >= constituicao * 5) return { level: 'extreme', label: 'TESTE EXTRAORDINÁRIO! RISCO DE DESTROÇAMENTO/EVISCERAÇÃO', color: 'bg-red-600/30 border-red-500 text-red-300 animate-pulse' };
    if (traumaDamageInput >= constituicao * 2) return { level: 'hard', label: 'TESTE EXTREMAMENTE DIFÍCIL EXIGIDO', color: 'bg-orange-600/20 border-orange-500 text-orange-300' };
    if (traumaDamageInput >= constituicao) return { level: 'medium', label: 'TESTE DIFÍCIL DE RESISTÊNCIA EXIGIDO', color: 'bg-yellow-600/20 border-yellow-500 text-yellow-300' };
    return null;
  }, [traumaDamageInput, constituicao]);

  // ── Handlers ──
  const useExtrapolar = () => {
    if (extrapolateChargesLeft <= 0) return;
    onTacticalStateChange({
      ...tacticalState,
      extrapolateChargesUsed: tacticalState.extrapolateChargesUsed + 1,
    });
  };

  const addWound = () => {
    const newWound: Wound = {
      id: Math.random().toString(36).substring(2, 10),
      region: 'Torácica',
      tissue: 'Tegumentar',
      severity: 'Leve',
      painLevel: 1,
      bleedingRate: 0.00,
      debuff: '',
      healingMode: 'natural',
      timestamp: Date.now(),
    };
    onTacticalStateChange({
      ...tacticalState,
      wounds: [...tacticalState.wounds, newWound],
    });
  };

  const updateWound = (updated: Wound) => {
    onTacticalStateChange({
      ...tacticalState,
      wounds: tacticalState.wounds.map(w => w.id === updated.id ? updated : w),
    });
  };

  const removeWound = (id: string) => {
    onTacticalStateChange({
      ...tacticalState,
      wounds: tacticalState.wounds.filter(w => w.id !== id),
    });
  };

  // ── Find equipped weapons in inventory ──
  const mainWeapon = inventory.find(i => i.id === equippedWeapons.mainHand?.id);
  const offWeapon = inventory.find(i => i.id === equippedWeapons.offHand?.id);

  const getAttackBonus = (weapon?: InventoryItem) => {
    if (!weapon?.description) return { attrFlat: 0 };
    const match = weapon.description.match(/Ataque (Físico|Mágico|Místico) (Armado|Desarmado|Propulsivo)/);
    if (!match) return { attrFlat: 0 };
    const type = match[1];
    
    // Attribute flat bonus for damage
    let attrFlat = 0;
    if (type === 'Físico') attrFlat = Math.floor(forca / 5);
    else if (type === 'Mágico') attrFlat = Math.floor(inteligencia / 5);
    else if (type === 'Místico') attrFlat = Math.floor(carisma / 5);
    
    return { attrFlat };
  };

  return (
    <div className="space-y-0 bg-slate-950 rounded-3xl border border-red-900/20 shadow-[0_0_60px_rgba(127,29,29,0.08)] overflow-hidden"
      style={{
        backgroundImage: `
          linear-gradient(rgba(15,23,42,0.97), rgba(15,23,42,0.97)),
          linear-gradient(90deg, rgba(100,116,139,0.03) 1px, transparent 1px),
          linear-gradient(rgba(100,116,139,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100%, 20px 20px, 20px 20px',
      }}
    >
      {/* ══════════════════════════════════════════════════════════════════
          ZONA A: BIO-MONITOR (Sticky Header)
         ══════════════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-red-900/20 p-4">
        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Crosshair size={20} className="text-red-500" />
            <h2 className="text-lg font-black text-white uppercase tracking-wider">Terminal Tático</h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Action Economy */}
            <div className="flex items-center gap-2 bg-black/40 rounded-xl px-3 py-1.5 border border-slate-800">
              <Swords size={14} className="text-amber-400" />
              <span className="text-[9px] text-slate-500 uppercase font-black">Ações</span>
              <span className="text-xl font-mono font-black text-amber-400">{actionEconomy}</span>
            </div>
            <div className="flex items-center gap-2 bg-black/40 rounded-xl px-3 py-1.5 border border-slate-800">
              <ShieldCheck size={14} className="text-blue-400" />
              <span className="text-[9px] text-slate-500 uppercase font-black">Reações</span>
              <span className="text-xl font-mono font-black text-blue-400">{reactionEconomy}</span>
            </div>
          </div>
        </div>

        {/* Vital Tanks */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-3">
          <VitalBar id="vida" label="Vida" current={currentStatus.vida || 0} max={maxStatus.vida || 1} color="text-red-400" icon={Heart} onUpdate={onStatusChange} />
          <VitalBar id="sanidade" label="Sanidade" current={currentStatus.sanidade || 0} max={maxStatus.sanidade || 1} color="text-violet-400" icon={Brain} onUpdate={onStatusChange} />
          <VitalBar id="vigor" label="Vigor" current={currentStatus.vigor || 0} max={maxStatus.vigor || 1} color="text-emerald-400" icon={Zap} onUpdate={onStatusChange} />
          <VitalBar id="mana" label="Mana" current={currentStatus.mana || 0} max={maxStatus.mana || 1} color="text-blue-400" icon={Droplets} onUpdate={onStatusChange} />
          <VitalBar id="poder" label="Poder" current={currentStatus.poder || 0} max={maxStatus.poder || 1} color="text-amber-400" icon={Star} onUpdate={onStatusChange} />
          <VitalBar id="aura" label="Aura" current={currentStatus.aura || 0} max={maxStatus.aura || 1} color="text-cyan-400" icon={Shield} onUpdate={onStatusChange} />
        </div>

        {/* Symptomatology + Extrapolate */}
        <div className="flex flex-wrap items-center gap-2">
          {globalPain > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-900/30 border border-amber-700/40 rounded-xl">
              <span className="text-sm">💥</span>
              <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Dor Global:</span>
              <span className="text-sm font-mono font-black text-amber-400">{globalPain}</span>
            </div>
          )}
          {globalBleeding > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-900/40 border border-red-600/40 rounded-xl animate-pulse">
              <span className="text-sm">🩸</span>
              <span className="text-[10px] text-red-300 font-bold uppercase tracking-wider">Sangramento:</span>
              <span className="text-sm font-mono font-black text-red-400">{globalBleeding.toFixed(2)}/turno</span>
            </div>
          )}
          <div className="ml-auto">
            <button
              onClick={useExtrapolar}
              disabled={extrapolateChargesLeft <= 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm uppercase tracking-wider transition-all ${
                extrapolateChargesLeft > 0
                  ? 'bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white shadow-lg shadow-amber-900/30 active:scale-95'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <RotateCcw size={16} />
              Extrapolar ({extrapolateChargesLeft}/{extrapolateMaxCharges})
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          ZONAS B & C: AÇÕES + REAÇÕES (Grid Principal)
         ══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border-b border-red-900/10">
        {/* ── ZONA B: Ações (2/3) ── */}
        <div className="lg:col-span-2 p-4 border-r border-red-900/10 space-y-5">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <Swords size={14} className="text-amber-500" /> Matriz de Ações
          </h3>

          {/* Universal Actions Grid */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-1.5">
            {UNIVERSAL_ACTIONS.map(action => (
              <button
                key={action.id}
                title={`${action.tooltip} [${action.cost}]`}
                className="flex flex-col items-center gap-1 p-2.5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-slate-600/60 rounded-xl transition-all hover:scale-105 active:scale-95 group"
              >
                <action.icon size={16} className="text-slate-400 group-hover:text-amber-400 transition-colors" />
                <span className="text-[9px] text-slate-500 group-hover:text-slate-300 font-bold uppercase tracking-wider transition-colors">{action.label}</span>
                <span className="text-[8px] text-slate-700 font-mono">{action.cost}</span>
              </button>
            ))}
          </div>

          {/* Weapon Cards */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Armamento Equipado</h4>
            {mainWeapon && (() => {
              const { attrFlat } = getAttackBonus(mainWeapon);
              return (
                <WeaponCard
                  weapon={mainWeapon}
                  attributeBonus={attrFlat}
                  dificuldadeBase={destreza}
                />
              );
            })()}
            {offWeapon && (() => {
              const { attrFlat } = getAttackBonus(offWeapon);
              return (
                <WeaponCard
                  weapon={offWeapon}
                  attributeBonus={attrFlat}
                  dificuldadeBase={destreza}
                />
              );
            })()}
            {!mainWeapon && !offWeapon && (
              <div className="text-center py-8 text-slate-600 text-sm italic">Nenhuma arma equipada. Equipe armas no Arsenal.</div>
            )}
          </div>
        </div>

        {/* ── ZONA C: Reações (1/3) ── */}
        <div className="p-4 space-y-4">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <ShieldAlert size={14} className="text-blue-500" /> Matriz de Reações
          </h3>

          {/* Primary Reactions */}
          <div className="space-y-2">
            <span className="text-[9px] text-red-500 font-black uppercase tracking-widest">Sobrevivência Imediata</span>
            {REACTIONS_PRIMARY.map(r => (
              <button
                key={r.id}
                title={r.tooltip}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl border font-bold text-sm uppercase tracking-wider transition-all active:scale-95 ${r.color}`}
              >
                <ShieldCheck size={16} />
                {r.label}
              </button>
            ))}
          </div>

          {/* Secondary Reactions Accordion */}
          <div>
            <button
              onClick={() => setShowSecondaryReactions(!showSecondaryReactions)}
              className="flex items-center justify-between w-full text-[10px] text-slate-500 uppercase font-black tracking-widest py-2 hover:text-slate-300 transition-colors"
            >
              Reações Táticas & Sociais
              {showSecondaryReactions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showSecondaryReactions && (
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                {REACTIONS_SECONDARY.map(r => (
                  <button
                    key={r.id}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/50 hover:bg-slate-800/70 border border-slate-800/50 rounded-lg text-[10px] text-slate-400 hover:text-slate-200 font-bold uppercase tracking-wider transition-all"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          ZONA D: PRONTUÁRIO DE TRAUMAS
         ══════════════════════════════════════════════════════════════════ */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowTraumaPanel(!showTraumaPanel)}
            className="flex items-center gap-2"
          >
            <Skull size={16} className="text-red-500" />
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Prontuário de Traumas</h3>
            <span className="text-[10px] font-mono text-red-500 bg-red-950/40 px-2 py-0.5 rounded-full border border-red-900/40">{tacticalState.wounds.length}</span>
            {showTraumaPanel ? <ChevronUp size={14} className="text-slate-600" /> : <ChevronDown size={14} className="text-slate-600" />}
          </button>
        </div>

        {showTraumaPanel && (
          <div className="space-y-4">
            {/* Damage Calculator */}
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest whitespace-nowrap">Dano Bruto Sofrido:</label>
                <input
                  type="number"
                  value={traumaDamageInput || ''}
                  onChange={e => setTraumaDamageInput(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-24 bg-black/50 border border-slate-700 rounded-xl px-3 py-2 text-lg font-mono font-bold text-red-400 text-center focus:border-red-600 outline-none"
                  placeholder="0"
                />
                <span className="text-[10px] text-slate-600 font-mono">(Con: {constituicao})</span>
              </div>
              {traumaSeverity && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-xs ${traumaSeverity.color}`}>
                  <AlertTriangle size={14} />
                  {traumaSeverity.label}
                </div>
              )}
            </div>

            {/* Add Wound Button */}
            <button
              onClick={addWound}
              className="flex items-center gap-2 px-4 py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-800/30 hover:border-red-700/50 rounded-xl text-red-400 text-xs font-bold uppercase tracking-wider transition-all"
            >
              <Plus size={14} /> Registrar Ferimento
            </button>

            {/* Wound Cards */}
            <div className="space-y-3">
              {tacticalState.wounds.map(wound => (
                <WoundCard
                  key={wound.id}
                  wound={wound}
                  onUpdate={updateWound}
                  onRemove={removeWound}
                />
              ))}
              {tacticalState.wounds.length === 0 && (
                <div className="text-center py-6 text-slate-700 text-sm italic border border-dashed border-slate-800 rounded-2xl">
                  Nenhum ferimento registrado. O personagem está intacto.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
