const fs = require('fs');

try {
  let rascunho = fs.readFileSync('Rascunho', 'utf8');
  let lines = rascunho.split('\n').map(l => l.trim());
  let extractionAptidoes = [];
  let explorationAptidoes = [];
  let currentGroup = -1; 
  let currentAptidao = null;
  let currentRank = -1;
  const ranksList = ["Novato", "Aprendiz", "Iniciado", "Adepto", "Veterano", "Expert", "Virtuoso", "Sábio", "Mestre", "Grão Mestre", "Virtuose"];

  const userRequestedNames = [
     "Lenhado", "ESPOLIO",
     "Administração", "Análise", "Antropologia", "Apreciação", "Arqueologia", "Arrombamento", "Astronomia", "Avulsão", 
     "Cirurgia", "Comércio", "Direção", "Direito", "Domesticação", "Enfermagem", "Escalada", "Fuga", "Furtividade", 
     "Furto", "História", "Interrogação", "Leitura", "Licenciatura", "Medicina", "Meditação", "Montaria", "Natação",
     "Navegação", "Pilotagem", "Política", "Psicologia", "Rastreamento", "Teologia", "Ventriloquia", "Zoologia"
  ];

  for(let i=0; i < lines.length; i++) {
     let line = lines[i];
     if(!line) continue;
     if(line.includes("1-Aptidões de combate") || line === "Aptidões") { currentGroup = 0; continue; }
     if(line.includes("2-Aptidão de Extração") || line.includes("2-Aptidões de extração")) { currentGroup = 1; continue; }
     if(line.includes("Explotação") || line.includes("3-Aptidões de exploração")) { currentGroup = 2; continue; }

     if (userRequestedNames.includes(line)) {
        currentAptidao = { name: line, privileges: Array(10).fill("") };
        if (line === "Lenhado" || line === "ESPOLIO") extractionAptidoes.push(currentAptidao);
        else explorationAptidoes.push(currentAptidao);
        currentRank = -1; // reset relative rank
        continue;
     }

     if (!currentAptidao || currentGroup === 0) continue;

     let matchedRankIndex = -1;
     let matchText = "";
     for(let k=0; k<ranksList.length; k++){
        if(line.startsWith(ranksList[k])) {
            matchedRankIndex = k === 10 ? 6 : k; // Virtuose -> Virtuoso (index 6)
            matchText = ranksList[k];
            break;
        }
     }

     let content = line;
     if (matchedRankIndex !== -1) {
         currentRank = matchedRankIndex;
         content = line.substring(matchText.length).trim();
     }

     if (!content) continue;
     if (content.startsWith("Ranque") && content.includes("Privilégio")) continue;
     if (content === "Ranque Tipo Privilégio") continue;

     let parts = content.split(/\t+| {2,}/).map(s => s.trim()).filter(x => x.length > 0);
     let privs = [];
     for(let p of parts){
        if(p === "Ativo" || p === "Passivo" || p === "Híbrido") continue;
        privs.push(p);
     }

     if(privs.length > 0) {
        if (currentRank !== -1) {
            let str = privs.join(" | ");
            if (currentAptidao.privileges[currentRank] === "") {
               currentAptidao.privileges[currentRank] = str;
            } else {
               currentAptidao.privileges[currentRank] += " | " + str;
            }
        }
     }
  }

  // Fix Lenhado if some properties missed prefix 'Híbrido' and just logged empty strings
  // Wait, logging the output to verify:
  // console.log("Extraction parsed:", extractionAptidoes);
  // console.log("Exploration parsed length:", explorationAptidoes.length);

  let aptTab = fs.readFileSync('src/components/AptidoesTab.tsx', 'utf8');

  // Replace everything between const EXTRACTION_APTIDOES: AptidaoData[] = ... ;
  let extractBlock = "const EXTRACTION_APTIDOES: AptidaoData[] = " + JSON.stringify(extractionAptidoes, null, 2) + ";";
  let exploreBlock = "const EXPLORATION_APTIDOES: AptidaoData[] = " + JSON.stringify(explorationAptidoes, null, 2) + ";";

  aptTab = aptTab.replace(/const EXTRACTION_APTIDOES: AptidaoData\[\] = [\s\S]*?;/m, extractBlock);
  aptTab = aptTab.replace(/const EXPLORATION_APTIDOES: AptidaoData\[\] = [\s\S]*?;/m, exploreBlock);

  fs.writeFileSync('src/components/AptidoesTab.tsx', aptTab);
  
  console.log("SUCCESS. Exploration items found: " + explorationAptidoes.length);
} catch(e) {
  console.log("ERROR", e.message);
  console.log(e.stack);
}
