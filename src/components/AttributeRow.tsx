import React from "react";

export interface AttributeRowProps {
  name: string;
  base: number;
  bonus: number;
  gemBonus?: number;
}

export const AttributeRow: React.FC<AttributeRowProps> = ({ name, base, bonus, gemBonus = 0 }) => {
  const total = base + bonus;

  return (
    <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl hover:bg-slate-800/80 transition-colors group">
      <div className="flex-1">
        <h3 className="font-semibold text-slate-200">{name}</h3>
        <div className="text-xs text-slate-500">
          Base: {base} | Bônus: {bonus > 0 ? `+${bonus}` : bonus}
          {gemBonus > 0 && <span className="text-pink-400 font-bold ml-1">(+{gemBonus} Gemas)</span>}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className={`text-2xl font-bold w-12 text-center transition-colors ${gemBonus > 0 ? "text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.5)]" : "text-indigo-400"}`}>
          {total}
        </div>
      </div>
    </div>
  );
}
