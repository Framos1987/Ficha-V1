import { useState, useMemo, useRef, ChangeEvent } from "react";
import { Save, Shield, User, Edit3, Download, Upload, LayoutDashboard, Activity, List, Target, Brain, Dumbbell, Users, Package, Sword, Swords, BookOpen, Crown, Mail, ShieldCheck } from "lucide-react";
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
import { LobbyScreen } from "./components/LobbyScreen";
import { JournalTab } from "./components/JournalTab";
import { MasterGate } from "./components/MasterGate";
import { MailSystem } from "./components/MailSystem";
import { MasterDashboard } from "./components/MasterDashboard";
import { calculateStats } from "./lib/calculations";
import { CharacterInfo, Attributes, InventoryItem, EquippedArmor, EquippedWeapons, EquippedAccessories, AptidoesState, JournalNote, MasterState } from "./types";

// ── Migrate old accessory structure to new paired/multi-slot structure ──
(function migrateAccessorySlots() {
  try {
    const raw = localStorage.getItem("rpg_equipped_accessories");
    if (!raw) return;
    const data = JSON.parse(raw);
    // Detect old format: has single keys instead of paired E/D or numbered
    const needsMigration = ('Dedo' in data) || ('Ouvido' in data) || ('Pulso' in data) || ('Tornozelo' in data) || ('Antebraço' in data) || ('Mão' in data);
    if (!needsMigration) return;

    const migrated: Record<string, any> = {
      'Cabeça': data['Cabeça'] ?? null,
      'Garganta': data['Garganta'] ?? null,
      'Ouvido E': data['Ouvido'] ?? data['Ouvido E'] ?? null,
      'Ouvido D': data['Ouvido D'] ?? null,
      'Antebraço E': data['Antebraço'] ?? data['Antebraço E'] ?? null,
      'Antebraço D': data['Antebraço D'] ?? null,
      'Mão E': data['Mão'] ?? data['Mão E'] ?? null,
      'Mão D': data['Mão D'] ?? null,
      'Pulso E': data['Pulso'] ?? data['Pulso E'] ?? null,
      'Pulso D': data['Pulso D'] ?? null,
      'Dedo 1': data['Dedo'] ?? data['Dedo 1'] ?? null,
      'Dedo 2': data['Dedo 2'] ?? null, 'Dedo 3': data['Dedo 3'] ?? null, 'Dedo 4': data['Dedo 4'] ?? null, 'Dedo 5': data['Dedo 5'] ?? null,
      'Dedo 6': data['Dedo 6'] ?? null, 'Dedo 7': data['Dedo 7'] ?? null, 'Dedo 8': data['Dedo 8'] ?? null, 'Dedo 9': data['Dedo 9'] ?? null, 'Dedo 10': data['Dedo 10'] ?? null,
      'Cintura': data['Cintura'] ?? null,
      'Tornozelo E': data['Tornozelo'] ?? data['Tornozelo E'] ?? null,
      'Tornozelo D': data['Tornozelo D'] ?? null,
    };

    localStorage.setItem("rpg_equipped_accessories", JSON.stringify(migrated));
    console.log("[Migration] ✅ Accessory slots upgraded. Old keys found:", Object.keys(data).filter(k => ['Dedo', 'Ouvido', 'Pulso', 'Tornozelo', 'Antebraço', 'Mão'].includes(k)));
  } catch (e) { console.error("[Migration] Error:", e); }
})();

