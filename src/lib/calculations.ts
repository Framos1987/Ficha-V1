import { Attributes, CharacterInfo, EquippedAccessories, InventoryItem } from "../types";

export function calculateStats(
  attrs: Attributes, 
  char: CharacterInfo,
  equippedAccessories?: EquippedAccessories,
  inventory?: InventoryItem[],
  aptidoes: Record<string, number> = {}
) {
  // 1. Calculate Gem Bonuses (for backward compatibility if needed, though now part of AttributeData gema)
  const gemBonuses = {
    attributes: {} as Record<string, number>,
    derived: {} as Record<string, number>,
    status: {} as Record<string, number>,
    dominantes: {} as Record<string, number>,
    agressoras: {} as Record<string, number>,
    indutoras: {} as Record<string, number>,
    protetoras: {} as Record<string, number>,
    tanque: {} as Record<string, number>,
  };

  if (equippedAccessories && inventory) {
    Object.values(equippedAccessories).forEach(accReq => {
      if (!accReq || !accReq.socketedGemIds) return;

      accReq.socketedGemIds.forEach(gemId => {
        const gem = inventory.find(i => i.id === gemId);
        if (gem && gem.gemEffect) {
          const { category, target, value } = gem.gemEffect;
          if (category === 'Ampliadoras (Atributos)') {
            gemBonuses.attributes[target] = (gemBonuses.attributes[target] || 0) + value;
          } else if (category === 'Ampliadoras (Derivados)') {
            gemBonuses.derived[target] = (gemBonuses.derived[target] || 0) + value;
          } else if (category === 'Ampliadoras (Status)') {
            gemBonuses.status[target] = (gemBonuses.status[target] || 0) + value;
          } else if (category === 'Dominantes') {
            gemBonuses.dominantes[target] = (gemBonuses.dominantes[target] || 0) + value;
          } else if (category === 'Agressoras') {
            gemBonuses.agressoras[target] = (gemBonuses.agressoras[target] || 0) + value;
          } else if (category === 'Indutoras') {
            gemBonuses.indutoras[target] = (gemBonuses.indutoras[target] || 0) + value;
          } else if (category === 'Protetoras') {
            gemBonuses.protetoras[target] = (gemBonuses.protetoras[target] || 0) + value;
          } else if (category === 'Tanque') {
            gemBonuses.tanque[target] = (gemBonuses.tanque[target] || 0) + value;
          }
        }
      });
    });
  }

  // 2. Automations (Race, Constellation, Gender)
  const autoBonuses: Record<string, number> = {};
  const statusAutoBonuses: Record<string, number> = {};

  // Gender
  if (char.gender === 'XY') autoBonuses["Força"] = (autoBonuses["Força"] || 0) + 2;
  if (char.gender === 'XX') autoBonuses["Destreza"] = (autoBonuses["Destreza"] || 0) + 2;
  if (char.gender === '∅∅') autoBonuses["Carisma"] = (autoBonuses["Carisma"] || 0) + 2;

  // Constellation
  switch (char.constellation?.split(' ')[0]) {
    case 'Rato': autoBonuses["Inteligência"] = (autoBonuses["Inteligência"] || 0) + 2; break;
    case 'Touro': autoBonuses["Constituição"] = (autoBonuses["Constituição"] || 0) + 2; break;
    case 'Tigre': autoBonuses["Força"] = (autoBonuses["Força"] || 0) + 2; break;
    case 'Coelho': autoBonuses["Carisma"] = (autoBonuses["Carisma"] || 0) + 2; break;
    case 'Dragão': autoBonuses["Sorte"] = (autoBonuses["Sorte"] || 0) + 2; break;
    case 'Serpente': autoBonuses["Destreza"] = (autoBonuses["Destreza"] || 0) + 2; break;
    case 'Cavalo': statusAutoBonuses["vigor"] = (statusAutoBonuses["vigor"] || 0) + 10; break;
    case 'Carneiro': statusAutoBonuses["poder"] = (statusAutoBonuses["poder"] || 0) + 10; break;
    case 'Macaco': autoBonuses["Consciência"] = (autoBonuses["Consciência"] || 0) + 2; break;
    case 'Galo': statusAutoBonuses["mana"] = (statusAutoBonuses["mana"] || 0) + 10; break;
    case 'Cão': autoBonuses["Intuição"] = (autoBonuses["Intuição"] || 0) + 2; break;
    case 'Porco': autoBonuses["Vontade"] = (autoBonuses["Vontade"] || 0) + 2; break;
  }

  // Race Base Bonuses
  if (char.race === 'Goblínica') {
    autoBonuses["Constituição"] = (autoBonuses["Constituição"] || 0) + 2;
    autoBonuses["Destreza"] = (autoBonuses["Destreza"] || 0) + 2;
    autoBonuses["Vontade"] = (autoBonuses["Vontade"] || 0) + 2;
  } else if (char.race === 'Animálica') {
    autoBonuses["Consciência"] = (autoBonuses["Consciência"] || 0) + 2;
    autoBonuses["Constituição"] = (autoBonuses["Constituição"] || 0) + 2;
    autoBonuses["Destreza"] = (autoBonuses["Destreza"] || 0) + 2;
  } else if (char.race === 'Terrana') {
    autoBonuses["Carisma"] = (autoBonuses["Carisma"] || 0) + 2;
    autoBonuses["Consciência"] = (autoBonuses["Consciência"] || 0) + 2;
    autoBonuses["Constituição"] = (autoBonuses["Constituição"] || 0) + 2;
  } else if (char.race === 'Humana' && char.humanBonuses) {
    char.humanBonuses.forEach(attr => {
      autoBonuses[attr] = (autoBonuses[attr] || 0) + 2;
    });
  }

  const computedAttributes: Attributes = {};
  Object.keys(attrs).forEach(key => {
    const d = attrs[key];
    const totalBonus = 
      (d.adquirido || 0) + 
      (d.raca || 0) + 
      (d.passiva || 0) + 
      (d.genero || 0) + 
      (d.constelacao || 0) + 
      (d.titulo || 0) + 
      (d.equipamento || 0) + 
      (d.runa || 0) + 
      (d.gema || 0) + 
      (d.temp || 0) + 
      (d.bonus || 0) - 
      (d.onus || 0) +
      (gemBonuses.attributes[key] || 0) +
      (autoBonuses[key] || 0);

    computedAttributes[key] = {
      ...d,
      base: d.base, // Inerente
      bonus: totalBonus
    };
  });

  const getTot = (name: string) => (computedAttributes[name]?.base || 0) + (computedAttributes[name]?.bonus || 0);

  const car = getTot("Carisma");
  const con = getTot("Consciência");
  const cst = getTot("Constituição");
  const des = getTot("Destreza");
  const forca = getTot("Força");
  const int = getTot("Inteligência");
  const intu = getTot("Intuição");
  const sor = getTot("Sorte");
  const von = getTot("Vontade");

  const statBreakdown: Record<string, { base: number; bonus: number; label: string }> = {};

  const setBd = (key: string, base: number, ...bonuses: { val: number, label: string }[]) => {
    let tot = 0;
    let lbls: string[] = [];
    for (const b of bonuses) {
      if (b && b.val > 0) {
        tot += b.val;
        lbls.push(b.label);
      }
    }
    if (tot > 0) {
      statBreakdown[key] = { base, bonus: tot, label: lbls.join(' + ') };
    }
    return base + tot;
  };

  // Aptidoes logic
  const anProf = aptidoes["Armadura Natural"] ?? 0;
  const anTier = Math.min(10, Math.floor(anProf / 10));
  const anBonus = anTier > 0 ? Math.floor(des / (11 - anTier)) : 0;
  const anLabel = anTier > 0 ? `Armadura Natural ${["Novato","Aprendiz","Iniciado","Adepto","Veterano","Expert","Virtuoso","Sábio","Mestre","Grão Mestre"][anTier - 1]}` : "";

  // Race Dynamic Bonuses
  const racaEvasaoBonus = char.race === 'Goblínica' ? Math.floor(des / 10) : 0;
  const racaPercepcaoMulti = char.race === 'Animálica' ? 5 : (char.race === 'Terrana' ? 10 : 0);

  const pcProf = aptidoes["Pancrácio"] ?? 0;
  const pcTier = Math.min(10, Math.floor(pcProf / 10));
  const pcDivisor = pcTier > 0 ? (11 - pcTier) : 1;
  const pcFisico = pcTier > 0 ? Math.floor(forca / pcDivisor) : 0;
  const pcMagico = pcTier > 0 ? Math.floor(int / pcDivisor) : 0;
  const pcMistico = pcTier > 0 ? Math.floor(car / pcDivisor) : 0;
  const pcLabel = pcTier > 0 ? `Pancrácio ${["Novato","Aprendiz","Iniciado","Adepto","Veterano","Expert","Virtuoso","Sábio","Mestre","Grão Mestre"][pcTier - 1]}` : "";

  // Core groupings
  const destino = setBd("Destino", Math.floor((car + von + sor) / 3), { val: gemBonuses.derived["Destino"] || 0, label: "Gema" });
  const introspeccao = setBd("Introspecção", Math.floor((con + int + intu) / 3), { val: gemBonuses.derived["Introspecção"] || 0, label: "Gema" });
  const vitalidade = setBd("Vitalidade", Math.floor((cst + des + forca) / 3), { val: gemBonuses.derived["Vitalidade"] || 0, label: "Gema" });

  // Derived Stats
  const derived: Record<string, string | number> = {
    "Ação": 1 + Math.floor(char.level / 100),
    "Alcance Próprio": Math.ceil(char.height / 200),
    "Ataque Físico Armado": setBd("Ataque Físico Armado", Math.floor(forca / 5), { val: gemBonuses.agressoras["Físicos"] || 0, label: "Gema" }),
    "Ataque Físico Desarmado": setBd("Ataque Físico Desarmado", Math.floor(forca / 5), { val: gemBonuses.agressoras["Físicos"] || 0, label: "Gema" }, { val: pcFisico, label: pcLabel }),
    "Audição": con * 10 + (con * racaPercepcaoMulti),
    "Carga Máxima": forca * 1.5,
    "Defesa Física": setBd("Defesa Física", Math.floor(cst / 5), { val: gemBonuses.protetoras["Física"] || 0, label: "Gema" }),
    "Defesa Mágica": setBd("Defesa Mágica", Math.floor(con / 5), { val: gemBonuses.protetoras["Mágica"] || 0, label: "Gema" }),
    "Defesa Mística": setBd("Defesa Mística", Math.floor(von / 5), { val: gemBonuses.protetoras["Mística"] || 0, label: "Gema" }),
    "Defesa Mental": setBd("Defesa Mental", Math.floor(intu / 5), { val: gemBonuses.protetoras["Mental"] || 0, label: "Gema" }),
    "Evasão": setBd("Evasão", Math.floor(des / 5), { val: anBonus, label: anLabel }, { val: racaEvasaoBonus, label: "Bônus Racial" }),
    "Olfato": con * 10 + (con * racaPercepcaoMulti),
    "Regeneração Vital": setBd("Regeneração Vital", Math.floor(cst / 100), { val: gemBonuses.indutoras["Vital"] || 0, label: "Gema" }),
    "Tenacidade": Math.floor(von / 5),
    "Velocidade": vitalidade,
    "Visão": con * 10,
    "Voz": cst * 10,
  };

  // Max Status
  const maxStatus = {
    vida: setBd("Vida Máx", cst * 2, { val: gemBonuses.tanque["Vida"] || 0, label: "Gema" }),
    sanidade: setBd("Sanidade Máx", intu * 2, { val: gemBonuses.tanque["Sanidade"] || 0, label: "Gema" }),
    vigor: setBd("Vigor Máx", cst * 2, { val: gemBonuses.tanque["Vigor"] || 0, label: "Gema" }, { val: statusAutoBonuses["vigor"] || 0, label: "Signo" }),
    mana: setBd("Mana Máx", con * 2, { val: gemBonuses.tanque["Mana"] || 0, label: "Gema" }, { val: statusAutoBonuses["mana"] || 0, label: "Signo" }),
    poder: setBd("Poder Máx", von * 2, { val: gemBonuses.tanque["Poder"] || 0, label: "Gema" }, { val: statusAutoBonuses["poder"] || 0, label: "Signo" }),
    estomago: setBd("Estômago", Math.max(1, Math.floor(cst / 10)), { val: gemBonuses.status["Estômago"] || 0, label: "Gema" }),
  };

  return { derived, maxStatus, computedAttributes, statBreakdown, gemBonuses };
}
