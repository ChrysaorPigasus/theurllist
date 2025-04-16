// scripts/fix-test-imports-syntax.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to fix import statements in a file
function fixImportSyntaxInFile(filePath) {
    try {
        console.log(`Processing ${filePath}`);
        
        // Read the file
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        
        // Fix quotes in imports - this handles the pattern: import X from 'path'';
        content = content.replace(/from\s+['"]([^'"]*)['"]['"];/g, "from '$1';");
        
        // Fix the pattern: import X from 'path"' - mixed quotes
        content = content.replace(/from\s+['"]([^'"]*)['"]['"];/g, "from '$1';");
        
        // Fix standalone imports with double quotes: import React from 'react'';
        content = content.replace(/import\s+(\w+)\s+from\s+['"]([^'"]*)['"]['"];/g, "import $1 from '$2';");
        
        // Fix destructured imports with double quotes: import { x } from 'y'';
        content = content.replace(/import\s+[{]\s*([^}]*)[}]\s+from\s+['"]([^'"]*)['"]['"];/g, "import { $1 } from '$2';");
        
        // Fix unterminated string literals in imports 
        content = content.replace(/from\s+['"](.*?)['"](?=;|\))/g, "from '$1'");
        
        // Converteer relatieve imports naar absolute imports met @/ syntax
        content = content.replace(
          /from\s+['"]\.\.\/\.\.\/\.\.\/src\/([^'"]*)['"]/g, 
          "from '@/$1'"
        );
        
        // Fix imports for UI components
        if (filePath.includes('/unit/ui/')) {
          content = content.replace(/import\s+(\w+)\s+from\s+['"]\.\.\/\.\.\/\.\.\/src\/components\/ui\/(\w+).*['"];?/g, 
            "import $1 from '@/components/ui/$2';");
        }
        
        // Fix imports for feature components
        if (filePath.includes('/unit/features/')) {
          content = content.replace(/import\s+[{]\s*(\w+)\s*[}]\s+from\s+['"]\.\.\/\.\.\/\.\.\/src\/components\/features\/([^'"]*)['"]/g, 
            "import { $1 } from '@/components/features/$2';");
        }
    
// Fix imports for stores
// Algemene store imports voor alle bestanden
content = content.replace(/import\s+\*\s+as\s+(\w+)\s+from\s+['"]\.\.\/\.\.\/\.\.\/src\/stores\/([^'"]*)['"];/g, 
  "import * as $1 from '@/stores/$2';");

// Specifieke store imports voor store test bestanden
if (filePath.includes('/unit/stores/')) {
  content = content.replace(/import\s+\*\s+as\s+(\w+)\s+from\s+['"]\.\.\/\.\.\/\.\.\/src\/stores\/([^'"]*)['"];/g, 
    "import * as $1 from '@/stores/$2';");
    
  // Fix specifieke store imports met andere patronen voor store tests
  content = content.replace(/import\s+[{]\s*([^}]*)[}]\s+from\s+['"]\.\.\/\.\.\/\.\.\/src\/stores\/([^'"]*)['"];/g,
    "import { $1 } from '@/stores/$2';");
}

// Fix imports for local files
// Alleen voor feature tests, anders kan het ongewenste vervangingen veroorzaken
if (filePath.includes('/unit/features/')) {
  content = content.replace(/import\s+[{]\s*(\w+)\s*[}]\s+from\s+['"]\.\/(.*)['"]/g, 
    "import { $1 } from '@/components/features/$2';");
}

    // Only write back to the file if something changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed import syntax in ${filePath}`);
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
        if (fixImportSyntaxInFile(filePath)) {
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
console.log(`Fixing import syntax in test files in: ${testsDir}`);
const updatedCount = processDirectory(testsDir);
console.log(`\nFixed import syntax in ${updatedCount} test files.`);