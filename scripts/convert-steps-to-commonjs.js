/**
 * Script to convert ES module step definitions to CommonJS format
 * This helps with Cucumber compatibility for BDD tests
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to convert import statements to require statements
function convertESModuleToCommonJS(content) {
  // Replace import statements with require statements
  let result = content.replace(/import\s+(\{[^}]+\}|\*\s+as\s+[^;]+|[^;]+)\s+from\s+['"]([^'"]+)['"]/g, (match, importPart, modulePath) => {
    if (importPart.startsWith('{')) {
      // Named imports: import { a, b, c } from 'module' -> const { a, b, c } = require('module')
      return `const ${importPart} = require('${modulePath}')`;
    } else if (importPart.startsWith('*')) {
      // Namespace imports: import * as name from 'module' -> const name = require('module')
      const name = importPart.replace(/\*\s+as\s+/, '');
      return `const ${name} = require('${modulePath}')`;
    } else {
      // Default imports: import name from 'module' -> const name = require('module')
      return `const ${importPart} = require('${modulePath}')`;
    }
  });

  // Replace export statements with module.exports
  result = result.replace(/export\s+default\s+([^;]+)/g, 'module.exports = $1');
  result = result.replace(/export\s+(\{[^}]+\})/g, 'module.exports = $1');

  return result;
}

// Function to process a file
function processFile(filePath) {
  console.log(`Processing ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  const newContent = convertESModuleToCommonJS(content);
  
  // Create a new .cjs file
  const newPath = filePath.replace(/\.jsx?$/, '.cjs');
  fs.writeFileSync(newPath, newContent);
  console.log(`Created ${newPath}`);
}

// Find all step definition files
const stepFiles = globSync(path.join(__dirname, '../tests/bdd/steps/**/*.jsx'));

// Process each file
stepFiles.forEach(processFile);

console.log('Conversion complete! You can now use these .cjs files with Cucumber.');