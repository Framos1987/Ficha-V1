import { useState } from "react";
import { Package, Plus, Trash2, Search, Filter, Minus, BookOpen, Backpack } from "lucide-react";
import { InventoryItem, NPC } from "../types";
import { ItemCatalog } from "./ItemCatalog";

interface NPCInventoryProps {
  npc: NPC;
  onUpdate: (updatedNpc: NPC) => void;
}

export function NPCInventory({ npc, onUpdate }: NPCInventoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("Todos");
  const [showCatalog, setShowCatalog] = useState(false);

  const categories = ["Todos", "Geral", "Armas", "Armaduras", "Escudos", "Munições", "Poções", "Gemas", "Acessórios"];
  const maxLoad = npc.strength * 1.5;
  const currentLoad = (npc.inventory || []).reduce((acc, item) => acc + (item.weight * (item.quantity || 1)), 0);
  const isOverloaded = currentLoad > maxLoad;

  const filteredItems = (npc.inventory || []).filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "Todos" || (item.category || "Geral") === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const addItem = (newItem: Omit<InventoryItem, "id">) => {
    const item: InventoryItem = {
      ...newItem,
      id: "item-" + Math.random().toString(36).substring(2, 9),
    };
    onUpdate({ ...npc, inventory: [...(npc.inventory || []), item] });
  };

  const removeItem = (id: string) => {
    onUpdate({ ...npc, inventory: npc.inventory.filter(i => i.id !== id) });
  };

  const updateQuantity = (id: string, delta: number) => {
    const newInv = npc.inventory.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) };
      }
      return item;
    });
    onUpdate({ ...npc, inventory: newInv });
  };

  return (
    <div className="flex flex-col h-[500px] space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className={`flex-1 text-[10px] font-bold px-3 py-2 rounded-xl border flex justify-between items-center ${isOverloaded ? 'bg-red-900/20 border-red-500/30 text-red-400' : 'bg-emerald-900/10 border-emerald-500/20 text-emerald-400'}`}>
          <span>CARGA: {currentLoad.toFixed(1)} / {maxLoad.toFixed(1)} kg</span>
          {isOverloaded && <span className="animate-pulse">SOBRECARGA!</span>}
        </div>
        <button
          onClick={() => setShowCatalog(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl transition-all"
          title="Abrir Catálogo"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-amber-500"
          />
        </div>
        <select 
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="bg-slate-950/50 border border-slate-700 rounded-xl px-2 py-2 text-[10px] text-slate-400 outline-none"
        >
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
        {filteredItems.length === 0 ? (
          <div className="text-center py-10 text-slate-600 italic text-xs">Inventário vazio.</div>
        ) : (
          filteredItems.map(item => (
            <div key={item.id} className="bg-slate-950/30 border border-slate-800 p-3 rounded-xl flex items-center justify-between group">
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-200">{item.name}</div>
                <div className="text-[9px] text-slate-600 uppercase tracking-widest">{item.weight} kg/un</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-1">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-0.5 text-slate-500 hover:text-white"><Minus size={12} /></button>
                  <span className="text-xs w-4 text-center text-slate-300">{item.quantity || 1}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-0.5 text-slate-500 hover:text-white"><Plus size={12} /></button>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-slate-700 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {showCatalog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <ItemCatalog 
              onClose={() => setShowCatalog(false)} 
              onAddItem={(item) => { addItem(item); setShowCatalog(false); }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
