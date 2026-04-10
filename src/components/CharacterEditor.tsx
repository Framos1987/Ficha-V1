import { CharacterInfo, Attributes } from "../types";

interface CharacterEditorProps {
  charInfo: CharacterInfo;
  setCharInfo: (info: CharacterInfo) => void;
  attributes: Attributes;
  setAttributes: (attrs: Attributes) => void;
  onClose: () => void;
}

export function CharacterEditor({ charInfo, setCharInfo, attributes, setAttributes, onClose }: CharacterEditorProps) {
  const handleCharChange = (field: keyof CharacterInfo, value: string | number) => {
    setCharInfo({ ...charInfo, [field]: value });
  };

  const handleAttrChange = (attr: string, field: "base" | "bonus", value: number) => {
    setAttributes({
      ...attributes,
      [attr]: { ...attributes[attr], [field]: value }
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <h2 className="text-2xl font-bold text-white">Editar Personagem</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8">
          {/* Foto e Info Básica */}
          <section>
            <h3 className="text-lg font-semibold text-indigo-400 mb-4 border-b border-slate-800 pb-2">Identidade Visual</h3>
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="relative group">
                <div className="w-32 h-32 bg-slate-800 rounded-3xl border-2 border-slate-700 overflow-hidden shadow-2xl flex items-center justify-center">
                  {charInfo.imageUrl ? (
                    <img src={charInfo.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-slate-600" />
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-3xl">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          handleCharChange("imageUrl", reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                  <div className="text-white text-xs font-bold text-center p-2">Alterar Foto</div>
                </label>
                {charInfo.imageUrl && (
                  <button 
                    onClick={() => handleCharChange("imageUrl", "")}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 w-full">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Nome</label>
                  <input type="text" value={charInfo.name} onChange={e => handleCharChange("name", e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Nível Total</label>
                  <input type="number" value={charInfo.level} onChange={e => handleCharChange("level", parseInt(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Raça / Espécie</label>
                  <input type="text" value={charInfo.race} onChange={e => handleCharChange("race", e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Altura (cm)</label>
                  <input type="number" value={charInfo.height} onChange={e => handleCharChange("height", parseInt(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" />
                </div>
              </div>
            </div>
          </section>

          {/* Níveis de Desenvolvimento */}
          <section>
            <h3 className="text-lg font-semibold text-indigo-400 mb-4 border-b border-slate-800 pb-2">Níveis de Desenvolvimento</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Físico</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Nível</label>
                    <input type="number" value={charInfo.physicalLevel || 0} onChange={e => handleCharChange("physicalLevel", parseInt(e.target.value) || 0)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Valor</label>
                    <input type="number" value={charInfo.physicalValue || 0} onChange={e => handleCharChange("physicalValue", parseInt(e.target.value) || 0)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm" />
                  </div>
                </div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Intelectual</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Nível</label>
                    <input type="number" value={charInfo.intellectualLevel || 0} onChange={e => handleCharChange("intellectualLevel", parseInt(e.target.value) || 0)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Valor</label>
                    <input type="number" value={charInfo.intellectualValue || 0} onChange={e => handleCharChange("intellectualValue", parseInt(e.target.value) || 0)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm" />
                  </div>
                </div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Social</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Nível</label>
                    <input type="number" value={charInfo.socialLevel || 0} onChange={e => handleCharChange("socialLevel", parseInt(e.target.value) || 0)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Valor</label>
                    <input type="number" value={charInfo.socialValue || 0} onChange={e => handleCharChange("socialValue", parseInt(e.target.value) || 0)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Atributos */}
          <section>
            <h3 className="text-lg font-semibold text-indigo-400 mb-4 border-b border-slate-800 pb-2">Atributos (Base + Bônus)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {Object.entries(attributes).map(([attr, data]) => (
                <div key={attr} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                  <span className="font-medium text-slate-200 w-1/3">{attr}</span>
                  <div className="flex items-center gap-2 w-2/3">
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Base</label>
                      <input type="number" value={data.base} onChange={e => handleAttrChange(attr, "base", parseInt(e.target.value) || 0)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-center" />
                    </div>
                    <span className="text-slate-600 mt-4">+</span>
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Bônus</label>
                      <input type="number" value={data.bonus} onChange={e => handleAttrChange(attr, "bonus", parseInt(e.target.value) || 0)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-center" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-800/50 flex justify-end">
          <button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-semibold transition-colors">
            Concluir Edição
          </button>
        </div>
      </div>
    </div>
  );
}
