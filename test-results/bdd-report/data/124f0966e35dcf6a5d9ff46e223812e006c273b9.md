# Test info

- Name: BDD: publish-list
- Location: C:\projects\tests\bdd\cucumber-playwright-adapter.spec.jsx:55:5

# Error details

```
Error: Command failed: npx cross-env TEST_TYPE=bdd cucumber-js "C:\projects\tests\bdd\features\publish-list.feature" --require=C:\projects\tests\bdd\steps/**/*.jsx --require=C:\projects\tests\bdd\support/**/*.jsx --require=C:\projects\tests\bdd\pages/**/*.jsx
C:\projects\tests\bdd\steps\access-shared-list-steps.jsx:1
import React from 'react';
^^^^^^

SyntaxError: Cannot use import statement outside a module
    at internalCompileFunction (node:internal/vm:77:18)
    at wrapSafe (node:internal/modules/cjs/loader:1287:20)
    at Module._compile (node:internal/modules/cjs/loader:1339:27)
    at Module._extensions..js (node:internal/modules/cjs/loader:1434:10)
    at Module.load (node:internal/modules/cjs/loader:1206:32)
    at Module._load (node:internal/modules/cjs/loader:1022:12)
    at Module.require (node:internal/modules/cjs/loader:1234:19)
    at require (node:internal/modules/helpers:176:18)
    at C:\projects\node_modules\cucumber\lib\cli\index.js:119:42
    at Array.forEach (<anonymous>)
    at Cli.getSupportCodeLibrary (C:\projects\node_modules\cucumber\lib\cli\index.js:119:22)
    at Cli.run (C:\projects\node_modules\cucumber\lib\cli\index.js:141:37)
    at async Object.run [as default] (C:\projects\node_modules\cucumber\lib\cli\run.js:32:14)

    at C:\projects\node_modules\cucumber\lib\cli\index.js:119:42
    at Cli.getSupportCodeLibrary (C:\projects\node_modules\cucumber\lib\cli\index.js:119:22)
    at Cli.run (C:\projects\node_modules\cucumber\lib\cli\index.js:141:37)
    at async Object.run (C:\projects\node_modules\cucumber\lib\cli\run.js:32:14)
```

# Test source

```ts
   1 | import { test } from '@playwright/test';
   2 | import { exec } from 'child_process';
   3 | import fs from 'fs';
   4 | import path from 'path';
   5 | import { fileURLToPath } from 'url';
   6 | import { promisify } from 'util';
   7 |
   8 | const execAsync = promisify(exec);
   9 |
  10 | const __filename = fileURLToPath(import.meta.url);
  11 | const __dirname = path.dirname(__filename);
  12 |
  13 | /**
  14 |  * Find all feature files in a directory recursively
  15 |  */
  16 | const findFeatureFiles = (dir) => {
  17 |   let results = [];
  18 |   const list = fs.readdirSync(dir);
  19 |   
  20 |   list.forEach(file => {
  21 |     const filePath = path.join(dir, file);
  22 |     const stat = fs.statSync(filePath);
  23 |     
  24 |     if (stat.isDirectory()) {
  25 |       results = results.concat(findFeatureFiles(filePath));
  26 |     } else if (path.extname(filePath) === '.feature') {
  27 |       results.push(filePath);
  28 |     }
  29 |   });
  30 |   
  31 |   return results;
  32 | };
  33 |
  34 | const featuresDir = path.join(__dirname, 'features');
  35 | const stepsDir = path.join(__dirname, 'steps');
  36 | const supportDir = path.join(__dirname, 'support');
  37 | const pagesDir = path.join(__dirname, 'pages');
  38 |
  39 | // Ensure feature files were found
  40 | const featureFiles = findFeatureFiles(featuresDir);
  41 |
  42 | if (featureFiles.length === 0) {
  43 |   test('No feature files found', async () => {
  44 |     console.log('No feature files found in', featuresDir);
  45 |     test.fail();
  46 |   });
  47 | } else {
  48 |   console.log(`Found ${featureFiles.length} feature files`);
  49 |   
  50 |   // Dynamically create a test for each feature file
  51 |   for (const featureFile of featureFiles) {
  52 |     const relativePath = path.relative(__dirname, featureFile);
  53 |     const featureName = path.basename(featureFile, '.feature');
  54 |     
> 55 |     test(`BDD: ${featureName}`, async ({ page }) => {
     |     ^ Error: Command failed: npx cross-env TEST_TYPE=bdd cucumber-js "C:\projects\tests\bdd\features\publish-list.feature" --require=C:\projects\tests\bdd\steps/**/*.jsx --require=C:\projects\tests\bdd\support/**/*.jsx --require=C:\projects\tests\bdd\pages/**/*.jsx
  56 |       console.log(`Running Cucumber tests for: ${relativePath}`);
  57 |       try {
  58 |         // Call cucumber-js directly with explicit paths
  59 |         const command = `npx cross-env TEST_TYPE=bdd cucumber-js "${featureFile}" --require=${stepsDir}/**/*.jsx --require=${supportDir}/**/*.jsx --require=${pagesDir}/**/*.jsx`;
  60 |         console.log(`Executing: ${command}`);
  61 |         const { stdout, stderr } = await execAsync(command);
  62 |         console.log(stdout);
  63 |         if (stderr) console.error(stderr);
  64 |       } catch (error) {
  65 |         console.error(`Error running Cucumber tests: ${error.message}`);
  66 |         if (error.stdout) console.log(error.stdout);
  67 |         if (error.stderr) console.error(error.stderr);
  68 |         throw error;
  69 |       }
  70 |     });
  71 |   }
  72 | }
  73 |
```