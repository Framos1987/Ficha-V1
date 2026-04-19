import { useState, useMemo, useRef, ChangeEvent, useEffect } from "react";
import { Save, Shield, User, Edit3, Download, Upload, LayoutDashboard, Activity, List, Target, Brain, Dumbbell, Users, Package, Sword, Swords, BookOpen, Crown, Mail, ShieldCheck, Cloud, CloudOff, RefreshCw, LogOut, ShoppingCart } from "lucide-react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { AttributeRow } from "./components/AttributeRow";
import { Inventory } from "./components/Inventory";
import { InventoryTab } from "./components/InventoryTab";
import { ArsenalTab } from "./components/ArsenalTab";
import { ItemCatalog } from "./components/ItemCatalog";
import { Calculator } from "./components/Calculator";
import { CharacterEditor } from "./components/CharacterEditor";
import { DerivedStats } from "./components/DerivedStats";
import { StatusTab } from "./components/StatusTab";
import { AptidoesTab } from "./components/AptidoesTab";
import { TacticalTerminal } from "./components/TacticalTerminal";
import { AuthGate } from "./components/AuthGate";
import { LobbyScreen } from "./components/LobbyScreen";
import { JournalTab } from "./components/JournalTab";
import { MasterGate } from "./components/MasterGate";
import { MailSystem } from "./components/MailSystem";
import { MasterDashboard } from "./components/MasterDashboard";
import { calculateStats } from "./lib/calculations";
import { CharacterInfo, Attributes, InventoryItem, EquippedArmor, EquippedWeapons, EquippedAccessories, AptidoesState, JournalNote, MasterState, EquippedRunes } from "./types";
import { AnimatePresence } from "motion/react";
import { supabase } from "./lib/supabase";

// ── Migrate old accessory structure to new paired/multi-slot structure ──
(function migrateAccessorySlots() {
  try {
    const raw = localStorage.getItem("rpg_equipped_accessories");
    if (!raw) return;
    const data = JSON.parse(raw);
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
    console.log("[Migration] ✅ Accessory slots upgraded.");
  } catch (e) { console.error("[Migration] Error:", e); }
})();

