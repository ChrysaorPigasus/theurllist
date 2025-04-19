/**
 * Script om alle imports van 'backup-files/world' te wijzigen naar '@tests/bdd/support/world.cjs'
 * 
 * Dit script doorzoekt alle bestanden in de tests/bdd/steps map en vervangt
 * import statements die verwijzen naar 'backup-files/world' door een verwijzing
 * naar '@tests/bdd/support/world.cjs'.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuratie
const searchPattern = 'tests/bdd/steps/**/*.{js,jsx,ts,tsx}';
const oldImport = /from\s+['"]backup-files\/world['"]/g;
const newImport = "from '@tests/bdd/support/world.cjs'";

// Functie om een bestand aan te passen
function updateFile(filePath) {
  console.log(`Checking file: ${filePath}`);
  
  try {
    // Lees het bestand
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Controleer of het bestand de oude import bevat
    if (oldImport.test(content)) {
      // Reset de regex index
      oldImport.lastIndex = 0;
      
      // Vervang alle instanties van de oude import
      const updatedContent = content.replace(oldImport, newImport);
      
      // Schrijf het bijgewerkte bestand
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      
      console.log(`✅ Updated import in: ${filePath}`);
      return true; // Bestand is bijgewerkt
    } else {
      console.log(`ℹ️ No import from 'backup-files/world' found in: ${filePath}`);
      return false; // Geen wijzigingen
    }
  } catch (error) {
    console.error(`❌ Error processing file ${filePath}:`, error);
    return false;
  }
}

// Functie om meerdere bestanden aan te passen
async function updateAllFiles() {
  // Zoek alle bestanden die matchen met het patroon
  const files = glob.sync(searchPattern, { nodir: true });
  
  console.log(`Found ${files.length} files to check.`);
  
  let updatedCount = 0;
  
  // Verwerk elk bestand
  for (const file of files) {
    const wasUpdated = updateFile(file);
    if (wasUpdated) {
      updatedCount++;
    }
  }
  
  console.log(`\n✅ Finished processing ${files.length} files.`);
  console.log(`✅ Updated imports in ${updatedCount} files.`);
  
  if (updatedCount === 0) {
    console.log('⚠️ No files were updated. Make sure the search pattern is correct.');
  }
}

// Voer het script uit
updateAllFiles();