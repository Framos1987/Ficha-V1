import { useState } from "react";
import { Backpack, Plus, Trash2, Package } from "lucide-react";
import { InventoryItem } from "../types";

interface InventoryProps {
  items: InventoryItem[];
  setItems: (items: InventoryItem[]) => void;
  maxLoad: number;
}

export function Inventory({ items, setItems, maxLoad }: InventoryProps) {
  const [newItemName, setNewItemName] = useState("");
  const [newItemWeight, setNewItemWeight] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Geral");

  const categories = ["Geral", "Armas", "Armaduras", "Poções", "Gemas", "Acessórios"];

  const currentLoad = items.reduce((acc, item) => acc + (item.weight * (item.quantity || 1)), 0);
  const isOverloaded = currentLoad > maxLoad;

  const addItem = () => {
    if (!newItemName.trim() || !newItemWeight) return;
    
    const newItem: InventoryItem = {
      id: crypto.randomUUID(),
      name: newItemName,
      weight: parseFloat(newItemWeight),
      category: newItemCategory,
      quantity: 1,
    };

    setItems([...items, newItem]);
    setNewItemName("");
    setNewItemWeight("");
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden flex flex-col h-full">
      <div className="bg-slate-900/50 p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <Backpack size={20} />
          <h2>Inventário (Resumo)</h2>
        </div>
        <div className={`text-sm font-mono px-3 py-1 rounded-full ${isOverloaded ? 'bg-red-900/50 text-red-400' : 'bg-emerald-900/30 text-emerald-400'}`}>
          Carga: {currentLoad.toFixed(1)} / {maxLoad.toFixed(1)} kg
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
        {items.length === 0 ? (
          <p className="text-slate-500 text-center py-8">Mochila vazia.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 group">
                <div className="flex flex-col">
                  <span className="text-slate-200">{item.name} {item.quantity && item.quantity > 1 ? `(x${item.quantity})` : ''}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">{item.category || "Geral"}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-400 font-mono text-sm">{(item.weight * (item.quantity || 1)).toFixed(1)} kg</span>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-4 bg-slate-900/30 border-t border-slate-700 space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nome do item"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 text-sm"
          />
          <input
            type="number"
            placeholder="Peso"
            value={newItemWeight}
            onChange={(e) => setNewItemWeight(e.target.value)}
            className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 text-sm"
            step="0.1"
            min="0"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={newItemCategory}
            onChange={(e) => setNewItemCategory(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button 
            onClick={addItem}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
