import { useState } from "react";
import { Users, Swords, Plus, Trash2, Heart, Zap, User, Dice5, ChevronRight, Save } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MasterState, NPC, CharacterInfo } from "../types";

interface MasterDashboardProps {
  masterState: MasterState;
  setMasterState: (state: MasterState | ((prev: MasterState) => MasterState)) => void;
  charInfo: CharacterInfo;
}

export function MasterDashboard({ masterState, setMasterState, charInfo }: MasterDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<"npcs" | "initiative">("npcs");
  const [editingNpc, setEditingNpc] = useState<NPC | null>(null);

  const handleAddNpc = () => {
    const newNpc: NPC = {
      id: "npc-" + Date.now(),
      name: "Novo NPC",
      health: 100,
      maxHealth: 100,
      mana: 50,
      maxMana: 50,
      notes: ""
    };
    setMasterState(prev => ({ ...prev, npcs: [...prev.npcs, newNpc] }));
    setEditingNpc(newNpc);
  };

  const handleUpdateNpc = (npc: NPC) => {
    setMasterState(prev => ({
      ...prev,
      npcs: prev.npcs.map(n => n.id === npc.id ? npc : n)
    }));
  };

  const handleDeleteNpc = (id: string) => {
    setMasterState(prev => ({
      ...prev,
      npcs: prev.npcs.filter(n => n.id !== id)
    }));
    if (editingNpc?.id === id) setEditingNpc(null);
  };

  const handleRollInitiative = () => {
    setMasterState(prev => {
      const rolledNpcs = prev.npcs.map(n => ({ ...n, initiative: Math.floor(Math.random() * 20) + 1 }));
      const sortedIds = [...rolledNpcs]
        .sort((a, b) => (b.initiative || 0) - (a.initiative || 0))
        .map(n => n.id);
      
      // Add the player character to the order as well
      const playerInitiative = Math.floor(Math.random() * 20) + 1;
      const orderWithPlayer = [...rolledNpcs.map(n => ({ id: n.id, val: n.initiative || 0 })), { id: "player", val: playerInitiative }]
        .sort((a, b) => b.val - a.val)
        .map(x => x.id);

      return { ...prev, npcs: rolledNpcs, initiativeOrder: orderWithPlayer };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-slate-800 pb-4">
        <button 
          onClick={() => setActiveSubTab("npcs")}
          className={`px-4 py-2 rounded-xl transition-all font-bold flex items-center gap-2 ${activeSubTab === "npcs" ? "bg-amber-600 text-white" : "text-slate-400 hover:bg-slate-800"}`}
        >
          <Users size={18} /> Gerenciador de NPCs
        </button>
        <button 
          onClick={() => setActiveSubTab("initiative")}
          className={`px-4 py-2 rounded-xl transition-all font-bold flex items-center gap-2 ${activeSubTab === "initiative" ? "bg-amber-600 text-white" : "text-slate-400 hover:bg-slate-800"}`}
        >
          <Swords size={18} /> Controle de Iniciativa
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Panel */}
        <div className="lg:col-span-8 space-y-6">
          {activeSubTab === "npcs" ? (
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Fichas de NPCs</h3>
                <button onClick={handleAddNpc} className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all">
                  <Plus size={18} /> Novo NPC
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {masterState.npcs.map(npc => (
                  <div 
                    key={npc.id}
                    onClick={() => setEditingNpc(npc)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.02] ${editingNpc?.id === npc.id ? 'bg-amber-600/10 border-amber-500' : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-white underline decoration-amber-500/50 decoration-2 underline-offset-4">{npc.name}</h4>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteNpc(npc.id); }}
                        className="text-slate-600 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Heart size={12} /> {npc.health}/{npc.maxHealth}
                      </div>
                      <div className="flex items-center gap-2 text-cyan-400">
                        <Zap size={12} /> {npc.mana}/{npc.maxMana}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Ordem de Turnos</h3>
                <button 
                  onClick={handleRollInitiative}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-indigo-900/20"
                >
                  <Dice5 size={18} /> Rolar Todos d20
                </button>
              </div>

              <div className="space-y-3">
                {masterState.initiativeOrder.length === 0 ? (
                  <div className="text-center py-20 text-slate-600 italic">
                    Nenhum combate iniciado. Adicione NPCs e role a iniciativa.
                  </div>
                ) : (
                  masterState.initiativeOrder.map((id, idx) => {
                    const isPlayer = id === "player";
                    const npc = masterState.npcs.find(n => n.id === id);
                    if (!isPlayer && !npc) return null;

                    return (
                      <motion.div 
                        key={id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`flex items-center justify-between p-4 rounded-2xl border ${isPlayer ? 'bg-indigo-600/10 border-indigo-500/50' : 'bg-slate-950/40 border-slate-800'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-black text-amber-500 border border-slate-700">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="font-bold flex items-center gap-2">
                              {isPlayer ? charInfo.name : npc?.name}
                              {isPlayer && <User size={14} className="text-indigo-400" />}
                            </div>
                            <div className="text-xs text-slate-500">
                              {isPlayer ? "Jogador" : "NPC"} • Status: {isPlayer ? "?" : `${npc?.health} PV / ${npc?.mana} PM`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-black text-slate-600 tabular-nums">
                            {isPlayer ? "—" : npc?.initiative}
                          </div>
                          <ChevronRight className="text-slate-800" />
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Inspector */}
        <div className="lg:col-span-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-700/50 shadow-xl h-fit sticky top-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
             Propriedades do NPC
          </h3>
          
          <AnimatePresence mode="wait">
            {editingNpc ? (
              <motion.div 
                key={editingNpc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome</label>
                  <input 
                    type="text" 
                    value={editingNpc.name} 
                    onChange={e => {
                      const updated = { ...editingNpc, name: e.target.value };
                      setEditingNpc(updated);
                      handleUpdateNpc(updated);
                    }}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-emerald-500/70 uppercase mb-1">Vida Atual</label>
                    <input 
                      type="number" 
                      value={editingNpc.health} 
                      onChange={e => {
                        const updated = { ...editingNpc, health: parseInt(e.target.value) || 0 };
                        setEditingNpc(updated);
                        handleUpdateNpc(updated);
                      }}
                      className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-500/30 uppercase mb-1">Vida Máx</label>
                    <input 
                      type="number" 
                      value={editingNpc.maxHealth} 
                      onChange={e => {
                        const updated = { ...editingNpc, maxHealth: parseInt(e.target.value) || 0 };
                        setEditingNpc(updated);
                        handleUpdateNpc(updated);
                      }}
                      className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2 text-slate-400 outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-cyan-500/70 uppercase mb-1">Mana Atual</label>
                    <input 
                      type="number" 
                      value={editingNpc.mana} 
                      onChange={e => {
                        const updated = { ...editingNpc, mana: parseInt(e.target.value) || 0 };
                        setEditingNpc(updated);
                        handleUpdateNpc(updated);
                      }}
                      className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-cyan-500/30 uppercase mb-1">Mana Máx</label>
                    <input 
                      type="number" 
                      value={editingNpc.maxMana} 
                      onChange={e => {
                        const updated = { ...editingNpc, maxMana: parseInt(e.target.value) || 0 };
                        setEditingNpc(updated);
                        handleUpdateNpc(updated);
                      }}
                      className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2 text-slate-400 outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notas / Habilidades</label>
                  <textarea 
                    rows={6}
                    value={editingNpc.notes} 
                    onChange={e => {
                      const updated = { ...editingNpc, notes: e.target.value };
                      setEditingNpc(updated);
                      handleUpdateNpc(updated);
                    }}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500 transition-colors resize-none text-sm"
                  />
                </div>

                <button 
                  onClick={() => setEditingNpc(null)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-700 flex items-center justify-center gap-2"
                >
                  <Save size={18} /> Salvar e Fechar
                </button>

              </motion.div>
            ) : (
              <div className="text-center py-20 text-slate-600 flex flex-col items-center">
                <Users size={48} className="mb-4 opacity-10" />
                <p className="text-sm">Selecione um NPC para editar suas estatísticas e notas.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
