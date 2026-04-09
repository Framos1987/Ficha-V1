import { motion } from "motion/react";
import { UserPlus, PlayCircle, Upload } from "lucide-react";
import { useRef, ChangeEvent } from "react";

interface LobbyScreenProps {
  onContinue: () => void;
  onNewCharacter: () => void;
  onImport: (e: ChangeEvent<HTMLInputElement>) => void;
  hasExistingCharacter: boolean;
  characterName?: string;
}

export function LobbyScreen({ onContinue, onNewCharacter, onImport, hasExistingCharacter, characterName }: LobbyScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-[#070b14] flex flex-col items-center justify-center p-4 z-40 overflow-hidden font-sans">
      {/* Mystic Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Floating particles simulation via pseudo-elements would go in css, but glowing orbs suffice here */}
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md flex flex-col items-center"
      >
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 via-purple-300 to-indigo-500 tracking-tight drop-shadow-sm mb-3">
            Ambição Imensurável
          </h1>
          <p className="text-slate-400 text-sm tracking-widest uppercase font-medium">
            Terminal de Personagens
          </p>
        </div>

        <div className="w-full space-y-4 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-6 rounded-3xl shadow-2xl">
          
          {hasExistingCharacter && (
            <div className="mb-6 flex flex-col items-center">
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Aventura Atual</div>
              <div className="text-xl font-bold text-indigo-300">{characterName || "Aventureiro Desconhecido"}</div>
            </div>
          )}

          {hasExistingCharacter && (
            <button 
              onClick={onContinue}
              className="w-full group flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
            >
              <PlayCircle className="group-hover:scale-110 transition-transform" />
              Retomar Aventura
            </button>
          )}

          {!hasExistingCharacter && (
            <div className="py-4 text-center text-slate-400 text-sm">
              Nenhuma marca mística detectada neste dispositivo.
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 pt-2">
            <button 
              onClick={onNewCharacter}
              className="w-full flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 py-3 rounded-2xl transition-all active:scale-[0.98]"
            >
              <UserPlus size={18} className="text-emerald-400" />
              Forjar Nova Ficha
            </button>

            <button 
              onClick={handleImportClick}
              className="w-full flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 py-3 rounded-2xl transition-all active:scale-[0.98]"
            >
              <Upload size={18} className="text-amber-400" />
              Invocar do Backup (.rpg)
            </button>
            <input 
              type="file" 
              accept=".rpg,.json" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={onImport} 
            />
          </div>
          
        </div>
      </motion.div>
    </div>
  );
}
