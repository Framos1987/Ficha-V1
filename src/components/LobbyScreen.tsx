import { motion } from "motion/react";
import { UserPlus, PlayCircle, Upload, CloudDownload, RefreshCw } from "lucide-react";
import { useRef, ChangeEvent, useState } from "react";

interface LobbyScreenProps {
  onContinue: () => void;
  onNewCharacter: () => void;
  onImport: (e: ChangeEvent<HTMLInputElement>) => void;
  onCloudLoad: (name: string) => Promise<boolean>;
  hasExistingCharacter: boolean;
  characterName?: string;
}

export function LobbyScreen({ onContinue, onNewCharacter, onImport, onCloudLoad, hasExistingCharacter, characterName }: LobbyScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cloudName, setCloudName] = useState("");
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [cloudError, setCloudError] = useState(false);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleCloudInvoke = async () => {
    if (!cloudName) return;
    setIsCloudLoading(true);
    setCloudError(false);
    const success = await onCloudLoad(cloudName);
    if (!success) setCloudError(true);
    setIsCloudLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-[#070b14] flex flex-col items-center justify-center p-4 z-40 overflow-hidden font-sans">
      {/* Mystic Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />
      
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
              <button 
                onClick={onContinue}
                className="w-full mt-4 group flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
              >
                <PlayCircle className="group-hover:scale-110 transition-transform" />
                Retomar Localmente
              </button>
            </div>
          )}

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-800"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0c121d] px-2 text-slate-500">Nuvem Arcaica</span></div>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Nome do Personagem na Nuvem..."
                value={cloudName}
                onChange={(e) => setCloudName(e.target.value)}
                className={`flex-1 bg-slate-950/50 border ${cloudError ? 'border-red-500/50' : 'border-slate-800'} rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all`}
              />
              <button 
                onClick={handleCloudInvoke}
                disabled={isCloudLoading || !cloudName}
                className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white px-4 rounded-xl transition-all active:scale-95"
              >
                {isCloudLoading ? <RefreshCw size={18} className="animate-spin" /> : <CloudDownload size={18} />}
              </button>
            </div>
            {cloudError && <p className="text-[10px] text-red-400 text-center animate-pulse">Personagem não encontrado nos registros celestiais.</p>}
          </div>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-800"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0c121d] px-2 text-slate-500">Manual</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={onNewCharacter}
              className="flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 py-3 rounded-xl transition-all text-xs font-bold"
            >
              <UserPlus size={16} className="text-emerald-400" />
              Nova Ficha
            </button>

            <button 
              onClick={handleImportClick}
              className="flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 py-3 rounded-xl transition-all text-xs font-bold"
            >
              <Upload size={16} className="text-amber-400" />
              Importar
            </button>
            <input type="file" accept=".rpg,.json" className="hidden" ref={fileInputRef} onChange={onImport} />
          </div>
          
        </div>
      </motion.div>
    </div>
  );
}
