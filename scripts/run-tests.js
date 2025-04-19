#!/usr/bin/env node

/**
 * Test Runner Script
 * 
 * Dit script biedt een eenvoudige interface voor het uitvoeren van verschillende
 * testprofielen, onafhankelijk van de VS Code Test Explorer.
 */

const { execSync } = require('child_process');
const readline = require('readline');

// Configuratie van de beschikbare testprofielen
const TEST_PROFILES = [
  {
    name: "Unit Tests (Local)",
    command: "npm run test:unit",
    description: "Voert unit tests uit in lokale omgeving"
  },
  {
    name: "API Tests (Local)",
    command: "npm run test:api",
    description: "Voert API tests uit in lokale omgeving"
  },
  {
    name: "BDD Tests (Playwright)",
    command: "npm run test:bdd:playwright",
    description: "Voert BDD tests uit met Playwright"
  },
  {
    name: "E2E Tests",
    command: "npm run test:e2e",
    description: "Voert end-to-end tests uit"
  },
  {
    name: "Development Environment",
    command: "npm run test:dev",
    description: "Voert tests uit in development omgeving"
  },
  {
    name: "Test Environment",
    command: "npm run test:tst",
    description: "Voert tests uit in test omgeving"
  },
  {
    name: "Acceptance Environment",
    command: "npm run test:acc",
    description: "Voert tests uit in acceptance omgeving"
  },
  {
    name: "With Mocks",
    command: "npm run test:with-mocks",
    description: "Voert tests uit met gemockte services"
  },
  {
    name: "With Integrations",
    command: "npm run test:with-integrations",
    description: "Voert tests uit met echte integraties"
  },
  {
    name: "Orchestrated Tests (Parallel)",
    command: "npm run test:orchestrate:parallel",
    description: "Voert tests uit met parallelle orchestratie"
  }
];

// Terminal interface instellingen
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Kleur codes voor terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m"
};

// Helper functie om clear screen uit te voeren
function clearScreen() {
  process.stdout.write('\x1Bc');
}

// Toon het hoofdmenu
function showMenu() {
  clearScreen();
  console.log(`${colors.bright}${colors.cyan}╔═════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║                 🧪  TESTPROFIELEN MENU  🧪                 ║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}╚═════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log('');
  
  // Toon alle beschikbare profielen
  TEST_PROFILES.forEach((profile, index) => {
    console.log(`  ${colors.green}${index + 1}${colors.reset}. ${colors.bright}${profile.name}${colors.reset}`);
    console.log(`     ${colors.dim}${profile.description}${colors.reset}`);
  });
  
  console.log('');
  console.log(`  ${colors.red}0${colors.reset}. ${colors.bright}Afsluiten${colors.reset}`);
  console.log('');
  
  rl.question(`${colors.yellow}Kies een testprofiel (1-${TEST_PROFILES.length}) of 0 om af te sluiten: ${colors.reset}`, (answer) => {
    handleMenuChoice(answer);
  });
}

// Verwerk de gebruikersinvoer
function handleMenuChoice(choice) {
  const index = parseInt(choice, 10) - 1;
  
  if (choice === '0') {
    console.log(`${colors.bright}${colors.yellow}Tot ziens!${colors.reset}`);
    rl.close();
    return;
  }
  
  if (isNaN(index) || index < 0 || index >= TEST_PROFILES.length) {
    console.log(`${colors.red}Ongeldige keuze. Probeer opnieuw.${colors.reset}`);
    setTimeout(() => {
      showMenu();
    }, 1500);
    return;
  }
  
  const selectedProfile = TEST_PROFILES[index];
  runTests(selectedProfile);
}

// Voer de geselecteerde tests uit
function runTests(profile) {
  clearScreen();
  console.log(`${colors.bright}${colors.green}╔═════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.green}║                      TESTS UITVOEREN                        ║${colors.reset}`);
  console.log(`${colors.bright}${colors.green}╚═════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log('');
  console.log(`${colors.bright}Profiel: ${colors.cyan}${profile.name}${colors.reset}`);
  console.log(`${colors.dim}Commando: ${profile.command}${colors.reset}`);
  console.log('');
  console.log(`${colors.yellow}Tests worden uitgevoerd, even geduld...${colors.reset}`);
  console.log('');
  
  try {
    // Voer het testcommando uit
    execSync(profile.command, { stdio: 'inherit' });
    
    console.log('');
    console.log(`${colors.green}Tests voltooid!${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Er is een fout opgetreden bij het uitvoeren van de tests:${colors.reset}`);
    console.error(error.message);
  }
  
  console.log('');
  rl.question(`${colors.yellow}Druk op Enter om terug te gaan naar het menu...${colors.reset}`, () => {
    showMenu();
  });
}

// Start het programma
showMenu();