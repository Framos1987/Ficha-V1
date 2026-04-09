import { Minus, Plus } from "lucide-react";

interface StatusBarProps {
  label: string;
  current: number;
  max: number;
  color: "red" | "blue" | "orange" | "purple" | "indigo" | "yellow" | "cyan" | "emerald" | "teal";
  icon: React.ReactNode;
  onChange: (newVal: number) => void;
}

export function StatusBar({ label, current, max, color, icon, onChange }: StatusBarProps) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  
  const colors = {
    red: { bg: "bg-red-950", fill: "bg-red-500", text: "text-red-400", border: "border-red-900" },
    blue: { bg: "bg-blue-950", fill: "bg-blue-500", text: "text-blue-400", border: "border-blue-900" },
    orange: { bg: "bg-orange-950", fill: "bg-orange-500", text: "text-orange-400", border: "border-orange-900" },
    purple: { bg: "bg-purple-950", fill: "bg-purple-500", text: "text-purple-400", border: "border-purple-900" },
    indigo: { bg: "bg-indigo-950", fill: "bg-indigo-500", text: "text-indigo-400", border: "border-indigo-900" },
    yellow: { bg: "bg-yellow-950", fill: "bg-yellow-500", text: "text-yellow-400", border: "border-yellow-900" },
    cyan: { bg: "bg-cyan-950", fill: "bg-cyan-500", text: "text-cyan-400", border: "border-cyan-900" },
    emerald: { bg: "bg-emerald-950", fill: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-900" },
    teal: { bg: "bg-teal-950", fill: "bg-teal-500", text: "text-teal-400", border: "border-teal-900" },
  };

  const theme = colors[color] || colors.red;

  return (
    <div className={`bg-slate-800 rounded-2xl border border-slate-700 p-4`}>
      <div className="flex justify-between items-center mb-3">
        <div className={`flex items-center gap-2 font-semibold ${theme.text}`}>
          {icon}
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onChange(current - 1)}
            className="p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300"
          >
            <Minus size={14} />
          </button>
          <span className="font-mono font-bold text-slate-200">
            {current} / {max}
          </span>
          <button 
            onClick={() => onChange(current + 1)}
            className="p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
      
      <div className={`h-4 w-full ${theme.bg} rounded-full overflow-hidden border ${theme.border}`}>
        <div 
          className={`h-full ${theme.fill} transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
