import { useState } from "react";
import { Lock, Unlock, ShieldAlert, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MasterGateProps {
  onUnlock: () => void;
  onClose: () => void;
}

export function MasterGate({ onUnlock, onClose }: MasterGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const MASTER_PASSWORD = "151107";

  const handleUnlock = () => {
    if (password === MASTER_PASSWORD) {
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
      setPassword("");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 border border-slate-700/50 p-8 rounded-3xl w-full max-w-md shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="flex flex-col items-center gap-6">
          <div className={`p-5 rounded-full bg-slate-800 border-2 transition-colors ${error ? 'border-red-500 bg-red-500/10' : 'border-amber-500/30'}`}>
            {error ? <ShieldAlert className="text-red-500" size={40} /> : <Lock className="text-amber-400" size={40} />}
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Acesso Restrito ao Mestre</h2>
            <p className="text-slate-400 text-sm">Insira a chave imperial para destravar o Painel de Comando.</p>
          </div>

          <div className="w-full space-y-4">
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              placeholder="••••••"
              autoFocus
              className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl px-6 py-4 text-center text-2xl tracking-[0.5em] text-amber-400 focus:outline-none focus:border-amber-500 transition-all shadow-inner"
            />
            {error && <p className="text-red-400 text-sm text-center">Senha incorreta. Acesso negado.</p>}
          </div>

          <button 
            onClick={handleUnlock}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-amber-900/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <Unlock size={20} />
            Destravar Modo Mestre
          </button>
        </div>
      </motion.div>
    </div>
  );
}
