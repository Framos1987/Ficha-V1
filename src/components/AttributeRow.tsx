interface AttributeRowProps {
  name: string;
  base: number;
  bonus: number;
}

export function AttributeRow({ name, base, bonus }: AttributeRowProps) {
  const total = base + bonus;

  return (
    <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl hover:bg-slate-800/80 transition-colors group">
      <div className="flex-1">
        <h3 className="font-semibold text-slate-200">{name}</h3>
        <div className="text-xs text-slate-500">
          Base: {base} | Bônus: {bonus > 0 ? `+${bonus}` : bonus}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-2xl font-bold text-indigo-400 w-12 text-center">
          {total}
        </div>
      </div>
    </div>
  );
}
