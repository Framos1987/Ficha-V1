import React, { useState } from "react";
import { StatusBar } from "./StatusBar";
import {
  Heart, Zap, Brain, Shield, Coffee, Book, Dumbbell, Sparkles,
  Wind, Flame, Moon, Sunrise, Sun, AlertTriangle, Check
} from "lucide-react";
import type { Attributes } from "../types";

// ─── Props ──────────────────────────────────────────────────────────────────────
interface StatusTabProps {
  currentStatus: Record<string, number>;
  maxStatus: Record<string, number>;
  onChange: (key: string, val: number) => void;
  bonusBreakdown?: Record<string, { base: number; bonus: number; label: string }>;
  computedAttributes?: Attributes;
  conditions?: Record<string, number>;
  onConditionsChange?: (conditions: Record<string, number>) => void;
}

// ─── Condition Definitions ──────────────────────────────────────────────────────
const CONDITION_DEFS: {
  key: string;
  label: string;
  leveled: boolean;
  negative: boolean;
  desc: string;
}[] = [
  { key: "adversidade", label: "Adversidade", leveled: true, negative: true, desc: "Cada nível aumenta em 1 a dificuldade de suas ações físicas." },
  { key: "agarrado", label: "Agarrado", leveled: false, negative: true, desc: "Reduz sua velocidade a Ø." },
  { key: "atordoado", label: "Atordoado", leveled: false, negative: true, desc: "Aumenta a dificuldade de suas ações em 10." },
  { key: "derrubado", label: "Derrubado", leveled: false, negative: true, desc: "Divide sua velocidade por 2." },
  { key: "desmaiado", label: "Desmaiado", leveled: false, negative: true, desc: "Impede que você realize ações suspendendo sua consciência. Se for alvo de uma interação, a condição se encerra." },
  { key: "escondido", label: "Escondido", leveled: false, negative: false, desc: "Torna necessário um teste de Consciência para lhe perceber." },
  { key: "exaustao", label: "Exaustão", leveled: true, negative: true, desc: "Cada nível diminui em 2 todos seus atributos." },
  { key: "imperceptivel", label: "Imperceptível", leveled: false, negative: false, desc: "Torna impossível que lhe percebam." },
  { key: "inaudivel", label: "Inaudível", leveled: false, negative: false, desc: "Torna impossível que lhe percebam através da audição." },
  { key: "inodoro", label: "Inodoro", leveled: false, negative: false, desc: "Torna impossível que lhe percebam através do olfato." },
  { key: "intangivel", label: "Intangível", leveled: false, negative: false, desc: "Torna impossível que lhe contatem, fazendo com que objetos & energias lhe atravessem de forma benigna." },
  { key: "invisivel", label: "Invisível", leveled: false, negative: false, desc: "Torna impossível que lhe percebam através da visão." },
  { key: "lento", label: "Lento", leveled: false, negative: true, desc: "Divide sua iniciativa, destreza, velocidade & tempo de fala por 2." },
  { key: "paralisado", label: "Paralisado", leveled: false, negative: true, desc: "Impede que você realize ações." },
  { key: "sangrando", label: "Sangrando", leveled: false, negative: true, desc: "Sofre dano de sangramento diretamente aos pontos de vida a cada 10 segundos até que o sangramento seja estancado." },
];

// ─── Rest Configuration ─────────────────────────────────────────────────────────
type RestType = "curto" | "medio" | "longo";

const REST_CONFIG: Record<
  RestType,
  {
    label: string;
    duration: string;
    exaustao: number;
    recoveryDiv: number;
    regenDiv: number;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    colors: {
      bg: string;
      border: string;
      text: string;
      button: string;
      glow: string;
    };
  }
> = {
  curto: {
    label: "Descanso Curto",
    duration: "4 Horas Seguidas",
    exaustao: 1,
    recoveryDiv: 10,
    regenDiv: 25,
    icon: Moon,
    colors: {
      bg: "bg-emerald-900/20",
      border: "border-emerald-700/40",
      text: "text-emerald-400",
      button: "bg-emerald-600 hover:bg-emerald-500",
      glow: "shadow-emerald-500/20",
    },
  },
  medio: {
    label: "Descanso Médio",
    duration: "8 Horas Seguidas",
    exaustao: 2,
    recoveryDiv: 5,
    regenDiv: 10,
    icon: Sunrise,
    colors: {
      bg: "bg-blue-900/20",
      border: "border-blue-700/40",
      text: "text-blue-400",
      button: "bg-blue-600 hover:bg-blue-500",
      glow: "shadow-blue-500/20",
    },
  },
  longo: {
    label: "Descanso Longo",
    duration: "12 Horas Seguidas",
    exaustao: 3,
    recoveryDiv: 2,
    regenDiv: 5,
    icon: Sun,
    colors: {
      bg: "bg-violet-900/20",
      border: "border-violet-700/40",
      text: "text-violet-400",
      button: "bg-violet-600 hover:bg-violet-500",
      glow: "shadow-violet-500/20",
    },
  },
};

