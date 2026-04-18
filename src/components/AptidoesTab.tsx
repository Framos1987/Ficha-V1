import React, { useState } from "react";
import { Swords, Pickaxe, Compass, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";

// ─── Rank System ────────────────────────────────────────────────────────────────
export const RANKS = ["Leigo", "Novato", "Aprendiz", "Iniciado", "Adepto", "Veterano", "Expert", "Virtuoso", "Sábio", "Mestre", "Grão Mestre"] as const;
export type Rank = typeof RANKS[number];

/** Maps proficiency (0-100) to rank tier (0=Leigo, 1=Novato … 10=Grão Mestre) */
export function profToTier(prof: number): number {
  if (prof <= 0) return 0;
  return Math.min(10, Math.floor(prof / 10));
}

export function profToRank(prof: number): Rank {
  return RANKS[profToTier(prof)];
}

/** How many rank tiers is a player BELOW the item requirement? */
export function rankPenalty(playerProf: number, requiredTier: number): number {
  const playerTier = profToTier(playerProf);
  return Math.max(0, requiredTier - playerTier);
}

// ─── Aptidão Data ─────────────────────────────────────────────────────────────
interface AptidaoData {
  name: string;
  privileges: string[]; // index 0 = Novato rank, index 9 = Grão Mestre rank
}

const COMBAT_APTIDOES: AptidaoData[] = [
  {
    name: "Armadura Natural",
    privileges: [
      "Evasão +  Destreza ÷ 10",
      "Evasão +  Destreza ÷ 9",
      "Evasão +  Destreza ÷ 8",
      "Evasão +  Destreza ÷ 7",
      "Evasão +  Destreza ÷ 6",
      "Evasão +  Destreza ÷ 5",
      "Evasão +  Destreza ÷ 4",
      "Evasão +  Destreza ÷ 3",
      "Evasão +  Destreza ÷ 2",
      "Evasão +  Destreza",
    ],
  },
  {
    name: "Armadura Leve",
    privileges: [
      "Couro de Animais Bestiais",
      "Couro de Animais Humanoides",
      "Couro de Monstros Bestiais",
      "Couro de Monstros Humanoides",
      "Couro de Elementais Materiais",
      "Couro de Elementais Energéticos",
      "Couro de Aberrações Bestiais",
      "Couro de Aberrações Humanoides",
      "Couro de Criaturas Bestiais",
      "Couro de Criaturas Humanoides",
    ],
  },
  {
    name: "Armadura Média",
    privileges: [
      "Malha de Cobre / Ónix / Eucalipto",
      "Malha de Ferro / Granada / Pinheiro",
      "Malha de Níquel / Peridoto / Freixo",
      "Malha de Vanádio / Turmalina / Bétula",
      "Malha de Titânio / Topázio / Cedro",
      "Malha de Cromo / Ametista / Mogno",
      "Malha de Cobalto / Esmeralda / Figueira",
      "Malha de Irídio / Safira / Carvalho",
      "Malha de Rênio / Rubi / Álamo",
      "Malha de Volfrâmio / Diamante / Sequoia",
    ],
  },
  {
    name: "Armadura Pesada",
    privileges: [
      "Placa de Cobre / Ónix / Eucalipto",
      "Placa de Ferro / Granada / Pinheiro",
      "Placa de Níquel / Peridoto / Freixo",
      "Placa de Vanádio / Turmalina / Bétula",
      "Placa de Titânio / Topázio / Cedro",
      "Placa de Cromo / Ametista / Mogno",
      "Placa de Cobalto / Esmeralda / Figueira",
      "Placa de Irídio / Safira / Carvalho",
      "Placa de Rênio / Rubi / Álamo",
      "Placa de Volfrâmio / Diamante / Sequoia",
    ],
  },
  {
    name: "Arremesso",
    privileges: [
      "Arremesso de Cobre / Ónix / Eucalipto",
      "Arremesso de Ferro / Granada / Pinheiro",
      "Arremesso de Níquel / Peridoto / Freixo",
      "Arremesso de Vanádio / Turmalina / Bétula",
      "Arremesso de Titânio / Topázio / Cedro",
      "Arremesso de Cromo / Ametista / Mogno",
      "Arremesso de Cobalto / Esmeralda / Figueira",
      "Arremesso de Irídio / Safira / Carvalho",
      "Arremesso de Rênio / Rubi / Álamo",
      "Arremesso de Volfrâmio / Diamante / Sequoia",
    ],
  },
  {
    name: "Artilharia Civil",
    privileges: [
      "Art. Civil de Cobre / Ónix / Eucalipto",
      "Art. Civil de Ferro / Granada / Pinheiro",
      "Art. Civil de Níquel / Peridoto / Freixo",
      "Art. Civil de Vanádio / Turmalina / Bétula",
      "Art. Civil de Titânio / Topázio / Cedro",
      "Art. Civil de Cromo / Ametista / Mogno",
      "Art. Civil de Cobalto / Esmeralda / Figueira",
      "Art. Civil de Irídio / Safira / Carvalho",
      "Art. Civil de Rênio / Rubi / Álamo",
      "Art. Civil de Volfrâmio / Diamante / Sequoia",
    ],
  },
  {
    name: "Artilharia Marcial",
    privileges: [
      "Art. Marcial de Cobre / Ónix / Eucalipto",
      "Art. Marcial de Ferro / Granada / Pinheiro",
      "Art. Marcial de Níquel / Peridoto / Freixo",
      "Art. Marcial de Vanádio / Turmalina / Bétula",
      "Art. Marcial de Titânio / Topázio / Cedro",
      "Art. Marcial de Cromo / Ametista / Mogno",
      "Art. Marcial de Cobalto / Esmeralda / Figueira",
      "Art. Marcial de Irídio / Safira / Carvalho",
      "Art. Marcial de Rênio / Rubi / Álamo",
      "Art. Marcial de Volfrâmio / Diamante / Sequoia",
    ],
  },
  {
    name: "Artilharia Militar",
    privileges: [
      "Art. Militar de Cobre / Ónix / Eucalipto",
      "Art. Militar de Ferro / Granada / Pinheiro",
      "Art. Militar de Níquel / Peridoto / Freixo",
      "Art. Militar de Vanádio / Turmalina / Bétula",
      "Art. Militar de Titânio / Topázio / Cedro",
      "Art. Militar de Cromo / Ametista / Mogno",
      "Art. Militar de Cobalto / Esmeralda / Figueira",
      "Art. Militar de Irídio / Safira / Carvalho",
      "Art. Militar de Rênio / Rubi / Álamo",
      "Art. Militar de Volfrâmio / Diamante / Sequoia",
    ],
  },
  {
    name: "Escuderia",
    privileges: [
      "Escudos de Cobre / Ónix / Eucalipto",
      "Escudos de Ferro / Granada / Pinheiro",
      "Escudos de Níquel / Peridoto / Freixo",
      "Escudos de Vanádio / Turmalina / Bétula",
      "Escudos de Titânio / Topázio / Cedro",
      "Escudos de Cromo / Ametista / Mogno",
      "Escudos de Cobalto / Esmeralda / Figueira",
      "Escudos de Irídio / Safira / Carvalho",
      "Escudos de Rênio / Rubi / Álamo",
      "Escudos de Volfrâmio / Diamante / Sequoia",
    ],
  },
  {
    name: "Esgrima Civil",
    privileges: [
      "Esgrima Civil de Cobre / Ónix / Eucalipto",
      "Esgrima Civil de Ferro / Granada / Pinheiro",
      "Esgrima Civil de Níquel / Peridoto / Freixo",
      "Esgrima Civil de Vanádio / Turmalina / Bétula",
      "Esgrima Civil de Titânio / Topázio / Cedro",
      "Esgrima Civil de Cromo / Ametista / Mogno",
      "Esgrima Civil de Cobalto / Esmeralda / Figueira",
      "Esgrima Civil de Irídio / Safira / Carvalho",
      "Esgrima Civil de Rênio / Rubi / Álamo",
      "Esgrima Civil de Volfrâmio / Diamante / Sequoia",
    ],
  },
  {
    name: "Esgrima Marcial",
    privileges: [
      "Esgrima Marcial de Cobre / Ónix / Eucalipto",
      "Esgrima Marcial de Ferro / Granada / Pinheiro",
      "Esgrima Marcial de Níquel / Peridoto / Freixo",
      "Esgrima Marcial de Vanádio / Turmalina / Bétula",
      "Esgrima Marcial de Titânio / Topázio / Cedro",
      "Esgrima Marcial de Cromo / Ametista / Mogno",
      "Esgrima Marcial de Cobalto / Esmeralda / Figueira",
      "Esgrima Marcial de Irídio / Safira / Carvalho",
      "Esgrima Marcial de Rênio / Rubi / Álamo",
      "Esgrima Marcial de Volfrâmio / Diamante / Sequoia",
    ],
  },
  {
    name: "Esgrima Militar",
    privileges: [
      "Esgrima Militar de Cobre / Ónix / Eucalipto",
      "Esgrima Militar de Ferro / Granada / Pinheiro",
      "Esgrima Militar de Níquel / Peridoto / Freixo",
      "Esgrima Militar de Vanádio / Turmalina / Bétula",
      "Esgrima Militar de Titânio / Topázio / Cedro",
      "Esgrima Militar de Cromo / Ametista / Mogno",
      "Esgrima Militar de Cobalto / Esmeralda / Figueira",
      "Esgrima Militar de Irídio / Safira / Carvalho",
      "Esgrima Militar de Rênio / Rubi / Álamo",
      "Esgrima Militar de Volfrâmio / Diamante / Sequoia",
    ],
  },
  {
    name: "Manejo Arcano",
    privileges: [
      "Focos de Eucalipto",
      "Focos de Pinheiro",
      "Focos de Freixo",
      "Focos de Bétula",
      "Focos de Cedro",
      "Focos de Mogno",
      "Focos de Figueira",
      "Focos de Carvalho",
      "Focos de Álamo",
      "Focos de Sequoia",
    ],
  },
  {
    name: "Manejo Astral",
    privileges: [
      "Focos de Ónix",
      "Focos de Granada",
      "Focos de Peridoto",
      "Focos de Turmalina",
      "Focos de Topázio",
      "Focos de Ametista",
      "Focos de Esmeralda",
      "Focos de Safira",
      "Focos de Rubi",
      "Focos de Diamante",
    ],
  },
  {
    name: "Pancrácio",
    privileges: [
      "Ataque Desarmado + Força ÷ 10 / Carisma ÷ 10 / Inteligência ÷ 10",
      "Ataque Desarmado + Força ÷ 9 / Carisma ÷ 9 / Inteligência ÷ 9",
      "Ataque Desarmado + Força ÷ 8 / Carisma ÷ 8 / Inteligência ÷ 8",
      "Ataque Desarmado + Força ÷ 7 / Carisma ÷ 7 / Inteligência ÷ 7",
      "Ataque Desarmado + Força ÷ 6 / Carisma ÷ 6 / Inteligência ÷ 6",
      "Ataque Desarmado + Força ÷ 5 / Carisma ÷ 5 / Inteligência ÷ 5",
      "Ataque Desarmado + Força ÷ 4 / Carisma ÷ 4 / Inteligência ÷ 4",
      "Ataque Desarmado + Força ÷ 3 / Carisma ÷ 3 / Inteligência ÷ 3",
      "Ataque Desarmado + Força ÷ 2 / Carisma ÷ 2 / Inteligência ÷ 2",
      "Ataque Desarmado + Força / Carisma / Inteligência (pleno)",
    ],
  },
  {
    name: "Pugilismo",
    privileges: [
      "Luvas de Cobre / Ónix / Eucalipto",
      "Luvas de Ferro / Granada / Pinheiro",
      "Luvas de Níquel / Peridoto / Freixo",
      "Luvas de Vanádio / Turmalina / Bétula",
      "Luvas de Titânio / Topázio / Cedro",
      "Luvas de Cromo / Ametista / Mogno",
      "Luvas de Cobalto / Esmeralda / Figueira",
      "Luvas de Irídio / Safira / Carvalho",
      "Luvas de Rênio / Rubi / Álamo",
      "Luvas de Volfrâmio / Diamante / Sequoia",
    ],
  },
];

const EXTRACTION_APTIDOES: AptidaoData[] = [
  {
    "name": "Colheita",
    "privileges": [
      "Colher Plantas Mortas",
      "Colher Plantas Dormentes",
      "Colher Plantas Nascentes",
      "Colher Plantas Infantes",
      "Colher Plantas Jovens",
      "Colher Plantas Adultas",
      "Colher Plantas Anciãs",
      "Colher Plantas Centenárias",
      "Colher Plantas Milenares",
      "Colher Plantas Miríades"
    ]
  },
  {
    "name": "Dissecação",
    "privileges": [
      "Dissecar Animais Bestiais",
      "Dissecar Animais Humanoides",
      "Dissecar Monstros Bestiais",
      "Dissecar Monstros Humanoides",
      "Dissecar Elementais Bestiais",
      "Dissecar Elementais Humanoides",
      "Dissecar Aberrações Bestiais",
      "Dissecar Aberrações Humanoides",
      "Dissecar Criaturas Bestiais",
      "Dissecar Criaturas Humanoides"
    ]
  },
  {
    "name": "Garimpo",
    "privileges": [
      "Garimpar Quartzo & Ónix",
      "Garimpar Granada",
      "Garimpar Peridoto",
      "Garimpar Turmalina",
      "Garimpar Topázio",
      "Garimpar Ametista",
      "Garimpar Esmeralda",
      "Garimpar Safira",
      "Garimpar Rubi",
      "Garimpar Diamante"
    ]
  },
  {
    "name": "Lenhado",
    "privileges": [
      "Derrubar Árvores Comuns, Pinheiros & Sequoias | Torrar Madeira Comum, De Pinheiro & De Sequoia | Lenhar Madeira Comum, De Pinheiro & De Sequoia",
      "Derrubar Cedros | Torrar Madeira De Cedro | Lenhar Madeira De Cedro",
      "Derrubar Freixos | Torrar Madeira De Freixo | Lenhar Madeira De Freixo",
      "Derrubar Bétulas | Torrar Madeira De Bétula | Lenhar Madeira De Bétula",
      "Derrubar Mognos | Torrar Madeira De Mogno | Lenhar Madeira De Mogno",
      "Derrubar Carvalhos | Torrar Madeira De Carvalho | Lenhar Madeira De Carvalho",
      "Derrubar Ipês | Torrar Madeira De Ipê | Lenhar Madeira De Ipê",
      "Derrubar Acácias | Torrar Madeira De Acácia | Lenhar Madeira De Acácia",
      "Derrubar Sândalos | Torrar Madeira De Sândalo | Lenhar Madeira De Sândalo",
      "Derrubar Ébanos | Torrar Madeira De Ébano | Lenhar Madeira De Ébano"
    ]
  },
  {
    "name": "Mineração",
    "privileges": [
      "Minerar Pedra, Alumínio & Cobre",
      "Minerar Ferro & Latão",
      "Minerar Níquel",
      "Minerar Vanádio & Bronze",
      "Minerar Titânio",
      "Minerar Cromo & Prata",
      "Minerar Cobalto",
      "Minerar Irídio & Ouro",
      "Minerar Rênio",
      "Minerar Volfrâmio & Platina"
    ]
  }
];

const EXPLORATION_APTIDOES: AptidaoData[] = [
  {
    "name": "Administração",
    "privileges": [
      "Reduz Em 10% Os Tributos Sobre Suas Propriedades",
      "Reduz Em 10% Os Tributos Sobre Seus Negócios",
      "Reduz Em 10% Os Custos Manutencionais De Suas Propriedades",
      "Reduz Em 10% Os Custos Operacionais De Seus Negócios",
      "Aumenta Em 25% O Lucro Líquido De Suas Fontes De Receita",
      "Reduz Em 25% Os Tributos Sobre Suas Propriedades",
      "Reduz Em 25% Os Tributos Sobre Seus Negócios",
      "Reduz Em 25% Os Custos Manutencionais De Suas Propriedades",
      "Reduz Em 25% Os Custos Operacionais De Seus Negócios",
      "Aumenta Em 50% O Lucro Líquido De Suas Fontes De Receita"
    ]
  },
  {
    "name": "Análise",
    "privileges": [
      "Analisar Animais Bestiais | Analisar Aptidões De Novatos | Analisar Classes Comuns | Analisar Habilidades De 1º Classe",
      "Analisar Animais Humanoides | Analisar Aptidões De Aprendizes | Analisar Classes Incomuns | Analisar Habilidades De 2º Classe",
      "Analisar Monstros Bestiais | Analisar Aptidões De Iniciados | Analisar Classes Raras | Analisar Habilidades De 3º Classe",
      "Analisar Monstros Humanoides | Analisar Aptidões De Adeptos | Analisar Classes Exóticas | Analisar Habilidades De 4º Classe",
      "Analisar Elementais Materiais | Analisar Aptidões De Veteranos | Analisar Classes Fabulosas | Analisar Habilidades De 5º Classe",
      "Analisar Elementais Energéticos | Analisar Aptidões De Experts | Analisar Classes Fantásticas | Analisar Habilidades De 6º Classe",
      "Analisar Aberrações Bestiais | Analisar Aptidões De Virtuoses | Analisar Classes Lendárias | Analisar Habilidades De 7º Classe",
      "Analisar Aberrações Humanoides | Analisar Aptidões De Sábios | Analisar Classes Míticas | Analisar Habilidades De 8º Classe",
      "Analisar Criaturas Bestiais | Analisar Aptidões De Mestres | Analisar Classes Eonicas | Analisar Habilidades De 9º Classe",
      "Analisar Criaturas Humanoides | Analisar Aptidões De Grão Mestres | Analisar Iconoclasses | Analisar Habilidades De 10º Classe"
    ]
  },
  {
    "name": "Antropologia",
    "privileges": [
      "Conhecimento Sobre Culturas & Sociedades Exotéricas & Exógenas Que Ainda Existem",
      "Conhecimento Sobre Culturas & Sociedades Exotéricas & Endógenas Que Ainda Existem",
      "Conhecimento Sobre Culturas & Sociedades Liminares Que Ainda Existem",
      "Conhecimento Sobre Culturas & Sociedades Esotéricas & Exógenas Que Ainda Existem",
      "Conhecimento Sobre Culturas & Sociedades Esotéricas & Endógenas Que Ainda Existem",
      "Conhecimento Sobre Culturas & Sociedades Exotéricas & Exógenas Que Já Não Existem Mais",
      "Conhecimento Sobre Culturas & Sociedades Exotéricas & Endógenas Que Já Não Existem Mais",
      "Conhecimento Sobre Culturas & Sociedades Liminares Que Já Não Existem Mais",
      "Conhecimento Sobre Culturas & Sociedades Esotéricas & Exógenas Que Já Não Existem Mais",
      "Conhecimento Sobre Culturas & Sociedades Esotéricas & Endógenas Que Já Não Existem Mais"
    ]
  },
  {
    "name": "Apreciação",
    "privileges": [
      "Identificar Itens Cujo Valor Não Exceda 1 Bronze",
      "Identificar Itens Cujo Valor Não Exceda 10 Bronzes",
      "Identificar Itens Cujo Valor Não Exceda 1 Prata",
      "Identificar Itens Cujo Valor Não Exceda 10 Pratas",
      "Identificar Itens Cujo Valor Não Exceda 1 Ouro",
      "Identificar Itens Cujo Valor Não Exceda 10 Ouros",
      "Identificar Itens Cujo Valor Não Exceda 1 Platina",
      "Identificar Itens Cujo Valor Não Exceda 10 Platinas",
      "Identificar Itens Cujo Valor Exceda 10 Platinas",
      "Identificar Itens De Valor Inestimável"
    ]
  },
  {
    "name": "Arqueologia",
    "privileges": [
      "Conhecimento Sobre Monumentos & Objetos Pertencentes A Sociedades Que Deixaram De Existir A No Máximo 100 Anos",
      "Conhecimento Sobre Monumentos & Objetos Pertencentes A Sociedades Que Deixaram De Existir A No Máximo 250 Anos",
      "Conhecimento Sobre Monumentos & Objetos Pertencentes A Sociedades Que Deixaram De Existir A No Máximo 500 Anos",
      "Conhecimento Sobre Monumentos & Objetos Pertencentes A Sociedades Que Deixaram De Existir A No Máximo 1.000 Anos",
      "Conhecimento Sobre Monumentos & Objetos Pertencentes A Sociedades Que Deixaram De Existir A No Máximo 2.500 Anos",
      "Conhecimento Sobre Monumentos & Objetos Pertencentes A Sociedades Que Deixaram De Existir A No Máximo 5.000 Anos",
      "Conhecimento Sobre Monumentos & Objetos Pertencentes A Sociedades Que Deixaram De Existir A No Máximo 10.000 Anos",
      "Conhecimento Sobre Monumentos & Objetos Pertencentes A Sociedades Que Deixaram De Existir A No Máximo 25.000 Anos",
      "Conhecimento Sobre Monumentos & Objetos Pertencentes A Sociedades Que Deixaram De Existir A No Máximo 50.000 Anos",
      "Conhecimento Sobre Monumentos & Objetos Pertencentes A Sociedades Que Deixaram De Existir A No Máximo 100.000 Anos"
    ]
  },
  {
    "name": "Arrombamento",
    "privileges": [
      "Trancar & Destrancar Mecanismos De Placas Fixas | A Dificuldade De Perceber As Marcas De Arrombamento Que Você Deixa Se Torna Consciência Vs 1d10",
      "Trancar & Destrancar Mecanismos De Placas Móveis | A Dificuldade De Perceber As Marcas De Arrombamento Que Você Deixa Se Torna Consciência Vs 2d10",
      "Trancar & Destrancar Mecanismos De Pinos Cilíndricos | A Dificuldade De Perceber As Marcas De Arrombamento Que Você Deixa Se Torna Consciência Vs 3d10",
      "Trancar & Destrancar Mecanismos De Pinos Carretel | A Dificuldade De Perceber As Marcas De Arrombamento Que Você Deixa Se Torna Consciência Vs 4d10",
      "Trancar & Destrancar Mecanismos De Pinos Cogumelo | A Dificuldade De Perceber As Marcas De Arrombamento Que Você Deixa Se Torna Consciência Vs 5d10",
      "Trancar & Destrancar Mecanismos De Pinos Serrilhados | A Dificuldade De Perceber As Marcas De Arrombamento Que Você Deixa Se Torna Consciência Vs 6d10",
      "Trancar & Destrancar Mecanismos De Pinos Cavitados | A Dificuldade De Perceber As Marcas De Arrombamento Que Você Deixa Se Torna Consciência Vs 7d10",
      "Trancar & Destrancar Mecanismos De Pinos Tubulares | A Dificuldade De Perceber As Marcas De Arrombamento Que Você Deixa Se Torna Consciência Vs 8d10",
      "Trancar & Destrancar Mecanismos De Pinos Tetraédricos | A Dificuldade De Perceber As Marcas De Arrombamento Que Você Deixa Se Torna Consciência Vs 9d10",
      "Trancar & Destrancar Mecanismos De Discos Rotativos | A Dificuldade De Perceber As Marcas De Arrombamento Que Você Deixa Se Torna Consciência Vs 10d10"
    ]
  },
  {
    "name": "Astronomia",
    "privileges": [
      "Identificar Referências Geodésicas",
      "Identificar O Horário Atual Em Sua Localização",
      "Identificar O Estação Atual Em Sua Localização",
      "Identificar O Data Atual Em Sua Localização",
      "Identificar Sua Localização Em Mapas Celestiais",
      "Prever Fenómenos Astronómicos",
      "Prever Fenômenos Oceanográficos",
      "Prever Fenómenos Meteorológicos",
      "Prever Fenómenos Geológicos",
      "Prever O Local De Descanso De Constelações"
    ]
  },
  {
    "name": "Avulsão",
    "privileges": [
      "Extrair Mana De Cernes | A Dificuldade De Resistir A Sua Avulsão Se Torna Vontade Vs 1d10",
      "Extrair Mana De Vegetais | A Dificuldade De Resistir A Sua Avulsão Se Torna Vontade Vs 2d10",
      "Extrair Mana De Mortos | A Dificuldade De Resistir A Sua Avulsão Se Torna Vontade Vs 3d10",
      "Extrair Mana De Minerais | A Dificuldade De Resistir A Sua Avulsão Se Torna Vontade Vs 4d10",
      "Extrair Mana De Energias | A Dificuldade De Resistir A Sua Avulsão Se Torna Vontade Vs 5d10",
      "Extrair Mana De Animais | A Dificuldade De Resistir A Sua Avulsão Se Torna Vontade Vs 6d10",
      "Extrair Mana De Monstros | A Dificuldade De Resistir A Sua Avulsão Se Torna Vontade Vs 7d10",
      "Extrair Mana De Elementais | A Dificuldade De Resistir A Sua Avulsão Se Torna Vontade Vs 8d10",
      "Extrair Mana De Aberrações | A Dificuldade De Resistir A Sua Avulsão Se Torna Vontade Vs 9d10",
      "Extrair Mana De Criaturas | A Dificuldade De Resistir A Sua Avulsão Se Torna Vontade Vs 10d10"
    ]
  },
  {
    "name": "Cirurgia",
    "privileges": [
      "Operar Órgãos Do Sistema Tegumentar",
      "Operar Órgãos Do Sistema Muscular",
      "Operar Órgãos Do Sistema Esquelético",
      "Operar Órgãos Do Sistema Linfático",
      "Operar Órgãos Do Sistema Reprodutor",
      "Operar Órgãos Do Sistema Urinário",
      "Operar Órgãos Do Sistema Digestivo",
      "Operar Órgãos Do Sistema Respiratório",
      "Operar Órgãos Do Sistema Cardiovascular",
      "Operar Órgãos Do Sistema Nervoso"
    ]
  },
  {
    "name": "Comércio",
    "privileges": [
      "Seu Desconto Aumenta Em 10% Quando O Preço Calculado For Para Uma Compra Em Massa",
      "O Preço Que Consumidores Aceitam Pagar Por Seus Produtos & Serviços Aumenta Em 20%",
      "Seu Desconto Aumenta Em 20% Quando O Preço Calculado For Para Uma Compra Em Massa",
      "O Preço Que Consumidores Aceitam Pagar Por Seus Produtos & Serviços Aumenta Em 40%",
      "Seu Desconto Aumenta Em 30% Quando O Preço Calculado For Para Uma Compra Em Massa",
      "O Preço Que Consumidores Aceitam Pagar Por Seus Produtos & Serviços Aumenta Em 60%",
      "Seu Desconto Aumenta Em 40% Quando O Preço Calculado For Para Uma Compra Em Massa",
      "O Preço Que Consumidores Aceitam Pagar Por Seus Produtos & Serviços Aumenta Em 80%",
      "Seu Desconto Aumenta Em 50% Quando O Preço Calculado For Para Uma Compra Em Massa",
      "O Preço Que Consumidores Aceitam Pagar Por Seus Produtos & Serviços Aumenta Em 100%"
    ]
  },
  {
    "name": "Direção",
    "privileges": [
      "Dirigir Carruagens",
      "Dirigir Motos",
      "Dirigir Carros",
      "Dirigir Ônibus",
      "Dirigir Caminhões",
      "Dirigir Carretas",
      "Dirigir Tratores",
      "Dirigir Tanques",
      "Dirigir Trens",
      "Dirigir Mechas"
    ]
  },
  {
    "name": "Direito",
    "privileges": [
      "Conhecimento De Códigos Civis",
      "Conhecimento De Códigos Penais",
      "Conhecimento De Códigos Tributários",
      "Conhecimento De Códigos Administrativos",
      "Conhecimento De Códigos Processuais",
      "Conhecimento De Códigos Corporativos",
      "Conhecimento De Códigos Comerciais",
      "Conhecimento De Códigos Militares",
      "Conhecimento De Códigos Aristocráticos",
      "Conhecimento De Códigos Diplomáticos"
    ]
  },
  {
    "name": "Domesticação",
    "privileges": [
      "Interagir Com Animais Bestiais Filhotes | Domesticar Animais Bestiais Filhotes",
      "Interagir Com Animais Bestiais Adultos | Domesticar Animais Bestiais Adultos",
      "Interagir Com Monstros Bestiais Filhotes | Domesticar Monstros Bestiais Filhotes",
      "Interagir Com Monstros Bestiais Adultos | Domesticar Monstros Bestiais Adultos",
      "Interagir Com Elementais Bestiais Filhotes | Domesticar Elementais Bestiais Filhotes",
      "Interagir Com Elementais Bestiais Adultos | Domesticar Elementais Bestiais Adultos",
      "Interagir Com Aberrações Bestiais Filhotes | Domesticar Aberrações Bestiais Filhotes",
      "Interagir Com Aberrações Bestiais Adultas | Domesticar Aberrações Bestiais Adultas",
      "Interagir Com Criaturas Bestiais Filhotes | Domesticar Criaturas Bestiais Filhotes",
      "Interagir Com Criaturas Bestiais Adultas | Domesticar Criaturas Bestiais Adultas"
    ]
  },
  {
    "name": "Enfermagem",
    "privileges": [
      "Tratar Lesões Leves | Estancar Sangramentos Digitais & Faciais | Reanimar Seres Mortos Há Até 10 Segundos | Auxiliar Em Operações Aos Órgãos Do Sistema Tegumentar",
      "Tratar Lesões Moderadas | Estancar Sangramentos Manuais & Pedais | Reanimar Seres Mortos Há Até 20 Segundos | Auxiliar Em Operações Aos Órgãos Do Sistema Muscular",
      "Tratar Lesões Severas | Estancar Sangramentos Antebraquiais & Crurais | Reanimar Seres Mortos Há Até 30 Segundos | Auxiliar Em Operações Aos Órgãos Do Sistema Esquelético",
      "Tratar Lesões Extremas | Estancar Sangramentos Cubitais & Geniculares | Reanimar Seres Mortos Há Até 40 Segundos | Auxiliar Em Operações Aos Órgãos Do Sistema Linfático",
      "Tratar Mutilações | Estancar Sangramentos Braquiais & Merais | Reanimar Seres Mortos Há Até 50 Segundos | Auxiliar Em Operações Aos Órgãos Do Sistema Reprodutor",
      "Tratar Explorações | Estancar Sangramentos Omalais & Pélvicos | Reanimar Seres Mortos Há Até 60 Segundos | Auxiliar Em Operações Aos Órgãos Do Sistema Urinário",
      "Tratar Remoções | Estancar Sangramentos Abdominais & Lombares | Reanimar Seres Mortos Há Até 70 Segundos | Auxiliar Em Operações Aos Órgãos Do Sistema Digestivo",
      "Tratar Reparações | Estancar Sangramentos Torácicos & Dorsais | Reanimar Seres Mortos Há Até 80 Segundos | Auxiliar Em Operações Aos Órgãos Do Sistema Respiratório",
      "Tratar Reconstruções | Estancar Sangramentos Viscero Faciais | Reanimar Seres Mortos Há Até 90 Segundos | Auxiliar Em Operações Aos Órgãos Do Sistema Cardiovascular",
      "Tratar Substituições | Estancar Sangramentos Cervicais & Cefálicos | Reanimar Seres Mortos Há Até 100 Segundos | Auxiliar Em Operações Aos Órgãos Do Sistema Nervoso"
    ]
  },
  {
    "name": "Escalada",
    "privileges": [
      "Escalar Superfícies Irregulares Cujo Ângulo De Inclinação Não Exceda 60°",
      "Escalar Superfícies Regulares Cujo Ângulo De Inclinação Não Exceda 60°",
      "Escalar Superfícies Irregulares Cujo Ângulo De Inclinação Não Exceda 90°",
      "Escalar Superfícies Regulares Cujo Ângulo De Inclinação Não Exceda 90°",
      "Escalar Superfícies Irregulares Cujo Ângulo De Inclinação Não Exceda 120°",
      "Escalar Superfícies Regulares Cujo Ângulo De Inclinação Não Exceda 120°",
      "Escalar Superfícies Irregulares Cujo Ângulo De Inclinação | Não Exceda 150°",
      "Escalar Superfícies Regulares Cujo Ângulo De Inclinação Não Exceda 150°",
      "Escalar Superfícies Irregulares Cujo Ângulo De Inclinação Não Exceda 180°",
      "Escalar Superfícies Regulares Cujo Ângulo De Inclinação Não Exceda 180°"
    ]
  },
  {
    "name": "Fuga",
    "privileges": [
      "Fugir De Combates Envolvendo Animais Bestiais",
      "Fugir De Combates Envolvendo Animais Humanoides",
      "Fugir De Combates Envolvendo Monstros Bestiais",
      "Fugir De Combates Envolvendo Monstros Humanoides",
      "Fugir De Combates Envolvendo Elementais Bestiais",
      "Fugir De Combates Envolvendo Elementais Humanoides",
      "Fugir De Combates Envolvendo Aberrações Bestiais",
      "Fugir De Combates Envolvendo Aberrações Humanoides",
      "Fugir De Combates Envolvendo Criaturas Bestiais",
      "Fugir De Combates Envolvendo Criaturas Humanoides"
    ]
  },
  {
    "name": "Furtividade",
    "privileges": [
      "Esconder-Se Em Ambientes Escuros Permanecendo Oculto | A Dificuldade De Te Perceber Se Torna Consciência Vs 1d10",
      "Esconder-Se Em Ambientes Claros Permanecendo Oculto | A Dificuldade De Te Perceber Se Torna Consciência Vs 2d10",
      "Esconder-Se Em Ambientes Escuros Permanecendo Velado | A Dificuldade De Te Perceber Se Torna Consciência Vs 3d10",
      "Esconder-Se Em Ambientes Claros Permanecendo Velado | A Dificuldade De Te Perceber Se Torna Consciência Vs 4d10",
      "Esconder-Se Em Ambientes Escuros Permanecendo Aparente | A Dificuldade De Te Perceber Se Torna Consciência Vs 5d10",
      "Esconder-Se Em Ambientes Claros Permanecendo Aparente | A Dificuldade De Te Perceber Se Torna Consciência Vs 6d10",
      "Esconder-Se Em Ambientes Escuros Permanecendo Evidente | A Dificuldade De Te Perceber Se Torna Consciência Vs 7d10",
      "Esconder-Se Em Ambientes Claros Permanecendo Evidente | A Dificuldade De Te Perceber Se Torna Consciência Vs 8d10",
      "Esconder-Se Em Ambientes Escuros Permanecendo Exposto | A Dificuldade De Te Perceber Se Torna Consciência Vs 9d10",
      "Esconder-Se Em Ambientes Claros Permanecendo Exposto | A Dificuldade De Te Perceber Se Torna Consciência Vs 10d10"
    ]
  },
  {
    "name": "Furto",
    "privileges": [
      "Retirar & Colocar Itens No Inventário De Seres Totalmente Alheios A Sua Presença Sem Que Eles Percebam | A Dificuldade De Perceber Seu Furto Se Torna Consciência Vs 1d10",
      "Retirar & Colocar Itens No Corpo De Seres Totalmente Alheios A Sua Presença Sem Que Eles Percebam | A Dificuldade De Perceber Seu Furto Se Torna Consciência Vs 2d10",
      "Retirar & Colocar Itens No Inventário De Seres Alheios A Sua Presença Mas Desconfiados Da Possibilidade Dela Sem Que Eles Percebam | A Dificuldade De Perceber Seu Furto Se Torna Consciência Vs 3d10",
      "Retirar & Colocar Itens No Corpo De Seres Alheios A Sua Presença Mas Desconfiados Da Possibilidade Dela Sem Que Eles Percebam | A Dificuldade De Perceber Seu Furto Se Torna Consciência Vs 4d10",
      "Retirar & Colocar Itens No Inventário De Seres Cientes De Sua Presença Mas Indiferentes A Suas Ações Sem Que Eles Percebam | A Dificuldade De Perceber Seu Furto Se Torna Consciência Vs 5d10",
      "Retirar & Colocar Itens No Corpo De Seres Cientes De Sua Presença Mas Indiferentes A Suas Ações Sem Que Eles Percebam | A Dificuldade De Perceber Seu Furto Se Torna Consciência Vs 6d10",
      "Retirar & Colocar Itens No Inventário De Seres Cientes De Sua Presença & Atentos A Suas Ações Sem Que Eles Percebam | A Dificuldade De Perceber Seu Furto Se Torna Consciência Vs 7d10",
      "Retirar & Colocar Itens No Corpo De Seres Cientes De Sua Presença & Atentos A Suas Ações Sem Que Eles Percebam | A Dificuldade De Perceber Seu Furto Se Torna Consciência Vs 8d10",
      "Retirar & Colocar Itens No Inventário De Seres Cientes De Sua Presença & Hostis A Suas Ações Sem Que Eles Percebam | A Dificuldade De Perceber Seu Furto Se Torna Consciência Vs 9d10",
      "Retirar & Colocar Itens No Corpo De Seres Cientes De Sua Presença & Hostis A Suas Ações Sem Que Eles Percebam | A Dificuldade De Perceber Seu Furto Se Torna Consciência Vs 10d10"
    ]
  },
  {
    "name": "História",
    "privileges": [
      "Conhecimento Sobre Acontecimentos Dos Últimos 10 Anos",
      "Conhecimento Sobre Acontecimentos Dos Últimos 25 Anos",
      "Conhecimento Sobre Acontecimentos Dos Últimos 50 Anos",
      "Conhecimento Sobre Acontecimentos Dos Últimos 100 Anos",
      "Conhecimento Sobre Acontecimentos Dos Últimos 250 Anos",
      "Conhecimento Sobre Acontecimentos Dos Últimos 500 Anos",
      "Conhecimento Sobre Acontecimentos Dos Últimos 1.000 Anos",
      "Conhecimento Sobre Acontecimentos Dos Últimos 2.500 Anos",
      "Conhecimento Sobre Acontecimentos Dos Últimos 5.000 Anos",
      "Conhecimento Sobre Acontecimentos Dos Últimos 10.000 Anos"
    ]
  },
  {
    "name": "Interrogação",
    "privileges": [
      "Interrogar Seres Desleais Através De Tortura | A Dificuldade De Resistir Ao Seu Interrogatório Se Torna Vontade Vs 1d10",
      "Interrogar Seres Desleais Através De Coerção | A Dificuldade De Resistir Ao Seu Interrogatório Se Torna Vontade Vs 2d10",
      "Interrogar Seres Desleais Através De Negociação | A Dificuldade De Resistir Ao Seu Interrogatório Se Torna Vontade Vs 3d10",
      "Interrogar Seres Desleais Através De Manipulação | A Dificuldade De Resistir Ao Seu Interrogatório Se Torna Vontade Vs 4d10",
      "Interrogar Seres Desleais Através De Persuasão | A Dificuldade De Resistir Ao Seu Interrogatório Se Torna Vontade Vs 5d10",
      "Interrogar Seres Leais Através De Tortura | A Dificuldade De Resistir Ao Seu Interrogatório Se Torna Vontade Vs 6d10",
      "Interrogar Seres Leais Através De Coerção | A Dificuldade De Resistir Ao Seu Interrogatório Se Torna Vontade Vs 7d10",
      "Interrogar Seres Leais Através De Negociação | A Dificuldade De Resistir Ao Seu Interrogatório Se Torna Vontade Vs 8d10",
      "Interrogar Seres Leais Através De Manipulação | A Dificuldade De Resistir Ao Seu Interrogatório Se Torna Vontade Vs 9d10",
      "Interrogar Seres Leais Através De Persuasão | A Dificuldade De Resistir Ao Seu Interrogatório Se Torna Vontade Vs 10d10"
    ]
  },
  {
    "name": "Leitura",
    "privileges": [
      "Ler De Forma Elementar | Sua Velocidade De Leitura É De 1 Capítulo Por Hora",
      "Ler De Forma Inferencial | Sua Velocidade De Leitura É De 2 Capítulos Por Hora",
      "Ler De Forma Reflexiva | Sua Velocidade De Leitura É De 3 Capítulos Por Hora",
      "Ler De Forma Interpretativa | Sua Velocidade De Leitura É De 4 Capítulos Por Hora",
      "Ler De Forma Analítica | Sua Velocidade De Leitura É De 5 Capítulos Por Hora",
      "Ler De Forma Crítica | Sua Velocidade De Leitura É De 6 Capítulos Por Hora",
      "Ler De Forma Sintética | Sua Velocidade De Leitura É De 7 Capítulos Por Hora",
      "Ler De Forma Genética | Sua Velocidade De Leitura É De 8 Capítulos Por Hora",
      "Ler De Forma Hermenêutica | Sua Velocidade De Leitura É De 9 Capítulos Por Hora",
      "Ler De Forma Epistêmica | Sua Velocidade De Leitura É De 10 Capítulos Por Hora"
    ]
  },
  {
    "name": "Licenciatura",
    "privileges": [
      "Ensinar Aptidões A Novatos | Ensinar Encantos & Runas De Ranque F | Ensinar Classes Comuns | Ensinar Habilidades De 1º Classe | Ensinar Idiomas",
      "Ensinar Aptidões A Aprendizes | Ensinar Encantos & Runas De Ranque E | Ensinar Classes Incomuns | Ensinar Habilidades De 2º Classe",
      "Ensinar Aptidões A Iniciados | Ensinar Encantos & Runas De Ranque D | Ensinar Classes Raras | Ensinar Habilidades De 3º Classe",
      "Ensinar Aptidões A Adeptos | Ensinar Encantos & Runas De Ranque C | Ensinar Classes Exóticas | Ensinar Habilidades De 4º Classe",
      "Ensinar Aptidões A Veteranos | Ensinar Encantos & Runas De Ranque B | Ensinar Classes Fabulosas | Ensinar Habilidades De 5º Classe",
      "Ensinar Aptidões A Experts | Ensinar Encantos & Runas De Ranque A | Ensinar Classes Fantásticas | Ensinar Habilidades De 6º Classe",
      "Ensinar Aptidões A Virtuoses | Ensinar Encantos & Runas De Ranque S | Ensinar Classes Lendárias | Ensinar Habilidades De 7º Classe",
      "Ensinar Aptidões A Sábios | Ensinar Encantos & Runas De Ranque ☆ | Ensinar Classes Míticas | Ensinar Habilidades De 8º Classe",
      "Ensinar Aptidões A Mestres | Ensinar Encantos & Runas De Ranque ☆☆ | Ensinar Classes Eonicas | Ensinar Habilidades De 9º Classe",
      "Ensinar Aptidões A Grão Mestres | Ensinar Encantos & Runas De Ranque ☆☆☆ | Ensinar Iconoclasses | Ensinar Habilidades De 10º Classe"
    ]
  },
  {
    "name": "Medicina",
    "privileges": [
      "Diagnosticar Doenças Traumáticas | Conhecimento Sobre Doenças Traumáticas",
      "Diagnosticar Doenças Nutricionais | Conhecimento Sobre Doenças Nutricionais",
      "Diagnosticar Doenças Ambientais | Conhecimento Sobre Doenças Ambientais",
      "Diagnosticar Doenças Bacterianas | Conhecimento Sobre Doenças Bacterianas",
      "Diagnosticar Doenças Virais | Conhecimento Sobre Doenças Virais",
      "Diagnosticar Doenças Micóticas | Conhecimento Sobre Doenças Micóticas",
      "Diagnosticar Doenças Parasitárias | Conhecimento Sobre Doenças Parasitárias",
      "Diagnosticar Doenças Genéticas | Conhecimento Sobre Doenças Genéticas",
      "Diagnosticar Doenças Neoplásicas | Conhecimento Sobre Doenças Neoplásicas",
      "Diagnosticar Doenças Idiopáticas | Conhecimento Sobre Doenças Idiopáticas"
    ]
  },
  {
    "name": "Meditação",
    "privileges": [
      "Meditar Repousando Em Ambientes Serenos",
      "Meditar Repousando Em Ambientes Intensos",
      "Meditar Realizando Atividades Estritamente Físicas Em Ambientes Serenos",
      "Meditar Realizando Atividades Estritamente Físicas Em Ambientes Intensos",
      "Meditar Realizando Atividades Estritamente Mentais Em Ambientes Serenos",
      "Meditar Realizando Atividades Estritamente Mentais Em Ambientes Intensos",
      "Meditar Realizando Atividades Estritamente Sociais Em Ambientes Serenos",
      "Meditar Realizando Atividades Estritamente Sociais Em Ambientes Intensos",
      "Meditar Realizando Atividades Interdisciplinares Em Ambientes Serenos",
      "Meditar Realizando Atividades Interdisciplinares Em Ambientes Intensos"
    ]
  },
  {
    "name": "Montaria",
    "privileges": [
      "Montar Animais Domesticados",
      "Montar Animais Selvagens",
      "Montar Monstros Domesticados",
      "Montar Monstros Selvagens",
      "Montar Elementais Domesticados",
      "Montar Elementais Selvagens",
      "Montar Aberrações Domesticadas",
      "Montar Aberrações Selvagens",
      "Montar Criaturas Domesticadas",
      "Montar Criaturas Selvagens"
    ]
  },
  {
    "name": "Natação",
    "privileges": [
      "Nadar Em Líquidos Calmos Sem Correnteza",
      "Nadar Em Líquidos Turbulentos Sem Correnteza",
      "Nadar Em Líquidos Calmos A Favor De Correntezas Lentas",
      "Nadar Em Líquidos Turbulentos A Favor De Correntezas Lentas",
      "Nadar Em Líquidos Calmos A Favor De Correntezas Velozes",
      "Nadar Em Líquidos Turbulentos A Favor De Correntezas Velozes",
      "Nadar Em Líquidos Calmos Contra Correntezas Lentas",
      "Nadar Em Líquidos Turbulentos Contra Correntezas Lentas",
      "Nadar Em Líquidos Calmos Contra Correntezas Velozes",
      "Nadar Em Líquidos Turbulentos Contra Correntezas Velozes"
    ]
  },
  {
    "name": "Navegação",
    "privileges": [
      "Navegar Canoas",
      "Navegar Jangadas",
      "Navegar Lanchas",
      "Navegar Galés",
      "Navegar Veleiros",
      "Navegar Rebocadores",
      "Navegar Cruzeiros",
      "Navegar Cargueiros",
      "Navegar Encouraçados",
      "Navegar Submarinos"
    ]
  },
  {
    "name": "Pilotagem",
    "privileges": [
      "Pilotar Balões",
      "Pilotar Planadores",
      "Pilotar Dirigíveis",
      "Pilotar Autogiros",
      "Pilotar Aviões",
      "Pilotar Helicópteros",
      "Pilotar Convertiplanos",
      "Pilotar Ornitópteros",
      "Pilotar Espaçonaves",
      "Pilotar Astronaves"
    ]
  },
  {
    "name": "Política",
    "privileges": [
      "Conhecimento Sobre Indivíduos & Grupos Reconhecidos Mundialmente",
      "Conhecimento Sobre Indivíduos & Grupos Reconhecidos Intercontinentalmente",
      "Conhecimento Sobre Indivíduos & Grupos Reconhecidos Continentalmente",
      "Conhecimento Sobre Indivíduos & Grupos Reconhecidos Internacionalmente",
      "Conhecimento Sobre Indivíduos & Grupos Reconhecidos Nacionalmente",
      "Conhecimento Sobre Indivíduos & Grupos Reconhecidos Ducalmente",
      "Conhecimento Sobre Indivíduos & Grupos Reconhecidos Condalmente",
      "Conhecimento Sobre Indivíduos & Grupos Reconhecidos Baronalmente",
      "Conhecimento Sobre Indivíduos & Grupos Reconhecidos Feudalmente",
      "Conhecimento Sobre Indivíduos & Grupos Reconhecidos Localmente"
    ]
  },
  {
    "name": "Psicologia",
    "privileges": [
      "Diagnosticar Transtornos Traumáticos & Estressores | Tratar Transtornos Traumáticos & Estressores | Conhecimento Sobre Transtornos Traumáticos & Estressores",
      "Diagnosticar Transtornos Depressivos & Ansiosos | Tratar Transtornos Depressivos & Ansiosos | Conhecimento Sobre Transtornos Depressivos & Ansiosos",
      "Diagnosticar Transtornos Obsessivos & Compulsivos | Tratar Transtornos Obsessivos & Compulsivos | Conhecimento Sobre Transtornos Obsessivos & Compulsivos",
      "Diagnosticar Transtornos Alimentares & Eliminares | Tratar Transtornos Alimentares & Eliminares | Conhecimento Sobre Transtornos Alimentares & Eliminares",
      "Diagnosticar Transtornos Somáticos & Hipnagógicos | Tratar Transtornos Somáticos & Hipnagógicos | Conhecimento Sobre Transtornos Somáticos & Hipnagógicos",
      "Diagnosticar Transtornos Desenvolvimentais & Cognitivos | Tratar Transtornos Desenvolvimentais & Cognitivos | Conhecimento Sobre Transtornos Desenvolvimentais & Cognitivos",
      "Diagnosticar Transtornos Sexuais & Parafílicos | Tratar Transtornos Sexuais & Parafílicos | Conhecimento Sobre Transtornos Sexuais & Parafílicos",
      "Diagnosticar Transtornos Disruptivos & Aditivos | Tratar Transtornos Disruptivos & Aditivos | Conhecimento Sobre Transtornos Disruptivos & Aditivos",
      "Diagnosticar Transtornos Bipolares & Personológicos | Tratar Transtornos Bipolares & Personológicos | Conhecimento Sobre Transtornos Bipolares & Personológicos",
      "Diagnosticar Transtornos Psicóticos & Dissociativos | Tratar Transtornos Psicóticos & Dissociativos | Conhecimento Sobre Transtornos Psicóticos & Dissociativos"
    ]
  },
  {
    "name": "Rastreamento",
    "privileges": [
      "Identificar Rastros De Animais Bestiais",
      "Identificar Rastros De Animais Humanoides",
      "Identificar Rastros De Monstros Bestiais",
      "Identificar Rastros De Monstros Humanoides",
      "Identificar Rastros De Elementais Bestiais",
      "Identificar Rastros De Elementais Humanoides",
      "Identificar Rastros De Aberrações Bestiais",
      "Identificar Rastros De Aberrações Humanoides",
      "Identificar Rastros De Criaturas Bestiais",
      "Identificar Rastros De Criaturas Humanoides"
    ]
  },
  {
    "name": "Teologia",
    "privileges": [
      "Conhecimento Sobre Patronos Exaltados Vivos",
      "Conhecimento Sobre Patronos Exaltados Mortos",
      "Conhecimento Sobre Patronos Populares Vivos",
      "Conhecimento Sobre Patronos Populares Mortos",
      "Conhecimento Sobre Patronos Esotéricos Vivos",
      "Conhecimento Sobre Patronos Esotéricos Mortos",
      "Conhecimento Sobre Patronos Esquecidos Vivos",
      "Conhecimento Sobre Patronos Esquecidos Mortos",
      "Conhecimento Sobre Patronos Ocultos Vivos",
      "Conhecimento Sobre Patronos Ocultos Mortos"
    ]
  },
  {
    "name": "Ventriloquia",
    "privileges": [
      "Projetar Sua Voz Para Um Objeto Animado Como Se Ela Pertencesse A Ele Movendo Seus Lábios | A Dificuldade De Perceber Sua Projeção Vocal Se Torna Consciência Vs 1d10",
      "Projetar Sua Voz Para Um Objeto Animado Como Se Ela Pertencesse A Ele Sem Mover Seus Lábios | A Dificuldade De Perceber Sua Projeção Vocal Se Torna Consciência Vs 2d10",
      "Projetar Sua Voz Para Um Objeto Inanimado Como Se Ela Pertencesse A Ele Movendo Seus Lábios | A Dificuldade De Perceber Sua Projeção Vocal Se Torna Consciência Vs 3d10",
      "Projetar Sua Voz Para Um Objeto Inanimado Como Se Ela Pertencesse A Ele Sem Mover Seus Lábios | A Dificuldade De Perceber Sua Projeção Vocal Se Torna Consciência Vs 4d10",
      "Projetar Sua Voz Para Um Ser Vivo Como Se Ela Pertencesse A Ele Movendo Seus Lábios | A Dificuldade De Perceber Sua Projeção Vocal Se Torna Consciência Vs 5d10",
      "Projetar Sua Voz Para Um Ser Vivo Como Se Ela Pertencesse A Ele Sem Mover Seus Lábios | A Dificuldade De Perceber Sua Projeção Vocal Se Torna Consciência Vs 6d10",
      "Projetar Sua Voz Para Um Ser Morto Como Se Ela Pertencesse A Ele Movendo Seus Lábios | A Dificuldade De Perceber Sua Projeção Vocal Se Torna Consciência Vs 7d10",
      "Projetar Sua Voz Para Um Ser Morto Como Se Ela Pertencesse A Ele Sem Mover Seus Lábios | A Dificuldade De Perceber Sua Projeção Vocal Se Torna Consciência Vs 8d10",
      "Projetar Sua Voz Para Um Espaço Desocupado Como Se Ela Pertencesse A Ele Movendo Seus Lábios | A Dificuldade De Perceber Sua Projeção Vocal Se Torna Consciência Vs 9d10",
      "Projetar Sua Voz Para Um Espaço Desocupado Como Se Ela Pertencesse A Ele Sem Mover Seus Lábios | A Dificuldade De Perceber Sua Projeção Vocal Se Torna Consciência Vs 10d10"
    ]
  },
  {
    "name": "Zoologia",
    "privileges": [
      "Conhecimento Sobre Animais Bestiais",
      "Conhecimento Sobre Animais Humanoides",
      "Conhecimento Sobre Monstros Bestiais",
      "Conhecimento Sobre Monstros Humanoides",
      "Conhecimento Sobre Elementais Materiais",
      "Conhecimento Sobre Elementais Energéticos",
      "Conhecimento Sobre Aberrações Bestiais",
      "Conhecimento Sobre Aberrações Humanoides",
      "Conhecimento Sobre Criaturas Bestiais",
      "Conhecimento Sobre Criaturas Humanoides"
    ]
  }
];

// ─── Rank color helpers ────────────────────────────────────────────────────────
const RANK_COLOR: Record<string, string> = {
  Leigo: "bg-slate-700 text-slate-400",
  Novato: "bg-green-900/60 text-green-400 border border-green-700/50",
  Aprendiz: "bg-teal-900/60 text-teal-400 border border-teal-700/50",
  Iniciado: "bg-blue-900/60 text-blue-400 border border-blue-700/50",
  Adepto: "bg-indigo-900/60 text-indigo-400 border border-indigo-700/50",
  Veterano: "bg-violet-900/60 text-violet-400 border border-violet-700/50",
  Expert: "bg-purple-900/60 text-purple-400 border border-purple-700/50",
  Virtuoso: "bg-fuchsia-900/60 text-fuchsia-400 border border-fuchsia-700/50",
  Sábio: "bg-pink-900/60 text-pink-400 border border-pink-700/50",
  Mestre: "bg-amber-900/60 text-amber-400 border border-amber-700/50",
  "Grão Mestre": "bg-yellow-900/60 text-yellow-300 border border-yellow-600/50",
};

const RANK_BAR_COLOR: Record<string, string> = {
  Leigo: "bg-slate-600",
  Novato: "bg-green-500",
  Aprendiz: "bg-teal-500",
  Iniciado: "bg-blue-500",
  Adepto: "bg-indigo-500",
  Veterano: "bg-violet-500",
  Expert: "bg-purple-500",
  Virtuoso: "bg-fuchsia-500",
  Sábio: "bg-pink-500",
  Mestre: "bg-amber-500",
  "Grão Mestre": "bg-yellow-400",
};

export const AptidaoCard: React.FC<{
  aptidao: AptidaoData;
  proficiency: number;
  onChange: (val: number) => void;
}> = ({ aptidao, proficiency, onChange }) => {
  const [expanded, setExpanded] = useState(false);
  const tier = profToTier(proficiency);
  const rank = profToRank(proficiency);
  const privilege = tier === 0 ? "Sem privilégio (Leigo)" : aptidao.privileges[tier - 1];
  const barPct = proficiency;

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-700/80 hover:border-slate-600 transition-colors overflow-hidden">
      {/* Header row */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${RANK_COLOR[rank]}`}>
              {rank}
            </span>
            <span className="text-sm font-semibold text-slate-200 truncate">{aptidao.name}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <input
              type="number"
              min={0}
              max={100}
              value={proficiency}
              onChange={e => onChange(Math.max(0, Math.min(100, Number(e.target.value))))}
              className="w-16 text-center bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <button onClick={() => setExpanded(p => !p)} className="text-slate-500 hover:text-slate-300 transition-colors">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${RANK_BAR_COLOR[rank]}`}
              style={{ width: `${barPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-600 mt-1">
            <span>0</span>
            {[10,20,30,40,50,60,70,80,90,100].map(v => (
              <span key={v} className={proficiency >= v ? "text-slate-500" : ""}>{v}</span>
            ))}
          </div>
        </div>

        {/* Current privilege */}
        <div className="mt-2 text-xs text-slate-400 italic truncate">
          {privilege}
        </div>
      </div>

      {/* Expanded: full rank table */}
      {expanded && (
        <div className="border-t border-slate-800 px-4 pb-4">
          <div className="mt-3 space-y-1">
            {aptidao.privileges.map((priv, i) => {
              const r = RANKS[i + 1];
              const isActive = tier === i + 1;
              return (
                <div
                  key={r}
                  className={`flex items-start gap-2 p-2 rounded-lg text-xs transition-colors ${
                    isActive
                      ? `${RANK_COLOR[r]} !bg-opacity-30`
                      : tier > i + 1
                      ? "text-slate-500"
                      : "text-slate-600"
                  }`}
                >
                  <span className={`font-bold shrink-0 w-24 ${isActive ? "" : ""}`}>{r}</span>
                  <span className="flex-1">{priv}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Penalty Info Banner ─────────────────────────────────────────────────────
export function PenaltyBanner({ penaltyTiers, itemName }: { penaltyTiers: number; itemName: string }) {
  if (penaltyTiers <= 0) return null;
  return (
    <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 rounded-xl px-3 py-2 text-xs text-red-300">
      <AlertTriangle size={14} className="shrink-0 text-red-400" />
      <span>
        <strong>{itemName}</strong>: penalidade de <strong>{penaltyTiers * 10}%</strong> nas características
        ({penaltyTiers} ranque{penaltyTiers > 1 ? "s" : ""} abaixo do requerido)
      </span>
    </div>
  );
}

// ─── Main AptidoesTab ──────────────────────────────────────────────────────────
interface AptidoesTabProps {
  aptidoes: Record<string, number>;
  setAptidoes: (val: Record<string, number>) => void;
}

type SubTab = "combate" | "extracao" | "exploracao";

export function AptidoesTab({ aptidoes, setAptidoes }: AptidoesTabProps) {
  const [subTab, setSubTab] = useState<SubTab>("combate");

  const handleChange = (name: string, val: number) => {
    setAptidoes({ ...aptidoes, [name]: val });
  };

  const listFor = (list: AptidaoData[]) =>
    list.map(ap => (
      <AptidaoCard
        key={ap.name}
        aptidao={ap}
        proficiency={aptidoes[ap.name] ?? 0}
        onChange={v => handleChange(ap.name, v)}
      />
    ));

  const subTabs: { id: SubTab; label: string; Icon: React.ComponentType<{ size?: number }>; color: string }[] = [
    { id: "combate",    label: "Combate",   Icon: Swords,   color: "text-red-400   border-red-500   bg-red-500/10"   },
    { id: "extracao",  label: "Extração",  Icon: Pickaxe,  color: "text-amber-400 border-amber-500 bg-amber-500/10" },
    { id: "exploracao",label: "Exploração",Icon: Compass,  color: "text-cyan-400  border-cyan-500  bg-cyan-500/10"  },
  ];

  return (
    <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-0">
        <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <Swords size={20} className="text-red-400" /> Aptidões
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Proficiência 0-100 · Ranque a cada 10 pontos · Penalidade: -10% por ranque abaixo do requerido
        </p>

        {/* Sub-tab bar */}
        <div className="flex gap-1 border-b border-slate-700">
          {subTabs.map(({ id, label, Icon, color }) => (
            <button
              key={id}
              onClick={() => setSubTab(id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-px ${
                subTab === id
                  ? `${color} border-current`
                  : "text-slate-500 border-transparent hover:text-slate-300"
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-3">
        {/* Penalty rule reminder */}
        <div className="flex items-start gap-2 bg-amber-900/20 border border-amber-700/40 rounded-xl px-4 py-3 text-xs text-amber-300/80 mb-4">
          <AlertTriangle size={13} className="text-amber-400 mt-0.5 shrink-0" />
          <span>
            Usar um item sem cumprir o requerimento de aptidão reduz em <strong>10% por ranque abaixo</strong> as características concedidas por ele.
          </span>
        </div>

        {subTab === "combate"    && listFor(COMBAT_APTIDOES)}
        {subTab === "extracao"  && listFor(EXTRACTION_APTIDOES)}
        {subTab === "exploracao" && listFor(EXPLORATION_APTIDOES)}
      </div>
    </div>
  );
}
