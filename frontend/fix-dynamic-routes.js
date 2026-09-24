const fs = require('fs');
const path = require('path');

// Find all page.tsx files in directories with [] in the name
function findDynamicRoutes(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (item.includes('node_modules') || item.includes('.next')) continue;
      findDynamicRoutes(fullPath, files);
    } else if (item === 'page.tsx') {
      // Check if any parent directory has []
      if (fullPath.includes('[') && fullPath.includes(']')) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

// Add generateStaticParams if it doesn't exist
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if already has generateStaticParams
  if (content.includes('generateStaticParams')) {
    console.log(`✓ Already fixed: ${filePath}`);
    return;
  }
  
  // Check if it's a 'use client' component
  if (!content.startsWith("'use client'") && !content.startsWith('"use client"')) {
    console.log(`⚠ Skipped (not client component): ${filePath}`);
    return;
  }
  
  // Add generateStaticParams after the first import block
  const lines = content.split('\n');
  let insertIndex = -1;
  
  // Find the end of the first import block
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('import ') || line === '' || line.startsWith('//')) {
      continue;
    } else {
      insertIndex = i;
      break;
    }
  }
  
  if (insertIndex > 0) {
    const newLines = [
      '',
      '// For static export with dynamic client-side routing',
      'export function generateStaticParams() {',
      '  return [];',
      '}',
      'export const dynamicParams = true;',
      ''
    ];
    
    lines.splice(insertIndex, 0, ...newLines);
    content = lines.join('\n');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  } else {
    console.log(`⚠ Could not find insert point: ${filePath}`);
  }
}

// Main
const appDir = path.join(__dirname, 'app');
const dynamicRoutes = findDynamicRoutes(appDir);

console.log(`Found ${dynamicRoutes.length} dynamic route pages\n`);
console.log('Files found:');
dynamicRoutes.forEach(f => console.log(`  ${f}`));
console.log('');

dynamicRoutes.forEach(fixFile);

console.log(`\n✅ Done!`);