// ─── Recovery line item ─────────────────────────────────────────────────────────
interface RecoveryLine {
  key: string;
  label: string;
  amount: number;
  color: string;
  type: "recovery" | "regen";
}

// ═════════════════════════════════════════════════════════════════════════════════
// StatusTab Component
// ═════════════════════════════════════════════════════════════════════════════════
export function StatusTab({
  currentStatus,
  maxStatus,
  onChange,
  bonusBreakdown,
  computedAttributes,
  conditions = {},
  onConditionsChange,
}: StatusTabProps) {
  const [appliedRest, setAppliedRest] = useState<RestType | null>(null);

  // ── Attribute helper ────────────────────────────────────────────────────────
  const getAttrTotal = (name: string): number => {
    if (!computedAttributes?.[name]) return 0;
    return (computedAttributes[name].base || 0) + (computedAttributes[name].bonus || 0);
  };

  // ── Recovery calculation ──────────────────────────────────────────────────
  const getRecovery = (type: RestType): RecoveryLine[] => {
    const cfg = REST_CONFIG[type];
    const cst = getAttrTotal("Constituição");
    const con = getAttrTotal("Consciência");
    const von = getAttrTotal("Vontade");
    const intu = getAttrTotal("Intuição");
    const sor = getAttrTotal("Sorte");

    return [
      { key: "vida", label: "Vida", amount: Math.floor(cst / cfg.regenDiv), color: "text-red-400", type: "regen" },
      { key: "sanidade", label: "Sanidade", amount: Math.floor(intu / cfg.regenDiv), color: "text-purple-400", type: "regen" },
      { key: "vigor", label: "Vigor", amount: Math.floor(cst / cfg.recoveryDiv), color: "text-orange-400", type: "recovery" },
      { key: "mana", label: "Mana", amount: Math.floor(con / cfg.recoveryDiv), color: "text-blue-400", type: "recovery" },
      { key: "poder", label: "Poder", amount: Math.floor(von / cfg.recoveryDiv), color: "text-indigo-400", type: "recovery" },
      { key: "estomago", label: "Estômago", amount: Math.floor(cst / cfg.recoveryDiv), color: "text-amber-400", type: "recovery" },
      { key: "figado", label: "Fígado", amount: Math.floor(cst / cfg.recoveryDiv), color: "text-amber-400", type: "recovery" },
      { key: "estudo", label: "Estudo", amount: Math.floor(von / cfg.recoveryDiv), color: "text-cyan-400", type: "recovery" },
      { key: "pratica", label: "Prática", amount: Math.floor(von / cfg.recoveryDiv), color: "text-cyan-400", type: "recovery" },
      { key: "treino", label: "Treino", amount: Math.floor(von / cfg.recoveryDiv), color: "text-cyan-400", type: "recovery" },
      { key: "extrapolar", label: "Extrapolar", amount: Math.floor(sor / cfg.recoveryDiv), color: "text-yellow-400", type: "recovery" },
    ];
  };

  // ── Apply rest ────────────────────────────────────────────────────────────
  const applyRest = (type: RestType) => {
    const recovery = getRecovery(type);
    const cfg = REST_CONFIG[type];

    for (const { key, amount } of recovery) {
      const current = currentStatus[key] ?? maxStatus[key] ?? 0;
      const max = maxStatus[key] ?? 0;
      onChange(key, Math.min(current + amount, max));
    }

    // Remove exaustão levels
    if (onConditionsChange) {
      const currentExaustao = conditions.exaustao || 0;
      onConditionsChange({
        ...conditions,
        exaustao: Math.max(0, currentExaustao - cfg.exaustao),
      });
    }

    setAppliedRest(type);
    setTimeout(() => setAppliedRest(null), 3000);
  };

  // ── Condition handlers ────────────────────────────────────────────────────
  const toggleCondition = (key: string) => {
    if (!onConditionsChange) return;
    onConditionsChange({
      ...conditions,
      [key]: (conditions[key] || 0) > 0 ? 0 : 1,
    });
  };

  const changeConditionLevel = (key: string, delta: number) => {
    if (!onConditionsChange) return;
    onConditionsChange({
      ...conditions,
      [key]: Math.max(0, (conditions[key] || 0) + delta),
    });
  };

  // ── Status & Consumable configs ───────────────────────────────────────────
  const statusConfig = [
    { key: "vida", label: "Vida", color: "red" as const, icon: <Heart size={16} /> },
    { key: "mana", label: "Mana", color: "blue" as const, icon: <Zap size={16} /> },
    { key: "vigor", label: "Vigor", color: "orange" as const, icon: <Flame size={16} /> },
    { key: "sanidade", label: "Sanidade", color: "purple" as const, icon: <Brain size={16} /> },
    { key: "poder", label: "Poder", color: "indigo" as const, icon: <Sparkles size={16} /> },
    { key: "aura", label: "Aura", color: "yellow" as const, icon: <Shield size={16} /> },
    { key: "espirito", label: "Espírito", color: "cyan" as const, icon: <Wind size={16} /> },
    { key: "prana", label: "Prana", color: "emerald" as const, icon: <Flame size={16} /> },
    { key: "qi", label: "Qi", color: "teal" as const, icon: <Wind size={16} /> },
  ];

  const consumableConfig = [
    { key: "estomago", label: "Estômago", icon: <Coffee size={14} /> },
    { key: "figado", label: "Fígado", icon: <Coffee size={14} /> },
    { key: "estudo", label: "Estudo", icon: <Book size={14} /> },
    { key: "pratica", label: "Prática", icon: <Dumbbell size={14} /> },
    { key: "treino", label: "Treino", icon: <Dumbbell size={14} /> },
    { key: "extrapolar", label: "Extrapolar", icon: <Sparkles size={14} /> },
  ];

  const activeConditionCount = CONDITION_DEFS.filter(
    (c) => (conditions[c.key] || 0) > 0
  ).length;

  // ═════════════════════════════════════════════════════════════════════════════
  // Render
  // ═════════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-8">
      {/* ─── Status Principais ──────────────────────────────────────────── */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4">
          Status Principais
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {statusConfig.map((s) => (
            <StatusBar
              key={s.key}
              label={s.label}
              current={currentStatus[s.key] ?? maxStatus[s.key]}
              max={maxStatus[s.key]}
              color={s.color}
              icon={s.icon}
              onChange={(val) => onChange(s.key, val)}
            />
          ))}
        </div>
      </section>

      {/* ─── Consumíveis & Limites ─────────────────────────────────────── */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4">
          Consumíveis & Limites
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {consumableConfig.map((c) => {
            const current = currentStatus[c.key] ?? maxStatus[c.key];
            const max = maxStatus[c.key];
            return (
              <div
                key={c.key}
                className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col justify-between"
              >
                <div className="flex items-center gap-2 text-slate-400 mb-3 font-medium text-sm">
                  {c.icon}
                  {c.label}
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => onChange(c.key, current - 1)}
                    className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold"
                  >
                    -
                  </button>
                  <span className="font-mono text-xl text-white font-bold">
                    {current}{" "}
                    <span className="text-slate-500 text-sm">/ {max}</span>
                  </span>
                  <button
                    onClick={() => onChange(c.key, current + 1)}
                    className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Descanso & Recuperação ─────────────────────────────────────── */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <Moon size={18} className="text-indigo-400" />
          Descanso & Recuperação
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Selecione um tipo de descanso para recuperar recursos. Valores
          calculados a partir de seus atributos.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["curto", "medio", "longo"] as RestType[]).map((type) => {
            const cfg = REST_CONFIG[type];
            const Icon = cfg.icon;
            const recovery = getRecovery(type);
            const isApplied = appliedRest === type;
            const regenLines = recovery.filter(
              (r) => r.type === "regen" && r.amount > 0
            );
            const recoveryLines = recovery.filter(
              (r) => r.type === "recovery" && r.amount > 0
            );

            return (
              <div
                key={type}
                className={`relative rounded-2xl border overflow-hidden transition-all duration-500 ${
                  isApplied
                    ? "border-green-500/60 bg-green-900/10 shadow-xl shadow-green-500/10"
                    : `${cfg.colors.border} ${cfg.colors.bg} hover:shadow-lg`
                }`}
              >
                {/* Header */}
                <div className="p-4 pb-3">
                  <div className="flex items-center gap-2.5 mb-1">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isApplied
                          ? "bg-green-800/50"
                          : cfg.colors.bg
                      }`}
                    >
                      <Icon
                        size={18}
                        className={
                          isApplied ? "text-green-400" : cfg.colors.text
                        }
                      />
                    </div>
                    <div>
                      <h4
                        className={`font-bold text-sm ${
                          isApplied ? "text-green-400" : cfg.colors.text
                        }`}
                      >
                        {isApplied ? "✓ Aplicado!" : cfg.label}
                      </h4>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        {cfg.duration}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recovery breakdown */}
                <div className="px-4 pb-1">
                  {/* Regeneração (Vida / Sanidade) */}
                  {regenLines.length > 0 && (
                    <div className="mb-2">
                      <p className="text-[10px] text-slate-600 uppercase tracking-wider font-bold mb-1">
                        Regeneração
                      </p>
                      {regenLines.map((r) => (
                        <div
                          key={r.key}
                          className="flex justify-between text-xs py-0.5"
                        >
                          <span className="text-slate-400">{r.label}</span>
                          <span className={`font-mono font-bold ${r.color}`}>
                            +{r.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recuperação */}
                  {recoveryLines.length > 0 && (
                    <div className="mb-2">
                      <p className="text-[10px] text-slate-600 uppercase tracking-wider font-bold mb-1">
                        Recuperação
                      </p>
                      {recoveryLines.map((r) => (
                        <div
                          key={r.key}
                          className="flex justify-between text-xs py-0.5"
                        >
                          <span className="text-slate-400">{r.label}</span>
                          <span className={`font-mono font-bold ${r.color}`}>
                            +{r.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Exaustão */}
                  <div className="border-t border-slate-700/50 pt-2 mb-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Exaustão</span>
                      <span className="font-mono font-bold text-green-400">
                        -{cfg.exaustao} nível{cfg.exaustao > 1 ? "is" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Apply button */}
                <div className="p-4 pt-1">
                  <button
                    onClick={() => applyRest(type)}
                    disabled={isApplied}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg ${
                      isApplied
                        ? "bg-green-700/60 cursor-not-allowed"
                        : `${cfg.colors.button} ${cfg.colors.glow} hover:shadow-xl active:scale-[0.98]`
                    }`}
                  >
                    {isApplied ? (
                      <span className="flex items-center justify-center gap-2">
                        <Check size={16} /> Descansado
                      </span>
                    ) : (
                      "Descansar"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Condições ──────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-400" />
            Condições
            {activeConditionCount > 0 && (
              <span className="ml-2 text-xs bg-red-900/50 text-red-400 border border-red-700/50 px-2.5 py-0.5 rounded-full font-bold">
                {activeConditionCount} ativa
                {activeConditionCount !== 1 ? "s" : ""}
              </span>
            )}
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {CONDITION_DEFS.map((cond) => {
            const value = conditions[cond.key] || 0;
            const isActive = value > 0;

            return (
              <div
                key={cond.key}
                className={`relative rounded-xl border p-3 transition-all select-none ${
                  cond.leveled ? "" : "cursor-pointer"
                } ${
                  isActive
                    ? cond.negative
                      ? "bg-red-900/25 border-red-700/50 shadow-lg shadow-red-900/10"
                      : "bg-cyan-900/25 border-cyan-700/50 shadow-lg shadow-cyan-900/10"
                    : "bg-slate-800/50 border-slate-700/50 hover:border-slate-600"
                }`}
                onClick={
                  !cond.leveled ? () => toggleCondition(cond.key) : undefined
                }
              >
                {/* Condition header */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span
                    className={`text-xs font-bold truncate ${
                      isActive
                        ? cond.negative
                          ? "text-red-400"
                          : "text-cyan-400"
                        : "text-slate-500"
                    }`}
                  >
                    {cond.label}
                  </span>

                  {cond.leveled ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          changeConditionLevel(cond.key, -1);
                        }}
                        className="w-5 h-5 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded text-[10px] text-white font-bold"
                      >
                        −
                      </button>
                      <span
                        className={`text-xs font-mono font-bold w-5 text-center ${
                          isActive
                            ? cond.negative
                              ? "text-red-400"
                              : "text-cyan-400"
                            : "text-slate-500"
                        }`}
                      >
                        {value}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          changeConditionLevel(cond.key, 1);
                        }}
                        className="w-5 h-5 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded text-[10px] text-white font-bold"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`w-2.5 h-2.5 rounded-full shrink-0 transition-all duration-300 ${
                        isActive
                          ? cond.negative
                            ? "bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.6)]"
                            : "bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]"
                          : "bg-slate-600"
                      }`}
                    />
                  )}
                </div>

                {/* Description */}
                <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">
                  {cond.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
