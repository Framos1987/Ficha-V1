interface DerivedStatsProps {
  stats: Record<string, number | string>;
  /** Bonus breakdown: stat name → { base, bonus, label } */
  bonusBreakdown?: Record<string, { base: number; bonus: number; label: string }>;
}

export function DerivedStats({ stats, bonusBreakdown = {} }: DerivedStatsProps) {
  return (
    <div className="bg-slate-800 rounded-3xl border border-slate-700 p-6 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        Derivados
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(stats).map(([name, value]) => {
          const breakdown = bonusBreakdown[name];
          return (
            <div key={name} className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 flex flex-col justify-between group hover:bg-slate-800 transition-colors">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">{name}</span>
              {breakdown ? (
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-emerald-400 font-mono">{breakdown.base + breakdown.bonus}</span>
                    <span className="text-xs text-slate-500 font-mono">({breakdown.base}+<span className={breakdown.label.includes("Gema") ? "text-pink-400" : "text-indigo-400"}>{breakdown.bonus}</span>)</span>
                  </div>
                  <span className={`text-[10px] italic truncate ${breakdown.label.includes("Gema") ? "text-pink-400/70 font-bold" : "text-indigo-400/70"}`}>{breakdown.label}</span>
                </div>
              ) : (
                <span className="text-2xl font-bold text-emerald-400 font-mono">{value}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