// ── Migrate Journal from string to JournalNote[] ──
(function migrateJournal() {
  try {
    const raw = localStorage.getItem("rpg_journal_notes");
    if (!raw) return;
    if (raw.startsWith('[') && raw.endsWith(']')) return; 

    const legacyText = raw.replace(/^"|"$/g, ''); 
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
  const [equippedRunes, setEquippedRunes] = useLocalStorage<EquippedRunes>("rpg_equipped_runes", {
    bodyRunes: [],
    objectRunes: [],
  });
  const [conditions, setConditions] = useLocalStorage<Record<string, number>>("rpg_conditions", {});
  const [tacticalState, setTacticalState] = useLocalStorage<TacticalState>("rpg_tactical_state", {
    wounds: [],
    extrapolateChargesUsed: 0
  });

  const [activeTab, setActiveTab] = useState<"attributes" | "derived" | "status" | "inventory" | "shop" | "arsenal" | "tactical" | "aptidoes" | "journal" | "mail" | "master">("attributes");
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
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate derived stats and max status dynamically
  const { derived, maxStatus, computedAttributes, statBreakdown, gemBonuses } = useMemo(() => calculateStats(attributes, charInfo, equippedAccessories, inventory, aptidoes as Record<string, number>, equippedRunes), [attributes, charInfo, equippedAccessories, inventory, aptidoes, equippedRunes]);

  // ── Cloud Sync Logic ──
  const syncToCloud = async () => {
    if (!charInfo.name || charInfo.name === "Novo Personagem") return;
    
    setCloudStatus("syncing");
    const payload = {
      attributes,
      charInfo,
      inventory,
      equippedArmor,
      equippedWeapons,
      equippedAccessories,
      currentStatus,
      aptidoes,
      journalNotes,
      equippedRunes,
      conditions,
      lastSync: Date.now()
    };

    const { error } = await supabase
      .from('characters')
      .upsert({ 
        name: charInfo.name, 
        data: payload,
        updated_at: new Date().toISOString()
      }, { onConflict: 'name' });

    if (error) {
      console.error("Cloud Sync Error:", error);
      setCloudStatus("error");
    } else {
      setCloudStatus("success");
      setTimeout(() => setCloudStatus("idle"), 3000);
    }
  };

  const loadFromCloud = async (name: string) => {
    setCloudStatus("syncing");
    const { data, error } = await supabase
      .from('characters')
      .select('data')
      .eq('name', name)
      .single();

    if (error || !data) {
      setCloudStatus("error");
      return false;
    }

    const d = data.data;
    if (d.attributes) setAttributes(d.attributes);
    if (d.charInfo) setCharInfo(d.charInfo);
    if (d.inventory) setInventory(d.inventory);
    if (d.equippedArmor) setEquippedArmor(d.equippedArmor);
    if (d.equippedWeapons) setEquippedWeapons(d.equippedWeapons);
    if (d.equippedAccessories) setEquippedAccessories(d.equippedAccessories);
    if (d.currentStatus) setCurrentStatus(d.currentStatus);
    if (d.aptidoes) setAptidoes(d.aptidoes);
    if (d.journalNotes) setJournalNotes(d.journalNotes);
    if (d.equippedRunes) setEquippedRunes(d.equippedRunes);
    if (d.conditions) setConditions(d.conditions);
    
    setHasCharacter(true);
    setCloudStatus("success");
    setTimeout(() => setCloudStatus("idle"), 3000);
    return true;
  };

  const handleStatusChange = (key: string, val: number) => {
    setCurrentStatus(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    syncToCloud();
    setSaveMessage("Ficha salva na Nuvem!");
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
      rpg_equipped_runes: localStorage.getItem("rpg_equipped_runes"),
      rpg_conditions: localStorage.getItem("rpg_conditions"),
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
          setEquippedRunes({ bodyRunes: [], objectRunes: [] });
          setConditions({});
          setHasCharacter(true);
          setShowLobby(false); 
        }}
        onImport={handleImport}
        onCloudLoad={loadFromCloud}
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
                <div className="flex items-center gap-1">
                  {cloudStatus === "syncing" && <RefreshCw size={14} className="text-cyan-400 animate-spin" />}
                  {cloudStatus === "success" && <Cloud size={14} className="text-emerald-400" />}
                  {cloudStatus === "error" && <CloudOff size={14} className="text-red-400" />}
                </div>
                <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-indigo-400 transition-colors">
                  <Edit3 size={18} />
                </button>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400 mt-1 flex-wrap">
                <span className="flex items-center gap-1"><Shield size={14} /> Nível {(charInfo.physicalLevel || 0) + (charInfo.intellectualLevel || 0) + (charInfo.socialLevel || 0)}</span>
                <span>•</span>
                <span>Raça: {charInfo.race || "N/A"}</span>
                <span>•</span>
                <span>Constelação: {charInfo.constellation || "N/A"}</span>
              </div>
              <div className="flex flex-col gap-3 mt-4 flex-wrap w-full">
                {/* Physical Bar */}
                {(() => {
                  const physLevel = charInfo.physicalLevel || 0;
                  const physXp = charInfo.physicalValue || 0;
                  const physMax = physLevel === 0 ? 500 : physLevel * 1000;
                  const physPct = Math.min(100, (physXp / physMax) * 100);
                  return (
                    <div className="flex items-center gap-3 w-full max-w-md">
                      <Dumbbell size={16} className="text-emerald-400 shrink-0" />
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-slate-500 uppercase font-black">Nv</span>
                        <input
                          type="number"
                          value={physLevel}
                          onChange={e => setCharInfo({ ...charInfo, physicalLevel: Math.max(0, Math.min(300, parseInt(e.target.value) || 0)) })}
                          className="w-10 bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-xs text-emerald-400 font-bold text-center focus:border-emerald-500 outline-none"
                        />
                      </div>
                      <div className="flex-1 h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 shadow-inner cursor-pointer relative group" title={`Exp: ${physXp} / ${physMax}`}>
                        <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.3)] transition-all duration-1000" style={{ width: `${physPct}%` }}></div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <input
                          type="number"
                          value={physXp}
                          onChange={e => {
                            let newXp = Math.max(0, parseInt(e.target.value) || 0);
                            let newLevel = physLevel;
                            const getMax = (lv: number) => lv === 0 ? 500 : lv * 1000;
                            while (newXp >= getMax(newLevel) && newLevel < 300) {
                              newXp -= getMax(newLevel);
                              newLevel++;
                            }
                            setCharInfo({ ...charInfo, physicalValue: newXp, physicalLevel: newLevel });
                          }}
                          className="w-16 bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-[10px] text-slate-400 font-mono text-center focus:border-emerald-500 outline-none"
                        />
                        <span className="text-[10px] text-slate-600 font-mono">/ {physMax}</span>
                      </div>
                    </div>
                  );
                })()}
                {/* Intellectual Bar */}
                {(() => {
                  const intLevel = charInfo.intellectualLevel || 0;
                  const intXp = charInfo.intellectualValue || 0;
                  const intMax = intLevel === 0 ? 500 : intLevel * 1000;
                  const intPct = Math.min(100, (intXp / intMax) * 100);
                  return (
                    <div className="flex items-center gap-3 w-full max-w-md">
                      <Brain size={16} className="text-blue-400 shrink-0" />
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-slate-500 uppercase font-black">Nv</span>
                        <input
                          type="number"
                          value={intLevel}
                          onChange={e => setCharInfo({ ...charInfo, intellectualLevel: Math.max(0, Math.min(300, parseInt(e.target.value) || 0)) })}
                          className="w-10 bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-xs text-blue-400 font-bold text-center focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div className="flex-1 h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 shadow-inner cursor-pointer relative group" title={`Exp: ${intXp} / ${intMax}`}>
                        <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.3)] transition-all duration-1000" style={{ width: `${intPct}%` }}></div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <input
                          type="number"
                          value={intXp}
                          onChange={e => {
                            let newXp = Math.max(0, parseInt(e.target.value) || 0);
                            let newLevel = intLevel;
                            const getMax = (lv: number) => lv === 0 ? 500 : lv * 1000;
                            while (newXp >= getMax(newLevel) && newLevel < 300) {
                              newXp -= getMax(newLevel);
                              newLevel++;
                            }
                            setCharInfo({ ...charInfo, intellectualValue: newXp, intellectualLevel: newLevel });
                          }}
                          className="w-16 bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-[10px] text-slate-400 font-mono text-center focus:border-blue-500 outline-none"
                        />
                        <span className="text-[10px] text-slate-600 font-mono">/ {intMax}</span>
                      </div>
                    </div>
                  );
                })()}
                {/* Social Bar */}
                {(() => {
                  const socLevel = charInfo.socialLevel || 0;
                  const socXp = charInfo.socialValue || 0;
                  const socMax = socLevel === 0 ? 500 : socLevel * 1000;
                  const socPct = Math.min(100, (socXp / socMax) * 100);
                  return (
                    <div className="flex items-center gap-3 w-full max-w-md">
                      <Users size={16} className="text-amber-400 shrink-0" />
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-slate-500 uppercase font-black">Nv</span>
                        <input
                          type="number"
                          value={socLevel}
                          onChange={e => setCharInfo({ ...charInfo, socialLevel: Math.max(0, Math.min(300, parseInt(e.target.value) || 0)) })}
                          className="w-10 bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-xs text-amber-400 font-bold text-center focus:border-amber-500 outline-none"
                        />
                      </div>
                      <div className="flex-1 h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 shadow-inner cursor-pointer relative group" title={`Exp: ${socXp} / ${socMax}`}>
                        <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.3)] transition-all duration-1000" style={{ width: `${socPct}%` }}></div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <input
                          type="number"
                          value={socXp}
                          onChange={e => {
                            let newXp = Math.max(0, parseInt(e.target.value) || 0);
                            let newLevel = socLevel;
                            const getMax = (lv: number) => lv === 0 ? 500 : lv * 1000;
                            while (newXp >= getMax(newLevel) && newLevel < 300) {
                              newXp -= getMax(newLevel);
                              newLevel++;
                            }
                            setCharInfo({ ...charInfo, socialValue: newXp, socialLevel: newLevel });
                          }}
                          className="w-16 bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-[10px] text-slate-400 font-mono text-center focus:border-amber-500 outline-none"
                        />
                        <span className="text-[10px] text-slate-600 font-mono">/ {socMax}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 z-10 flex-wrap justify-end">
            <button 
              onClick={() => setShowMasterGate(true)}
              className="group flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-amber-900/20 border border-slate-700/50 hover:border-amber-500/50 text-amber-500/70 hover:text-amber-400 px-4 py-2.5 rounded-xl font-medium transition-all"
              title="Modo Mestre"
            >
              <Crown size={18} className="group-hover:rotate-12 transition-transform" />
            </button>

            <button 
              onClick={handleExport}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all"
              title="Backup (.rpg)"
            >
              <Download size={18} className="text-indigo-400" />
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all"
              title="Importar (.rpg)"
            >
              <Upload size={18} className="text-emerald-400" />
            </button>
            <input type="file" accept=".rpg,.json" className="hidden" ref={fileInputRef} onChange={handleImport} />

            <button 
              onClick={handleSave}
              disabled={cloudStatus === "syncing"}
              className={`flex items-center gap-2 ${cloudStatus === "syncing" ? 'bg-slate-700' : 'bg-indigo-600 hover:bg-indigo-500'} text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-900/20`}
            >
              {cloudStatus === "syncing" ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
              <span className="hidden sm:inline">{saveMessage || (cloudStatus === "syncing" ? "Salvando..." : "Salvar")}</span>
            </button>

            <div className="w-[1px] h-8 bg-slate-800 mx-1 hidden sm:block" />

            <button 
              onClick={() => {
                setHasCharacter(false);
                setIsAuthenticated(false);
                setIsMasterMode(false);
              }}
              className="group flex items-center justify-center gap-2 bg-red-900/10 hover:bg-red-900/20 border border-red-500/20 hover:border-red-500/50 text-red-500/70 hover:text-red-400 px-4 py-2.5 rounded-xl font-medium transition-all"
              title="Sair do Personagem"
            >
              <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
              <span className="hidden lg:inline text-xs font-black uppercase tracking-widest">Sair</span>
            </button>
          </div>
        </header>

        {/* Main Tabs */}
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-6">
            
            <div className="flex gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent scroll-smooth pb-3">
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
                onClick={() => setActiveTab("shop")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${activeTab === "shop" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
              >
                <ShoppingCart size={18} /> Compras
              </button>
              <button
                onClick={() => setActiveTab("arsenal")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${activeTab === "arsenal" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
              >
                <Sword size={18} /> Arsenal
              </button>
              <button
                onClick={() => setActiveTab("tactical")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap border ${activeTab === "tactical" ? "bg-red-900 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]" : "border-red-900/30 text-red-400 hover:bg-red-950/40 hover:text-red-300"}`}
              >
                <Target size={18} className={activeTab === "tactical" ? "animate-pulse" : ""} /> Terminal Tático
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
                  <Crown size={18} /> Dashboard
                </button>
              )}
            </div>

            <div className="min-h-[400px]">
              {activeTab === "attributes" && (
                <div className="bg-slate-800 rounded-3xl border border-slate-700 p-6 shadow-xl">
                  <h2 className="text-xl font-bold text-white mb-6">Atributos</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Corporais (Physical) */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-emerald-800/40">
                        <Dumbbell size={16} className="text-emerald-400" />
                        <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest">Corporais</h3>
                      </div>
                      {["Constituição", "Destreza", "Força"].map(name => {
                        const data = computedAttributes[name];
                        if (!data) return null;
                        return (
                          <AttributeRow
                            key={name}
                            name={name}
                            base={data.base}
                            bonus={data.bonus}
                            gemBonus={gemBonuses.attributes[name] || 0}
                          />
                        );
                      })}
                    </div>
                    {/* Intelectuais */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-blue-800/40">
                        <Brain size={16} className="text-blue-400" />
                        <h3 className="text-sm font-black text-blue-400 uppercase tracking-widest">Intelectuais</h3>
                      </div>
                      {["Inteligência", "Intuição", "Consciência"].map(name => {
                        const data = computedAttributes[name];
                        if (!data) return null;
                        return (
                          <AttributeRow
                            key={name}
                            name={name}
                            base={data.base}
                            bonus={data.bonus}
                            gemBonus={gemBonuses.attributes[name] || 0}
                          />
                        );
                      })}
                    </div>
                    {/* Sociais */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-amber-800/40">
                        <Users size={16} className="text-amber-400" />
                        <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest">Sociais</h3>
                      </div>
                      {["Carisma", "Vontade", "Sorte"].map(name => {
                        const data = computedAttributes[name];
                        if (!data) return null;
                        return (
                          <AttributeRow
                            key={name}
                            name={name}
                            base={data.base}
                            bonus={data.bonus}
                            gemBonus={gemBonuses.attributes[name] || 0}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "derived" && <DerivedStats stats={derived} bonusBreakdown={statBreakdown} />}

              {activeTab === "status" && (
                <StatusTab 
                  currentStatus={currentStatus} 
                  maxStatus={maxStatus} 
                  onChange={handleStatusChange}
                  bonusBreakdown={statBreakdown}
                  computedAttributes={computedAttributes}
                  conditions={conditions}
                  onConditionsChange={setConditions}
                />
              )}

              {activeTab === "inventory" && <InventoryTab items={inventory} setItems={setInventory} maxLoad={Number(derived["Carga Máxima"]) || 0} />}

              {activeTab === "shop" && (
                <ItemCatalog
                  inline
                  onClose={() => setActiveTab("inventory")}
                  onAddItem={(newItem) => {
                    const item = {
                      ...newItem,
                      id: Math.random().toString(36).substring(2, 9) + Math.random().toString(36).substring(2, 5),
                    };
                    setInventory((prev) => [...prev, item]);
                  }}
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
                  equippedRunes={equippedRunes}
                  setEquippedRunes={setEquippedRunes}
                />
              )}

              {activeTab === "tactical" && (
                <TacticalTerminal
                  currentStatus={currentStatus}
                  maxStatus={maxStatus}
                  derived={derived}
                  computedAttributes={computedAttributes}
                  equippedWeapons={equippedWeapons}
                  inventory={inventory}
                  tacticalState={tacticalState}
                  onTacticalStateChange={setTacticalState}
                  onStatusChange={handleStatusChange}
                  charInfo={charInfo}
                />
              )}

              {activeTab === "aptidoes" && <AptidoesTab aptidoes={aptidoes} setAptidoes={setAptidoes} />}
              {activeTab === "journal" && <JournalTab notes={journalNotes} onChange={setJournalNotes} />}
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
                  onExit={() => setIsMasterMode(false)}
                />
              )}
            </div>
          </div>
        </div>

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
