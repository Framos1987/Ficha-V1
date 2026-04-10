import { StatusBar } from "./StatusBar";
import { Heart, Zap, Brain, Shield, Coffee, Book, Dumbbell, Sparkles, Wind, Flame } from "lucide-react";

interface StatusTabProps {
  currentStatus: Record<string, number>;
  maxStatus: Record<string, number>;
  onChange: (key: string, val: number) => void;
}

export function StatusTab({ currentStatus, maxStatus, onChange }: StatusTabProps) {
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

  return (
    <div className="space-y-8">
      {/* Status Principais */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4">Status Principais</h3>
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

      {/* Consumíveis / Limites */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4">Consumíveis & Limites</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {consumableConfig.map((c) => {
            const current = currentStatus[c.key] ?? maxStatus[c.key];
            const max = maxStatus[c.key];
            return (
              <div key={c.key} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-slate-400 mb-3 font-medium text-sm">
                  {c.icon}
                  {c.label}
                </div>
                <div className="flex items-center justify-between">
                  <button onClick={() => onChange(c.key, current - 1)} className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold">-</button>
                  <span className="font-mono text-xl text-white font-bold">{current} <span className="text-slate-500 text-sm">/ {max}</span></span>
                  <button onClick={() => onChange(c.key, current + 1)} className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold">+</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
