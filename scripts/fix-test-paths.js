// scripts/fix-test-paths.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to update import paths in a file
function updateImportsInFile(filePath) {
  try {
    console.log(`Processing ${filePath}`);
    
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Fix imports using ../../src/ pattern to point to the correct relative paths
    content = content.replace(/from ['"]\.\.\/\.\.\/src\//g, 'from \'../../../src/');
    
    // Fix imports for components
    if (filePath.includes('/unit/features/') || filePath.includes('/unit/ui/')) {
      // Fix relative component imports
      content = content.replace(/from ['"]\.\/([^'"]+)['"]/g, (match, componentName) => {
        const dir = path.dirname(filePath);
        const relPath = path.relative(dir, 'src/components').replace(/\\/g, '/');
        
        // Extract category from the path
        let category = '';
        if (filePath.includes('/unit/features/')) {
          category = 'features/';
          // Extract subcategory from the path
          if (filePath.includes('/list-management/')) {
            category += 'list-management/';
          } else if (filePath.includes('/sharing/')) {
            category += 'sharing/';
          } else if (filePath.includes('/url-management/')) {
            category += 'url-management/';
          }
        } else if (filePath.includes('/unit/ui/')) {
          category = 'ui/';
        }
        
        return `from '${relPath}/${category}${componentName}'`;
      });
    }
    
    // Fix store imports
    if (filePath.includes('/unit/stores/')) {
      // Fix relative store imports
      content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/stores\//g, 'from \'../../../src/stores/');
    }
    
    // Fix imports for API tests
    if (filePath.includes('/api/')) {
      content = content.replace(/from ['"]\.\/([^'"]+)['"]/g, (match, apiPath) => {
        return `from '../../src/pages/api/${apiPath}'`;
      });
    }
    
    // Only write back to the file if something changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated imports in ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

// Process all test files in a directory recursively
function processDirectory(dir) {
  let updatedCount = 0;
  
  function traverseDir(currentPath) {
    const files = fs.readdirSync(currentPath);
    
    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        traverseDir(filePath);
      } else if (file.endsWith('.test.js') || file.endsWith('.test.jsx') || file.endsWith('.test.ts') || file.endsWith('.test.tsx')) {
        if (updateImportsInFile(filePath)) {
          updatedCount++;
        }
      }
    }
  }
  
  traverseDir(dir);
  return updatedCount;
}

// Main execution
const projectRoot = path.resolve(path.join(__dirname, '..'));
const testsDir = path.join(projectRoot, 'tests');
console.log(`Fixing test import paths in: ${testsDir}`);
const updatedCount = processDirectory(testsDir);
console.log(`\nFixed import paths in ${updatedCount} test files.`);