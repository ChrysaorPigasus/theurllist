# Test Profielen Handleiding

Dit document bevat instructies voor het gebruik van de verschillende testprofielen die zijn geconfigureerd voor het project.

## Beschikbare Testprofielen

In de VS Code test explorer zijn de volgende profielen beschikbaar:

1. **All Tests (Local)** - Draait alle tests (unit, api, e2e en bdd) in de lokale omgeving
2. **Unit Tests Only** - Draait alleen unit tests met Vitest
3. **API Tests Only** - Draait alleen API tests met Vitest
4. **Playwright API Tests** - Draait API tests met Playwright
5. **Playwright BDD Tests** - Draait BDD tests met Playwright
6. **Development Environment** - Draait unit tests met de dev omgevingsconfiguratie
7. **Test Environment** - Draait unit en API tests met de tst omgevingsconfiguratie
8. **Acceptance Environment** - Draait API en BDD tests met de acc omgevingsconfiguratie
9. **Force Mocks** - Draait alle tests met gemockte services
10. **Force Integrations** - Draait alle tests met echte integraties

## Hoe te gebruiken

### Via VS Code Test Explorer

1. Open de Test Explorer in VS Code (klik op het laboratorium-icoon in de zijbalk)
2. Klik op de dropdown bovenaan de Test Explorer en selecteer het gewenste profiel
3. Tests binnen dat profiel worden automatisch geladen en kunnen worden uitgevoerd

### Via Terminal Commando's

Gebruik de volgende npm scripts om tests uit te voeren via de terminal:

- `npm run test` - Draait alle tests (unit, api, e2e, bdd)
- `npm run test:fast` - Draait unit en api tests parallel
- `npm run test:local` - Draait alle tests met de lokale omgevingsconfiguratie
- `npm run test:dev` - Draait unit tests met de dev omgevingsconfiguratie
- `npm run test:tst` - Draait unit en api tests met de tst omgevingsconfiguratie
- `npm run test:acc` - Draait e2e en bdd tests met de acc omgevingsconfiguratie
- `npm run test:with-mocks` - Draait tests met geforceerde mocks
- `npm run test:with-integrations` - Draait tests met geforceerde integraties

Voor specifieke testtypen:
- `npm run test:unit` - Draait alle unit tests
- `npm run test:api` - Draait alle API tests met Vitest
- `npm run test:api:playwright` - Draait API tests met Playwright
- `npm run test:e2e` - Draait end-to-end tests
- `npm run test:bdd` - Draait behavior-driven tests

## Omgevingen configureren

De beschikbare testomgevingen zijn:

- **local** - Lokale ontwikkelomgeving (standaard)
- **dev** - Ontwikkelomgeving
- **tst** - Testomgeving
- **acc** - Acceptatieomgeving

Elke omgeving heeft zijn eigen configuratie in `tests/utils/environment.jsx`. Je kunt de standaardinstellingen voor elke omgeving daar aanpassen.

## Problemen oplossen

- **Tests worden overgeslagen**: Controleer of de juiste `TEST_TYPES` zijn ingesteld voor de geselecteerde omgeving
- **API tests falen**: Controleer of de API-server draait en beschikbaar is op de geconfigureerde URL
- **BDD tests falen**: Controleer of de applicatie draait en beschikbaar is op de geconfigureerde URL
- **Integratie vs Mocks**: Je kunt geforceerde mocks of integraties gebruiken via de speciale profielen of door `FORCE_MOCKS=true` of `FORCE_INTEGRATIONS=true` toe te voegen aan je omgevingsvariabelen

## Aangepaste configuratie

Als je specifieke testinstellingen nodig hebt die niet beschikbaar zijn in de vooraf geconfigureerde profielen, kun je:

1. Een nieuw profiel toevoegen aan `.vscode/settings.json` onder de `testing.testProfiles` key
2. Een nieuw npm script maken in `package.json` met de gewenste configuratie-opties