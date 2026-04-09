import { useState, FormEvent } from "react";
import { Lock, Fingerprint } from "lucide-react";
import { motion } from "motion/react";

interface AuthGateProps {
  onUnlock: () => void;
}

export function AuthGate({ onUnlock }: AuthGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (password === "krassus@123") {
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-4 z-50 selection:bg-indigo-500/30">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-slate-800 border border-slate-700 shadow-inner rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden group">
            <Lock className="text-indigo-400 z-10" size={32} />
            <div className="absolute inset-0 bg-indigo-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Acesso Restrito</h1>
          <p className="text-sm text-slate-400 mt-2 text-center">
            Insira o código de acesso da mesa para carregar o banco de dados.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className={`relative flex items-center bg-slate-950 border rounded-xl overflow-hidden transition-colors ${error ? 'border-red-500/50' : 'border-slate-800 focus-within:border-indigo-500/50'}`}>
              <div className="pl-4 pr-2 text-slate-500">
                <Fingerprint size={18} className={error ? "text-red-400" : ""} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha mestra..."
                className="w-full bg-transparent p-3 text-slate-200 focus:outline-none font-mono"
              />
            </div>
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="text-xs text-red-400 mt-2 text-center"
              >
                Código de acesso inválido.
              </motion.p>
            )}
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
          >
            Acessar Ficha
          </button>
        </form>
      </motion.div>
    </div>
  );
}
