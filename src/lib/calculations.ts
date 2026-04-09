import { Attributes, CharacterInfo, EquippedAccessories, InventoryItem } from "../types";

export function calculateStats(
  attrs: Attributes, 
  char: CharacterInfo,
  equippedAccessories?: EquippedAccessories,
  inventory?: InventoryItem[],
  aptidoes: Record<string, number> = {}
) {
  // 1. Calculate Gem Bonuses
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

  const computedAttributes: Attributes = {};
  Object.keys(attrs).forEach(key => {
    computedAttributes[key] = {
      base: attrs[key].base,
      bonus: (attrs[key].bonus || 0) + (gemBonuses.attributes[key] || 0)
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

  // Derived Stats (All 70)
  const derived: Record<string, string | number> = {
    "Absorção Física": "0%",
    "Absorção Mágica": "0%",
    "Absorção Mística": "0%",
    "Ação": 1 + Math.floor(char.level / 100),
    "Alcance Próprio": Math.ceil(char.height / 200),
    "Alcance Armado": Math.ceil(char.height / 200),
    "Ataque Físico Armado": setBd("Ataque Físico Armado", Math.floor(forca / 5), { val: gemBonuses.agressoras["Físicos"] || 0, label: "Gema" }),
    "Ataque Físico Desarmado": setBd("Ataque Físico Desarmado", Math.floor(forca / 5), { val: gemBonuses.agressoras["Físicos"] || 0, label: "Gema" }, { val: pcFisico, label: pcLabel }),
    "Ataque Físico Propulsivo": setBd("Ataque Físico Propulsivo", Math.floor(con / 5), { val: gemBonuses.agressoras["Físicos"] || 0, label: "Gema" }),
    "Ataque Mágico Armado": setBd("Ataque Mágico Armado", Math.floor(int / 5), { val: gemBonuses.agressoras["Mágicos"] || 0, label: "Gema" }),
    "Ataque Mágico Desarmado": setBd("Ataque Mágico Desarmado", Math.floor(int / 5), { val: gemBonuses.agressoras["Mágicos"] || 0, label: "Gema" }, { val: pcMagico, label: pcLabel }),
    "Ataque Mágico Propulsivo": setBd("Ataque Mágico Propulsivo", Math.floor(con / 5), { val: gemBonuses.agressoras["Mágicos"] || 0, label: "Gema" }),
    "Ataque Místico Armado": setBd("Ataque Místico Armado", Math.floor(car / 5), { val: gemBonuses.agressoras["Místicos"] || 0, label: "Gema" }),
    "Ataque Místico Desarmado": setBd("Ataque Místico Desarmado", Math.floor(car / 5), { val: gemBonuses.agressoras["Místicos"] || 0, label: "Gema" }, { val: pcMistico, label: pcLabel }),
    "Ataque Místico Propulsivo": setBd("Ataque Místico Propulsivo", Math.floor(con / 5), { val: gemBonuses.agressoras["Místicos"] || 0, label: "Gema" }),
    "Audição": con * 10,
    "Bloqueio": "0%",
    "Carga Horizontal": forca * 10,
    "Carga Máxima": forca * 1.5,
    "Carga Vertical": forca * 5,
    "Controle Mágico": Math.floor(int / 10),
    "Controle Místico": Math.floor(car / 10),
    "Crítico Positivo": Math.min(5, Math.floor(sor / 10)),
    "Crítico Negativo": "Max do Dado",
    "Defesa Física": setBd("Defesa Física", Math.floor(cst / 5), { val: gemBonuses.protetoras["Física"] || 0, label: "Gema" }),
    "Defesa Mágica": setBd("Defesa Mágica", Math.floor(con / 5), { val: gemBonuses.protetoras["Mágica"] || 0, label: "Gema" }),
    "Defesa Mística": setBd("Defesa Mística", Math.floor(von / 5), { val: gemBonuses.protetoras["Mística"] || 0, label: "Gema" }), // wait, user mentions: Física, Mágica, Mental, Universal. Mística? Let's assume Mística is Mental? No, "Mental"
    "Defesa Mental": setBd("Defesa Mental", Math.floor(intu / 5), { val: gemBonuses.protetoras["Mental"] || 0, label: "Gema" }),
    "Defesa Universal": setBd("Defesa Universal", Math.floor((cst + con + von) / 50), { val: gemBonuses.protetoras["Universal"] || 0, label: "Gema" }),
    "Desconto": Math.min(100, car) + "%",
    "Destino": destino,
    "Dificuldade Armada": des,
    "Dificuldade Desarmada": des,
    "Evasão": setBd("Evasão", Math.floor(des / 5), { val: anBonus, label: anLabel }),
    "Foco Mágico": Math.floor(int / 5),
    "Foco Místico": Math.floor(car / 5),
    "Fôlego": Math.floor(cst / 5),
    "Gravidade Máxima": 1 + Math.floor(cst / 5),
    "Gravidade Mínima": 0 - Math.floor(cst / 10),
    "Introspecção": introspeccao,
    "Multiplicador Armado": Math.floor(intu / 10),
    "Multiplicador Desarmado": 1 + Math.floor(intu / 10),
    "Olfato": con * 10,
    "Pressão Apneica": 1 + (cst * 2),
    "Pressão Eupneica": 1 + Math.floor(cst / 2),
    "Pulo Horizontal": Math.floor((cst + des + forca) / 5 - ((char.weight - 100) / 100)),
    "Pulo Vertical": Math.floor((cst + des + forca) / 25 - ((char.weight - 100) / 100)),
    "Reação": 1 + Math.floor(char.level / 100),
    "Recuperação Estocástica": Math.floor(sor / 100),
    "Recuperação Física": setBd("Recuperação Física", Math.floor(cst / 50), { val: gemBonuses.indutoras["Física"] || 0, label: "Gema" }),
    "Recuperação Hepática": Math.floor(cst / 50),
    "Recuperação Heurística": Math.floor(von / 100),
    "Recuperação Mágica": setBd("Recuperação Mágica", Math.floor(con / 50), { val: gemBonuses.indutoras["Mágica"] || 0, label: "Gema" }),
    "Recuperação Mística": setBd("Recuperação Mística", Math.floor(von / 50), { val: gemBonuses.indutoras["Mística"] || 0, label: "Gema" }),
    "Recuperação Péptica": Math.floor(cst / 50),
    "Recuperação Sincrética": Math.floor(von / 100),
    "Recuperação Telótica": Math.floor(von / 100),
    "Redutor Físico": setBd("Redutor Físico", Math.floor(cst / 25), { val: gemBonuses.dominantes["Físico"] || 0, label: "Gema" }),
    "Redutor Mágico": setBd("Redutor Mágico", Math.floor(con / 25), { val: gemBonuses.dominantes["Mágico"] || 0, label: "Gema" }),
    "Redutor Místico": setBd("Redutor Místico", Math.floor(von / 25), { val: gemBonuses.dominantes["Místico"] || 0, label: "Gema" }),
    "Reflexo": 0,
    "Regeneração Sânica": setBd("Regeneração Sânica", Math.floor(intu / 100), { val: gemBonuses.indutoras["Sânica"] || 0, label: "Gema" }),
    "Regeneração Vital": setBd("Regeneração Vital", Math.floor(cst / 100), { val: gemBonuses.indutoras["Vital"] || 0, label: "Gema" }),
    "Resistência Combustiva": "0%",
    "Resistência Corrosiva": "0%",
    "Resistência Elétrica": "0%",
    "Revide": "0%",
    "Temperatura Máxima": 30 + cst,
    "Temperatura Mínima": 15 - Math.floor(cst / 2),
    "Tenacidade": Math.floor(von / 5),
    "Velocidade": vitalidade,
    "Visão": con * 10,
    "Vitalidade": vitalidade,
    "Voz": cst * 10,
  };

  // Max Status
  const maxStatus = {
    vida: setBd("Vida Máx", cst * 2, { val: gemBonuses.tanque["Vida"] || 0, label: "Gema" }),
    sanidade: setBd("Sanidade Máx", intu * 2, { val: gemBonuses.tanque["Sanidade"] || 0, label: "Gema" }),
    vigor: setBd("Vigor Máx", cst * 2, { val: gemBonuses.tanque["Vigor"] || 0, label: "Gema" }),
    mana: setBd("Mana Máx", con * 2, { val: gemBonuses.tanque["Mana"] || 0, label: "Gema" }),
    poder: setBd("Poder Máx", von * 2, { val: gemBonuses.tanque["Poder"] || 0, label: "Gema" }),
    estomago: setBd("Estômago", Math.max(1, Math.floor(cst / 10)), { val: gemBonuses.status["Estômago"] || 0, label: "Gema" }),
    figado: setBd("Fígado", Math.max(1, Math.floor(cst / 10)), { val: gemBonuses.status["Fígado"] || 0, label: "Gema" }),
    estudo: setBd("Estudo", Math.max(1, Math.floor(von / 10)), { val: gemBonuses.status["Estudo"] || 0, label: "Gema" }),
    pratica: setBd("Prática", Math.max(1, Math.floor(von / 10)), { val: gemBonuses.status["Prática"] || 0, label: "Gema" }),
    treino: setBd("Treino", Math.max(1, Math.floor(von / 10)), { val: gemBonuses.status["Treino"] || 0, label: "Gema" }),
    extrapolar: setBd("Extrapolar", Math.max(1, Math.floor(sor / 10)), { val: gemBonuses.status["Extrapolar"] || 0, label: "Gema" }),
    aura: Math.floor((destino + introspeccao + vitalidade) / 3) * 10,
    espirito: destino * 10,
    prana: vitalidade * 10,
    qi: introspeccao * 10,
  };

  return { derived, maxStatus, computedAttributes, statBreakdown };
}
