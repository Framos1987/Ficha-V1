import { useState, useMemo, useRef } from "react";
import { Save, Shield, User, Edit3, Download, Upload, LayoutDashboard, Activity, List, Target, Brain, Dumbbell, Users, Package, Sword, Swords } from "lucide-react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { AttributeRow } from "./components/AttributeRow";
import { Inventory } from "./components/Inventory";
import { InventoryTab } from "./components/InventoryTab";
import { ArsenalTab } from "./components/ArsenalTab";
import { Calculator } from "./components/Calculator";
import { CharacterEditor } from "./components/CharacterEditor";
import { DerivedStats } from "./components/DerivedStats";
import { StatusTab } from "./components/StatusTab";
import { CombatSummary } from "./components/CombatSummary";
import { AptidoesTab } from "./components/AptidoesTab";
import { AuthGate } from "./components/AuthGate";
import { calculateStats } from "./lib/calculations";
import { CharacterInfo, Attributes, InventoryItem, EquippedArmor, EquippedWeapons, EquippedAccessories, AptidoesState } from "./types";

const initialAttributes: Attributes = {
  Constituição: { base: 22, bonus: 6 },
  Destreza: { base: 23, bonus: 4 },
  Força: { base: 23, bonus: 2 },
  Inteligência: { base: 20, bonus: 0 },
  Intuição: { base: 5, bonus: 5 },
  Consciência: { base: 5, bonus: 1 },
  Vontade: { base: 7, bonus: 3 },
  Carisma: { base: 20, bonus: 0 },
  Sorte: { base: 10, bonus: 0 },
};

const initialCharInfo: CharacterInfo = {
  name: "Krassus",
  level: 0,
  race: "Goblínica",
  constellation: "Touro",
  height: 120,
  weight: 30,
  physicalLevel: 0,
  physicalValue: 0,
  intellectualLevel: 0,
  intellectualValue: 0,
  socialLevel: 0,
  socialValue: 0,
};

