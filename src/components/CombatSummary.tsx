import { Shield, Sword, Activity } from "lucide-react";
import { EquippedArmor, EquippedWeapons, InventoryItem } from "../types";

interface CombatSummaryProps {
  equippedWeapons: EquippedWeapons;
  equippedArmor: EquippedArmor;
  inventory: InventoryItem[];
}

export function CombatSummary({ equippedWeapons, equippedArmor, inventory }: CombatSummaryProps) {
  // Calculate total defense without modifying values for penalties
  // (The GM dictates the final effect of penalties at the table)
  let totalDefenseFisica = 0;
  let totalDefenseMagica = 0;
  let totalDefenseMistica = 0;
  let totalArmorWeight = 0;

  Object.values(equippedArmor).forEach((layers) => {
    Object.values(layers).forEach((equippedItem) => {
      if (equippedItem) {
        const item = inventory.find((i) => i.id === equippedItem.id);
        if (item) {
          totalArmorWeight += item.weight;
          
          const matchFisica = item.description?.match(/Defesa.*Física.*:\s*\+([\d.]+)/);
          const matchMagica = item.description?.match(/Defesa.*Mágica.*:\s*\+([\d.]+)/);
          const matchMistica = item.description?.match(/Defesa.*Mística.*:\s*\+([\d.]+)/);
          const matchLegacy = item.description?.match(/Defesa:\s*\+([\d.]+)/);

          if (matchLegacy) {
            const val = parseFloat(matchLegacy[1]);
            totalDefenseFisica += val;
            totalDefenseMagica += val;
            totalDefenseMistica += val;
          } else {
            if (matchFisica) totalDefenseFisica += parseFloat(matchFisica[1]);
            if (matchMagica) totalDefenseMagica += parseFloat(matchMagica[1]);
            if (matchMistica) totalDefenseMistica += parseFloat(matchMistica[1]);
          }
        }
      }
    });
  });

  const mainWeapon = inventory.find(i => i.id === equippedWeapons.mainHand?.id);
  const offWeapon = inventory.find(i => i.id === equippedWeapons.offHand?.id);

  const getHandItemStats = (item?: InventoryItem) => {
    if (!item || !item.description) return "Nenhum bônus";

    // Revertendo penalty: a regra pede que exiba bruto. Se for arma, apenas lê o dano
    const weaponMatch = item.description.match(/Ataque (Físico|Mágico|Místico) Armado \+ ([^\s|]+(?:\s*[+×]\s*[^\s|]+)*)/);
    if (weaponMatch) {
      return `+ ${weaponMatch[2]} (${weaponMatch[1]})`;
    }

    if (item.category === 'Escudos') {
      const matchFisica = item.description.match(/Defesa.*Física.*:\s*\+([\d.]+)/);
      const matchMagica = item.description.match(/Defesa.*Mágica.*:\s*\+([\d.]+)/);
      const matchMistica = item.description.match(/Defesa.*Mística.*:\s*\+([\d.]+)/);

      let val = 0; let defType = '';
      if (matchFisica) { val = parseFloat(matchFisica[1]); defType = 'Física'; }
      else if (matchMagica) { val = parseFloat(matchMagica[1]); defType = 'Mágica'; }
      else if (matchMistica) { val = parseFloat(matchMistica[1]); defType = 'Mística'; }

      const secMatch = item.description.match(/Absorção.*:\s*\+([\d.]+)%|Aparar.*:\s*\+([\d.]+)%|Durabilidade.*:\s*\+([\d.]+)/);
      let secStr = "";
      if (secMatch) {
         if (item.description.includes("Absorção")) secStr = ` | Abs: +${secMatch[1]}%`;
         else if (item.description.includes("Aparar")) secStr = ` | Ap: +${secMatch[2]}%`;
         else if (item.description.includes("Durabilidade")) secStr = ` | Dur: +${secMatch[3]}`;
      }

      if (val > 0) return `Defesa +${val} (${defType})${secStr}`;
    }

    return "Nenhum bônus";
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden mt-6">
      <div className="absolute top-0 left-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      
      <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6 relative z-10">
        <Activity className="text-rose-400" />
        Resumo de Combate
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {/* Defense Summary */}
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 flex flex-col items-center justify-center text-center">
          <Shield size={32} className="text-emerald-400 mb-2" />
          <div className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Defesa Total</div>
          <div className="flex gap-4 mb-2">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-500 uppercase">Física</span>
              <span className="text-xl font-bold text-white">+{totalDefenseFisica.toFixed(1)}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-500 uppercase">Mágica</span>
              <span className="text-xl font-bold text-white">+{totalDefenseMagica.toFixed(1)}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-500 uppercase">Mística</span>
              <span className="text-xl font-bold text-white">+{totalDefenseMistica.toFixed(1)}</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-1">Peso da Armadura: {totalArmorWeight.toFixed(2)} kg</div>
        </div>

        {/* Main Hand */}
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <Sword size={18} className="text-amber-400" />
            <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Mão Principal</span>
          </div>
          {mainWeapon ? (
            <>
              <div className="font-bold text-slate-200 truncate" title={mainWeapon.name}>{mainWeapon.name}</div>
              <div className="text-lg font-bold text-rose-400 mt-1">{getHandItemStats(mainWeapon)}</div>
              <div className="text-xs text-slate-500 mt-2">Peso: {mainWeapon.weight.toFixed(2)} kg</div>
            </>
          ) : (
            <div className="text-slate-500 italic">Desarmado</div>
          )}
        </div>

        {/* Off Hand */}
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <Sword size={18} className="text-amber-400" />
            <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Mão Secundária</span>
          </div>
          {offWeapon ? (
            <>
              <div className="font-bold text-slate-200 truncate" title={offWeapon.name}>{offWeapon.name}</div>
              <div className="text-lg font-bold text-rose-400 mt-1">{getHandItemStats(offWeapon)}</div>
              <div className="text-xs text-slate-500 mt-2">Peso: {offWeapon.weight.toFixed(2)} kg</div>
            </>
          ) : (
            <div className="text-slate-500 italic">Desarmado / Livre</div>
          )}
        </div>
      </div>
    </div>
  );
}
