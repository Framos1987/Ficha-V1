import React, { useState } from 'react';
import { Wound, WoundRegion, WoundTissue, WoundSeverity } from '../types';
import { AlertTriangle, Droplets, Brain, TrendingUp, Clock, Heart, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const REGIONS: WoundRegion[] = [
  'Digital','Manual','Pedal','Antebraquial','Crural','Cubital','Genicular',
  'Braquial','Meral','Omal','Pélvica','Abdominal','Lombar','Torácica',
  'Dorsal','Cervical','Facial','Cefálica','Nasal','Auricular','Ocular','Oral'
];

const TISSUES: WoundTissue[] = ['Tegumentar','Muscular','Ósseo'];
const SEVERITIES: WoundSeverity[] = ['Leve','Moderada','Severa','Extrema'];

const SEVERITY_COLORS: Record<WoundSeverity, string> = {
  Leve:     'border-yellow-700/50 bg-yellow-950/20',
  Moderada: 'border-orange-700/50 bg-orange-950/20',
  Severa:   'border-red-700/50 bg-red-950/20',
  Extrema:  'border-red-500/70 bg-red-950/40',
};

const SEVERITY_TEXT: Record<WoundSeverity, string> = {
  Leve:     'text-yellow-400',
  Moderada: 'text-orange-400',
  Severa:   'text-red-400',
  Extrema:  'text-red-300 animate-pulse',
};

function getExtremeLabel(tissue: WoundTissue): string {
  switch (tissue) {
    case 'Tegumentar': return 'DESPELAMENTO';
    case 'Muscular': return 'DESCARNAMENTO';
    case 'Ósseo': return 'DESTROÇAMENTO ÓSSEO';
  }
}

function getHealingTime(tissue: WoundTissue, severity: WoundSeverity, mode: 'natural' | 'treated'): string {
  const matrix: Record<WoundTissue, Record<WoundSeverity, [string, string]>> = {
    Tegumentar: {
      Leve:     ['12 Horas', '6 Horas'],
      Moderada: ['3 Dias', '1 Dia'],
      Severa:   ['2 Semanas', '5 Dias'],
      Extrema:  ['2 Meses', '3 Semanas'],
    },
    Muscular: {
      Leve:     ['3 Dias', '1 Dia'],
      Moderada: ['2 Semanas', '5 Dias'],
      Severa:   ['3 Meses', '3 Semanas'],
      Extrema:  ['8 Meses', '2 Meses'],
    },
    Ósseo: {
      Leve:     ['2 Semanas', '5 Dias'],
      Moderada: ['2 Meses', '3 Semanas'],
      Severa:   ['6 Meses', '2 Meses'],
      Extrema:  ['2 Anos', '6 Meses'],
    },
  };
  return matrix[tissue][severity][mode === 'natural' ? 0 : 1];
}

interface WoundCardProps {
  wound: Wound;
  onUpdate: (updated: Wound) => void;
  onRemove: (id: string) => void;
}

export function WoundCard({ wound, onUpdate, onRemove }: WoundCardProps) {
  const [collapsed, setCollapsed] = useState(false);

  const escalateSeverity = () => {
    const idx = SEVERITIES.indexOf(wound.severity);
    if (idx < SEVERITIES.length - 1) {
      const newSev = SEVERITIES[idx + 1];
      onUpdate({
        ...wound,
        severity: newSev,
        painLevel: wound.painLevel + 1,
        bleedingRate: Math.round((wound.bleedingRate + 0.02) * 100) / 100,
      });
    }
  };

  const sevLabel = wound.severity === 'Extrema' ? getExtremeLabel(wound.tissue) : wound.severity.toUpperCase();

  return (
    <div className={`rounded-2xl border-2 ${SEVERITY_COLORS[wound.severity]} p-4 space-y-3 transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart size={16} className={SEVERITY_TEXT[wound.severity]} />
          <span className={`text-sm font-black uppercase tracking-wider ${SEVERITY_TEXT[wound.severity]}`}>
            {sevLabel}
          </span>
          <span className="text-xs text-slate-500">— {wound.region}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setCollapsed(!collapsed)} className="p-1 text-slate-500 hover:text-slate-300 transition-colors">
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <button onClick={() => onRemove(wound.id)} className="p-1 text-slate-600 hover:text-red-400 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Selectors */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[9px] text-slate-500 uppercase tracking-widest font-black mb-1">Região</label>
              <select
                value={wound.region}
                onChange={e => onUpdate({ ...wound, region: e.target.value as WoundRegion })}
                className="w-full bg-black/40 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:border-red-700 outline-none"
              >
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[9px] text-slate-500 uppercase tracking-widest font-black mb-1">Tecido</label>
              <select
                value={wound.tissue}
                onChange={e => onUpdate({ ...wound, tissue: e.target.value as WoundTissue })}
                className="w-full bg-black/40 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:border-red-700 outline-none"
              >
                {TISSUES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[9px] text-slate-500 uppercase tracking-widest font-black mb-1">Gravidade</label>
              <select
                value={wound.severity}
                onChange={e => onUpdate({ ...wound, severity: e.target.value as WoundSeverity })}
                className="w-full bg-black/40 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:border-red-700 outline-none"
              >
                {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Effects: Pain, Bleeding, Debilitation */}
          <div className="grid grid-cols-3 gap-3">
            {/* Pain */}
            <div className="bg-black/30 rounded-xl p-3 border border-slate-800">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle size={12} className="text-amber-400" />
                <span className="text-[9px] text-amber-400 font-black uppercase tracking-widest">Dor</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onUpdate({ ...wound, painLevel: Math.max(0, wound.painLevel - 1) })}
                  className="w-6 h-6 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded text-slate-400 text-xs font-bold transition-colors">−</button>
                <span className="text-lg font-mono font-bold text-amber-400 w-8 text-center">{wound.painLevel}</span>
                <button onClick={() => onUpdate({ ...wound, painLevel: wound.painLevel + 1 })}
                  className="w-6 h-6 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded text-slate-400 text-xs font-bold transition-colors">+</button>
              </div>
            </div>
            {/* Bleeding */}
            <div className="bg-black/30 rounded-xl p-3 border border-slate-800">
              <div className="flex items-center gap-1.5 mb-2">
                <Droplets size={12} className="text-red-400" />
                <span className="text-[9px] text-red-400 font-black uppercase tracking-widest">Sangue</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onUpdate({ ...wound, bleedingRate: Math.max(0, Math.round((wound.bleedingRate - 0.01) * 100) / 100) })}
                  className="w-6 h-6 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded text-slate-400 text-xs font-bold transition-colors">−</button>
                <span className="text-lg font-mono font-bold text-red-400 w-10 text-center">{wound.bleedingRate.toFixed(2)}</span>
                <button onClick={() => onUpdate({ ...wound, bleedingRate: Math.round((wound.bleedingRate + 0.01) * 100) / 100 })}
                  className="w-6 h-6 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded text-slate-400 text-xs font-bold transition-colors">+</button>
              </div>
            </div>
            {/* Debuff */}
            <div className="bg-black/30 rounded-xl p-3 border border-slate-800">
              <div className="flex items-center gap-1.5 mb-2">
                <Brain size={12} className="text-violet-400" />
                <span className="text-[9px] text-violet-400 font-black uppercase tracking-widest">Debuff</span>
              </div>
              <input
                type="text"
                value={wound.debuff}
                onChange={e => onUpdate({ ...wound, debuff: e.target.value })}
                placeholder="Ex: -50% Vel..."
                className="w-full bg-black/50 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 focus:border-violet-600 outline-none"
              />
            </div>
          </div>

          {/* Escalation Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button onClick={escalateSeverity}
              className="flex items-center justify-center gap-1.5 py-2 bg-amber-900/30 hover:bg-amber-900/50 border border-amber-800/40 rounded-xl text-amber-400 text-[10px] font-bold uppercase tracking-wider transition-all">
              <AlertTriangle size={12} /> Piora Voluntária
            </button>
            <button onClick={escalateSeverity}
              className="flex items-center justify-center gap-1.5 py-2 bg-orange-900/30 hover:bg-orange-900/50 border border-orange-800/40 rounded-xl text-orange-400 text-[10px] font-bold uppercase tracking-wider transition-all">
              <Clock size={12} /> Piora Involuntária
            </button>
            <button onClick={escalateSeverity}
              className="flex items-center justify-center gap-1.5 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-800/40 rounded-xl text-red-400 text-[10px] font-bold uppercase tracking-wider transition-all">
              <TrendingUp size={12} /> Falha Iatrogênica
            </button>
          </div>

          {/* Prognosis */}
          <div className="flex items-center justify-between bg-black/40 rounded-xl p-3 border border-slate-800">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-cyan-400" />
              <span className="text-[10px] text-slate-500 uppercase font-black">Recuperação:</span>
              <span className="text-sm font-mono font-bold text-cyan-400">
                {getHealingTime(wound.tissue, wound.severity, wound.healingMode)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdate({ ...wound, healingMode: wound.healingMode === 'natural' ? 'treated' : 'natural' })}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  wound.healingMode === 'treated'
                    ? 'bg-emerald-900/40 border border-emerald-700/50 text-emerald-400'
                    : 'bg-slate-800 border border-slate-700 text-slate-400'
                }`}
              >
                {wound.healingMode === 'natural' ? '🌿 Natural' : '🏥 Operatório'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