// ── Migrate Journal from string to JournalNote[] ──
(function migrateJournal() {
  try {
    const raw = localStorage.getItem("rpg_journal_notes");
    if (!raw) return;
    if (raw.startsWith('[') && raw.endsWith(']')) return; // Already array

    // It's a plain string, convert to first note
    const legacyText = raw.replace(/^"|"$/g, ''); // Simple strip quotes if stored as JSON string
    const migrated: JournalNote[] = [{
      id: 'legacy-' + Date.now(),
      title: 'Nota Migrada',
      content: legacyText,
      createdAt: Date.now()
    }];
    localStorage.setItem("rpg_journal_notes", JSON.stringify(migrated));
    console.log("[Migration] ✅ Journal converted to multi-note format.");
  } catch (e) { console.error("[Migration Journal] Error:", e); }
})();

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
  name: "Novo Personagem",
  level: 0,
  race: "",
  constellation: "",
  height: 0,
  weight: 0,
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
    Cabeça: null, Garganta: null, 'Ouvido E': null, 'Ouvido D': null,
    'Antebraço E': null, 'Antebraço D': null, 'Mão E': null, 'Mão D': null,
    'Pulso E': null, 'Pulso D': null,
    'Dedo 1': null, 'Dedo 2': null, 'Dedo 3': null, 'Dedo 4': null, 'Dedo 5': null,
    'Dedo 6': null, 'Dedo 7': null, 'Dedo 8': null, 'Dedo 9': null, 'Dedo 10': null,
    Cintura: null, 'Tornozelo E': null, 'Tornozelo D': null
  });

  const [aptidoes, setAptidoes] = useLocalStorage<AptidoesState>("rpg_aptidoes", {});
  const [journalNotes, setJournalNotes] = useLocalStorage<JournalNote[]>("rpg_journal_notes", []);
  const [hasCharacter, setHasCharacter] = useLocalStorage<boolean>("rpg_has_character", false);

  const [activeTab, setActiveTab] = useState<"attributes" | "derived" | "status" | "inventory" | "arsenal" | "aptidoes" | "journal" | "mail" | "master">("attributes");
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage<boolean>("rpg_is_auth", false);
  const [isMasterMode, setIsMasterMode] = useLocalStorage<boolean>("rpg_is_master", false);
  const [showMasterGate, setShowMasterGate] = useState(false);
  const [masterState, setMasterState] = useLocalStorage<MasterState>("rpg_master_data", {
    messages: [],
    npcs: [],
    initiativeOrder: []
  });
  const [showLobby, setShowLobby] = useState(true);
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
      rpg_journal_notes: localStorage.getItem("rpg_journal_notes"),
      rpg_has_character: "true",
    };
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ficha_${charInfo.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_backup.rpg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
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

  if (showLobby) {
    return (
      <LobbyScreen 
        hasExistingCharacter={hasCharacter}
        characterName={charInfo.name === "Novo Personagem" ? "" : charInfo.name}
        onContinue={() => setShowLobby(false)}
        onNewCharacter={() => {
          // Controlled reset of character data instead of localStorage.clear()
          setAttributes(initialAttributes);
          setCharInfo(initialCharInfo);
          setInventory([]);
          setEquippedArmor({
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
          setEquippedWeapons({ mainHand: null, offHand: null });
          setEquippedAccessories({
            Cabeça: null, Garganta: null, 'Ouvido E': null, 'Ouvido D': null,
            'Antebraço E': null, 'Antebraço D': null, 'Mão E': null, 'Mão D': null,
            'Pulso E': null, 'Pulso D': null,
            'Dedo 1': null, 'Dedo 2': null, 'Dedo 3': null, 'Dedo 4': null, 'Dedo 5': null,
            'Dedo 6': null, 'Dedo 7': null, 'Dedo 8': null, 'Dedo 9': null, 'Dedo 10': null,
            Cintura: null, 'Tornozelo E': null, 'Tornozelo D': null
          });
          setCurrentStatus({ vida: 0, sanidade: 0, vigor: 0, mana: 0, poder: 0, estomago: 0, figado: 0, estudo: 0, pratica: 0, treino: 0, extrapolar: 0 });
          setAptidoes({});
          setJournalNotes([]);
          setHasCharacter(true);
          setShowLobby(false); // Go straight to the character sheet
        }}
        onImport={handleImport}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 p-4 md:p-8 font-sans selection:bg-indigo-500/30 relative overflow-hidden">
      {/* Mystic Ambient Background */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 mix-blend-screen opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/30 rounded-full blur-[150px]" />
        <div className="absolute top-[60%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-[1600px] w-full mx-auto space-y-6 relative z-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="flex items-center gap-4 z-10 w-full md:w-auto">
            <div 
              className="w-16 h-16 min-w-[64px] bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)] overflow-hidden cursor-pointer hover:border-indigo-500/50 transition-colors"
              onClick={() => setIsEditing(true)}
            >
              {charInfo.imageUrl ? (
                <img src={charInfo.imageUrl} alt={charInfo.name} className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
              )}
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
              <div className="flex flex-col gap-3 mt-4 flex-wrap w-full">
                
                {/* Physical Bar */}
                <div className="flex items-center gap-3 w-full max-w-sm">
                  <Dumbbell size={16} className="text-emerald-400" />
                  <div className="w-8 text-xs font-bold text-slate-400 text-right">Nv {charInfo.physicalLevel || 0}</div>
                  <div className="flex-1 h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.3)] transition-all duration-1000" style={{ width: `${Math.min(100, ((charInfo.physicalValue || 0) / 100) * 100)}%` }}></div>
                  </div>
                </div>

                {/* Intellectual Bar */}
                <div className="flex items-center gap-3 w-full max-w-sm">
                  <Brain size={16} className="text-blue-400" />
                  <div className="w-8 text-xs font-bold text-slate-400 text-right">Nv {charInfo.intellectualLevel || 0}</div>
                  <div className="flex-1 h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.3)] transition-all duration-1000" style={{ width: `${Math.min(100, ((charInfo.intellectualValue || 0) / 100) * 100)}%` }}></div>
                  </div>
                </div>

                {/* Social Bar */}
                <div className="flex items-center gap-3 w-full max-w-sm">
                  <Users size={16} className="text-amber-400" />
                  <div className="w-8 text-xs font-bold text-slate-400 text-right">Nv {charInfo.socialLevel || 0}</div>
                  <div className="flex-1 h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.3)] transition-all duration-1000" style={{ width: `${Math.min(100, ((charInfo.socialValue || 0) / 100) * 100)}%` }}></div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 z-10 flex-wrap justify-end">
            <button 
              onClick={() => isMasterMode ? setActiveTab("master") : setShowMasterGate(true)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all border ${
                isMasterMode 
                ? "bg-amber-600/20 border-amber-500/50 text-amber-400 hover:bg-amber-600/30" 
                : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              <Crown size={18} className={isMasterMode ? "text-amber-400" : ""} />
              <span className="hidden sm:inline">{isMasterMode ? "Modo Mestre Ativo" : "Modo Mestre"}</span>
              {isMasterMode && <ShieldCheck size={14} />}
            </button>

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
          <div className={`${(activeTab === "inventory" || activeTab === "arsenal" || activeTab === "aptidoes" || activeTab === "journal") ? "lg:col-span-12" : "lg:col-span-8"} space-y-6`}>
            
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
              <button
                onClick={() => setActiveTab("journal")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${activeTab === "journal" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-amber-200 hover:bg-slate-800"}`}
              >
                <BookOpen size={18} /> Grimório
              </button>
              <button
                onClick={() => setActiveTab("mail")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${activeTab === "mail" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-cyan-200 hover:bg-slate-800"}`}
              >
                <Mail size={18} /> Correio
              </button>
              {isMasterMode && (
                <button
                  onClick={() => setActiveTab("master")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors whitespace-nowrap ${activeTab === "master" ? "bg-amber-600 text-white shadow-[0_0_15px_rgba(251,191,36,0.4)]" : "text-amber-500/70 hover:text-amber-400 hover:bg-amber-900/20"}`}
                >
                  <Crown size={18} /> Master Dashboard
                </button>
              )}
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
                    {Object.entries(computedAttributes as Record<string, { base: number; bonus: number }>).map(([name, data]) => (
                      <AttributeRow 
                        key={name}
                        name={name}
                        base={data.base}
                        bonus={data.bonus}
                        gemBonus={gemBonuses.attributes[name] || 0}
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
                  bonusBreakdown={statBreakdown}
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
              {activeTab === "journal" && (
                <JournalTab notes={journalNotes} onChange={setJournalNotes} />
              )}
              {activeTab === "mail" && (
                <MailSystem 
                  messages={masterState.messages} 
                  setMasterState={setMasterState}
                  charName={charInfo.name}
                  isMaster={isMasterMode}
                />
              )}
              {isMasterMode && activeTab === "master" && (
                <MasterDashboard 
                  masterState={masterState}
                  setMasterState={setMasterState}
                  charInfo={charInfo}
                />
              )}
            </div>
          </div>

          {/* Right Column: Inventory */}
          {(activeTab !== "inventory" && activeTab !== "arsenal" && activeTab !== "aptidoes" && activeTab !== "journal") && (
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

      <AnimatePresence>
        {showMasterGate && (
          <MasterGate 
            onUnlock={() => {
              setIsMasterMode(true);
              setShowMasterGate(false);
              setActiveTab("master");
            }} 
            onClose={() => setShowMasterGate(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
