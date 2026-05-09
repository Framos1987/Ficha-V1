
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://rstgfwjzckgjdxiuqmtr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdGdmd2p6Y2tnamR4aXVxbXRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NzQ5NDgsImV4cCI6MjA5MTM1MDk0OH0.YcO4Xe0_VFeyUAs0aS41dgA8n1Jp7qoM4cMi_0TWwSo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function downloadKrassus() {
  const { data: character, error } = await supabase
    .from('characters')
    .select('*')
    .eq('name', 'Krassus')
    .single();

  if (error) {
    console.error('Error fetching Krassus:', error);
    return;
  }

  const d = character.data;
  
  // Map Supabase JSON structure to the LocalStorage export format expected by App.tsx
  const exportData = {
    rpg_attributes: JSON.stringify(d.attributes),
    rpg_char_info: JSON.stringify(d.charInfo),
    rpg_inventory: JSON.stringify(d.inventory),
    rpg_equipped_armor: JSON.stringify(d.equippedArmor),
    rpg_equipped_weapons: JSON.stringify(d.equippedWeapons),
    rpg_equipped_accessories: JSON.stringify(d.equippedAccessories),
    rpg_current_status: JSON.stringify(d.currentStatus),
    rpg_aptidoes: JSON.stringify(d.aptidoes),
    rpg_journal_notes: JSON.stringify(d.journalNotes || ""),
    rpg_has_character: "true"
  };

  const fileName = 'krassus_recuperado_19_04.rpg';
  fs.writeFileSync(fileName, JSON.stringify(exportData, null, 2));
  console.log(`Ficha de Krassus (19/04) salva em: ${fileName}`);
}

downloadKrassus();