export default function App() {
  const [charInfo, setCharInfo] = useLocalStorage<CharacterInfo>("rpg_char_info", initialCharInfo);
  const [attributes, setAttributes] = useLocalStorage<Attributes>("rpg_attributes", initialAttributes);
  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>("rpg_inventory", []);
  const [currentStatus, setCurrentStatus] = useLocalStorage<Record<string, number>>("rpg_current_status", {});
  
  const [equippedArmor, setEquippedArmor] = useLocalStorage<EquippedArmor>("rpg_equipped_armor", {
    Cabeça: { Interna: null, Central: null, Externa: null },
    Pescoço: { Interna: null, Central: null, Externa: null },
    Tronco: { Interna: null, Central: null, Externa: null },
    Ombro: { Interna: null, Central: null, Externa: null },
    Braço: { Interna: null, Central: null, Externa: null },
    Cotovelo: { Interna: null, Central: null, Externa: null },
    Antebraço: { Interna: null, Central: null, Externa: null },
    Mão: { Interna: null, Central: null, Externa: null },
    Coxa: { Interna: null, Central: null, Externa: null },
    Joelho: { Interna: null, Central: null, Externa: null },
    Perna: { Interna: null, Central: null, Externa: null },
    Pé: { Interna: null, Central: null, Externa: null },
  });

  const [equippedWeapons, setEquippedWeapons] = useLocalStorage<EquippedWeapons>("rpg_equipped_weapons", {
    mainHand: null,
    offHand: null,
  });

  const [equippedAccessories, setEquippedAccessories] = useLocalStorage<EquippedAccessories>("rpg_equipped_accessories", {
    Cabeça: null, Garganta: null, Ouvido: null, Antebraço: null, Mão: null, Pulso: null, Dedo: null, Cintura: null, Tornozelo: null
  });

  const [aptidoes, setAptidoes] = useLocalStorage<AptidoesState>("rpg_aptidoes", {});

  const [activeTab, setActiveTab] = useState<"attributes" | "derived" | "status" | "inventory" | "arsenal" | "aptidoes">("attributes");
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage<boolean>("rpg_is_auth", false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate derived stats and max status dynamically
  const { derived, maxStatus, computedAttributes, statBreakdown } = useMemo(() => calculateStats(attributes, charInfo, equippedAccessories, inventory, aptidoes as Record<string, number>), [attributes, charInfo, equippedAccessories, inventory, aptidoes]);

  const handleStatusChange = (key: string, val: number) => {
    setCurrentStatus(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    setSaveMessage("Ficha salva com sucesso!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleExport = () => {
    const data = {
      rpg_attributes: localStorage.getItem("rpg_attributes"),
      rpg_char_info: localStorage.getItem("rpg_char_info"),
      rpg_inventory: localStorage.getItem("rpg_inventory"),
      rpg_equipped_armor: localStorage.getItem("rpg_equipped_armor"),
      rpg_equipped_weapons: localStorage.getItem("rpg_equipped_weapons"),
      rpg_equipped_accessories: localStorage.getItem("rpg_equipped_accessories"),
      rpg_current_status: localStorage.getItem("rpg_current_status"),
      rpg_aptidoes: localStorage.getItem("rpg_aptidoes"),
    };
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ficha_${charInfo.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_backup.rpg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        for (const key in json) {
          if (json[key]) {
            localStorage.setItem(key, json[key]);
          }
        }
        localStorage.setItem("rpg_is_auth", "true");
        window.location.reload();
      } catch (err) {
        alert("Erro ao importar a ficha. O arquivo parece inválido.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isAuthenticated) {
    return <AuthGate onUnlock={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-[1600px] w-full mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="flex items-center gap-4 z-10">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 shadow-inner">
              <User size={32} className="text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white tracking-tight">{charInfo.name}</h1>
                <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-indigo-400 transition-colors">
                  <Edit3 size={18} />
                </button>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400 mt-1 flex-wrap">
                <span className="flex items-center gap-1"><Shield size={14} /> Nível {charInfo.level}</span>
                <span>•</span>
                <span>Raça: {charInfo.race || "N/A"}</span>
                <span>•</span>
                <span>Constelação: {charInfo.constellation || "N/A"}</span>
                <span>•</span>
                <span>{charInfo.height}cm / {charInfo.weight}kg</span>
              </div>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 shadow-sm">
                  <Dumbbell size={14} className="text-emerald-400" />
                  <span className="text-sm font-medium text-slate-300">Físico</span>
                  <span className="text-xs text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700/50">Lvl {charInfo.physicalLevel || 0}</span>
                  <span className="text-xs text-slate-500">({charInfo.physicalValue || 0})</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 shadow-sm">
                  <Brain size={14} className="text-blue-400" />
                  <span className="text-sm font-medium text-slate-300">Intelectual</span>
                  <span className="text-xs text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700/50">Lvl {charInfo.intellectualLevel || 0}</span>
                  <span className="text-xs text-slate-500">({charInfo.intellectualValue || 0})</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 shadow-sm">
                  <Users size={14} className="text-amber-400" />
                  <span className="text-sm font-medium text-slate-300">Social</span>
                  <span className="text-xs text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700/50">Lvl {charInfo.socialLevel || 0}</span>
                  <span className="text-xs text-slate-500">({charInfo.socialValue || 0})</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 z-10 flex-wrap justify-end">
            {saveMessage && <span className="text-emerald-400 text-sm font-medium animate-pulse">{saveMessage}</span>}
            
            <button 
              onClick={handleExport}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all"
              title="Fazer Backup (Exportar .rpg)"
            >
              <Download size={18} className="text-indigo-400" />
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all"
              title="Carregar Backup (Importar .rpg)"
            >
              <Upload size={18} className="text-emerald-400" />
            </button>
            <input 
              type="file" 
              accept=".rpg,.json" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImport} 
            />

            <button 
              onClick={handleSave}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-900/20"
            >
              <Save size={18} />
              <span className="hidden sm:inline">Salvar</span>
            </button>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Tabs & Content */}
          <div className={`${(activeTab === "inventory" || activeTab === "arsenal" || activeTab === "aptidoes") ? "lg:col-span-12" : "lg:col-span-8"} space-y-6`}>
            
            {/* Tabs Navigation */}
            <div className="flex gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800 overflow-x-auto hide-scrollbar">
              <button
                onClick={() => setActiveTab("attributes")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${activeTab === "attributes" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
              >
                <List size={18} /> Atributos
              </button>
              <button
                onClick={() => setActiveTab("derived")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${activeTab === "derived" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
              >
                <LayoutDashboard size={18} /> Derivados
              </button>
              <button
                onClick={() => setActiveTab("status")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${activeTab === "status" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
              >
                <Activity size={18} /> Status
              </button>
              <button
                onClick={() => setActiveTab("inventory")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${activeTab === "inventory" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
              >
                <Package size={18} /> Inventário
              </button>
              <button
                onClick={() => setActiveTab("arsenal")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${activeTab === "arsenal" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
              >
                <Sword size={18} /> Arsenal
              </button>
              <button
                onClick={() => setActiveTab("aptidoes")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${activeTab === "aptidoes" ? "bg-purple-700 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
              >
                <Swords size={18} /> Aptidões
              </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === "attributes" && (
                <div className="bg-slate-800 rounded-3xl border border-slate-700 p-6 shadow-xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      Atributos
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(computedAttributes).map(([name, data]) => (
                      <AttributeRow 
                        key={name}
                        name={name}
                        base={data.base}
                        bonus={data.bonus}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "derived" && (
                <DerivedStats stats={derived} bonusBreakdown={statBreakdown} />
              )}

              {activeTab === "status" && (
                <StatusTab 
                  currentStatus={currentStatus} 
                  maxStatus={maxStatus} 
                  onChange={handleStatusChange} 
                />
              )}

              {activeTab === "inventory" && (
                <InventoryTab 
                  items={inventory} 
                  setItems={setInventory} 
                  maxLoad={Number(derived["Carga Máxima"]) || 0} 
                />
              )}

              {activeTab === "arsenal" && (
                <ArsenalTab 
                  inventory={inventory}
                  setInventory={setInventory}
                  equippedArmor={equippedArmor}
                  setEquippedArmor={setEquippedArmor}
                  equippedWeapons={equippedWeapons}
                  setEquippedWeapons={setEquippedWeapons}
                  equippedAccessories={equippedAccessories}
                  setEquippedAccessories={setEquippedAccessories}
                  aptidoes={aptidoes as Record<string, number>}
                />
              )}
              {activeTab === "aptidoes" && (
                <AptidoesTab aptidoes={aptidoes} setAptidoes={setAptidoes} />
              )}
            </div>
          </div>

          {/* Right Column: Inventory */}
          {(activeTab !== "inventory" && activeTab !== "arsenal" && activeTab !== "aptidoes") && (
            <div className="lg:col-span-4 space-y-6 flex flex-col">
              <div className="h-[300px]">
                <Inventory 
                  items={inventory} 
                  setItems={setInventory} 
                  maxLoad={Number(derived["Carga Máxima"]) || 0} 
                />
              </div>
            </div>
          )}

        </div>

        {/* Combat Summary */}
        <CombatSummary 
          equippedWeapons={equippedWeapons}
          equippedArmor={equippedArmor}
          inventory={inventory}
          aptidoes={aptidoes as Record<string, number>}
        />
      </div>

      <Calculator />

      {isEditing && (
        <CharacterEditor 
          charInfo={charInfo}
          setCharInfo={setCharInfo}
          attributes={attributes}
          setAttributes={setAttributes}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}

