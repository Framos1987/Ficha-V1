import { BookOpen } from "lucide-react";

interface JournalTabProps {
  notes: string;
  onChange: (notes: string) => void;
}

export function JournalTab({ notes, onChange }: JournalTabProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-amber-900/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
          <BookOpen className="text-amber-400" size={24} />
        </div>
        <h2 className="text-xl font-bold text-slate-100">Grimório & Diário de Campanha</h2>
      </div>

      <div className="relative z-10">
        <textarea
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Registre aqui as crônicas da sua jornada, lendas antigas, profecias, nomes de contatos e maldições incuráveis..."
          className="w-full h-[500px] bg-slate-950/50 border border-slate-800 rounded-2xl p-6 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all resize-none leading-relaxed font-serif"
          spellCheck="false"
        />
      </div>
    </div>
  );
}
