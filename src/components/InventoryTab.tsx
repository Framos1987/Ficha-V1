import React, { useState } from "react";
import { Backpack, Plus, Trash2, Package, Search, Filter, Minus } from "lucide-react";
import { InventoryItem } from "../types";

interface InventoryTabProps {
  items: InventoryItem[];
  setItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  maxLoad: number;
}

export function InventoryTab({ items, setItems, maxLoad }: InventoryTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("Todos");

  const categories = ["Todos", "Geral", "Armas", "Armaduras", "Escudos", "Munições", "Poções", "Gemas", "Acessórios", "Runas", "Bolsas"];

  const currentLoad = items.reduce((acc, item) => acc + (item.weight * (item.quantity || 1)), 0);
  const isOverloaded = currentLoad > maxLoad;

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "Todos" || (item.category || "Geral") === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const updateQuantity = (id: string, delta: number) => {
    setItems((prevItems) => prevItems.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, (item.quantity || 1) + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  return (
    <div className="bg-slate-800 rounded-3xl border border-slate-700 p-6 shadow-xl flex flex-col h-[600px]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="text-emerald-400" />
            Inventário Completo
          </h2>
        </div>
        <div className={`text-sm font-mono px-4 py-2 rounded-xl border ${isOverloaded ? 'bg-red-900/30 border-red-500/50 text-red-400' : 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400'}`}>
          Carga Total: <span className="font-bold">{currentLoad.toFixed(1)}</span> / {maxLoad.toFixed(1)} kg
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar item..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="relative w-full md:w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <select 
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 appearance-none"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
            <Backpack size={48} className="opacity-20" />
            <p>Nenhum item encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-3 group relative">
                
                {/* Tooltip */}
                {item.description && (
                  <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none">
                    <div className="text-xs text-slate-300 whitespace-pre-wrap">{item.description}</div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-600"></div>
                    <div className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800"></div>
                  </div>
                )}

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-slate-200">{item.name}</h3>
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                        {item.category || "Geral"}
                      </span>
                      {item.category === 'Runas' && item.runeAnchor && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                          item.runeAnchor === 'Ser'
                            ? 'border-violet-500/40 text-violet-300 bg-violet-900/20'
                            : 'border-amber-500/40 text-amber-300 bg-amber-900/20'
                        }`}>
                          ᚱ {item.runeAnchor === 'Ser' ? 'Ser' : 'Objeto'}
                        </span>
                      )}
                      {item.category === 'Runas' && item.runePotenciaName && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-slate-600 text-slate-400 bg-slate-800">
                          {item.runePotenciaName}
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1 border border-slate-700">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm font-medium text-slate-300">{item.quantity || 1}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-emerald-400">
                      {((item.weight) * (item.quantity || 1)).toFixed(1)} kg
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {item.weight.toFixed(1)} kg / un
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
