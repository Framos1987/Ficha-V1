import { CharacterInfo, Attributes, AttributeData } from "../types";

interface CharacterEditorProps {
  charInfo: CharacterInfo;
  setCharInfo: (info: CharacterInfo) => void;
  attributes: Attributes;
  setAttributes: (attrs: Attributes) => void;
  onClose: () => void;
}

const RACES = ["Goblínica", "Animálica", "Humana", "Terrana"];
const GENDERS = ["XY", "XX", "∅∅"];
const CONSTELLATIONS = [
  "Rato (Inteligência +2)", "Touro (Constituição +2)", "Tigre (Força +2)", 
  "Coelho (Carisma +2)", "Dragão (Sorte +2)", "Serpente (Destreza +2)", 
  "Cavalo (Vigor +10)", "Carneiro (Poder +10)", "Macaco (Consciência +2)", 
  "Galo (Mana +10)", "Cão (Intuição +2)", "Porco (Vontade +2)"
];

const ATTRIBUTE_COLUMNS: { key: keyof AttributeData; label: string }[] = [
  { key: "base", label: "Inerente" },
  { key: "adquirido", label: "Adquirido" },
  { key: "raca", label: "Raça" },
  { key: "passiva", label: "Passiva" },
  { key: "genero", label: "Gênero" },
  { key: "constelacao", label: "Signo" },
  { key: "titulo", label: "Título" },
  { key: "equipamento", label: "Equip" },
  { key: "runa", label: "Runa" },
  { key: "gema", label: "Gema" },
  { key: "temp", label: "Temp" },
  { key: "bonus", label: "Bônus" },
  { key: "onus", label: "Ônus" },
];

export function CharacterEditor({ charInfo, setCharInfo, attributes, setAttributes, onClose }: CharacterEditorProps) {
  
  const handleCharChange = (field: keyof CharacterInfo, value: any) => {
    setCharInfo({ ...charInfo, [field]: value });
  };

  const handleAttrChange = (attr: string, field: keyof AttributeData, value: number) => {
    setAttributes({
      ...attributes,
      [attr]: { ...attributes[attr], [field]: value }
    });
  };

  const attrList = Object.keys(attributes);

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/50 rounded-[2.5rem] w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border-t-indigo-500/30">
        
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight italic uppercase">Forja de Destino</h2>
            <p className="text-slate-500 text-xs tracking-[0.2em] font-bold">CONFIGURAÇÃO AVANÇADA DE ATRIBUTOS</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-2xl transition-all">&times;</button>
        </div>

        <div className="p-8 overflow-y-auto space-y-10 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          
          {/* Informações Básicas */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-3">
              <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-8 h-[2px] bg-indigo-500"></span> Identidade & Linhagem
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2">Nome do Herói</label>
                <input type="text" value={charInfo.name} onChange={e => handleCharChange("name", e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500/50 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2">Gênero</label>
                  <select value={charInfo.gender || "XY"} onChange={e => handleCharChange("gender", e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-3 text-white appearance-none focus:border-indigo-500/50 outline-none">
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2">Nível</label>
                  <input type="number" value={charInfo.level} onChange={e => handleCharChange("level", parseInt(e.target.value) || 0)} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500/50 outline-none" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2">Raça / Espécie</label>
                <select value={charInfo.race} onChange={e => handleCharChange("race", e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500/50 outline-none">
                  {RACES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2">Constelação / Signo</label>
                <select value={charInfo.constellation} onChange={e => handleCharChange("constellation", e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500/50 outline-none">
                  {CONSTELLATIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {charInfo.race === "Humana" && (
                <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
                  <label className="block text-[10px] text-indigo-400 uppercase tracking-widest font-black mb-3 italic">Bônus da Adaptação Humana (+2 em 3)</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[0, 1, 2].map(idx => (
                      <select 
                        key={idx}
                        value={charInfo.humanBonuses?.[idx] || ""}
                        onChange={e => {
                          const newBonuses = [...(charInfo.humanBonuses || ["", "", ""])];
                          newBonuses[idx] = e.target.value;
                          handleCharChange("humanBonuses", newBonuses);
                        }}
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white"
                      >
                        <option value="">Selecione...</option>
                        {attrList.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    ))}
                  </div>
                </div>
              )}
              {!charInfo.race || charInfo.race !== "Humana" && (
                <div className="grid grid-cols-2 gap-4 mt-auto">
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2">Altura (cm)</label>
                      <input type="number" value={charInfo.height} onChange={e => handleCharChange("height", parseInt(e.target.value) || 0)} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2">Peso (kg)</label>
                      <input type="number" value={charInfo.weight} onChange={e => handleCharChange("weight", parseInt(e.target.value) || 0)} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm" />
                    </div>
                </div>
              )}
            </div>
          </section>

          {/* Atributos - Tabela Avançada */}
          <section>
            <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-amber-600"></span> Matriz de Poder Inerente
            </h3>
            
            <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-800">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="border-b border-slate-800/50 text-[9px] uppercase tracking-widest text-slate-500">
                    <th className="py-4 px-2 font-black sticky left-0 bg-slate-900">Atributo</th>
                    {ATTRIBUTE_COLUMNS.map(col => (
                      <th key={col.key} className={`py-4 px-1 text-center font-black ${col.key === 'base' ? 'text-indigo-400' : ''}`}>
                        {col.label}
                      </th>
                    ))}
                    <th className="py-4 px-2 text-right text-emerald-400 font-black">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {attrList.map(attr => {
                    const data = attributes[attr] as unknown as AttributeData;
                    const total = Object.values(data).reduce((acc, curr) => acc + (Number(curr) || 0), 0);

                    return (
                      <tr key={attr} className="border-b border-slate-800/30 group hover:bg-slate-800/20 transition-colors">
                        <td className="py-3 px-2 font-bold text-slate-200 sticky left-0 bg-slate-900 group-hover:bg-slate-800 transition-colors">
                          {attr}
                        </td>
                        {ATTRIBUTE_COLUMNS.map(col => (
                          <td key={col.key} className="py-3 px-1">
                            <input 
                              type="number" 
                              value={data[col.key] || 0} 
                              onChange={e => handleAttrChange(attr, col.key, parseInt(e.target.value) || 0)}
                              className={`w-full bg-slate-950/30 border border-slate-800 rounded px-1 py-1.5 text-center text-xs focus:border-indigo-500/50 outline-none transition-all ${col.key === 'base' ? 'text-indigo-300 font-bold' : 'text-slate-400'}`}
                            />
                          </td>
                        ))}
                        <td className="py-3 px-4 text-right font-black text-emerald-400 text-lg">
                          {total}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

        </div>

        <div className="p-8 border-t border-slate-800 bg-slate-900/60 flex justify-between items-center">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">O destino do herói é forjado em cada ponto.</p>
          <button onClick={onClose} className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-900/40 active:scale-95">
            Selar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
