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

// Remove generateStaticParams and dynamicParams exports
function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('generateStaticParams')) {
    console.log(`✓ Already clean: ${filePath}`);
    return;
  }
  
  // Remove the comment and export blocks
  const lines = content.split('\n');
  const cleanedLines = [];
  let skipNext = false;
  let inGenerateBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip comment line
    if (line.includes('For static export with dynamic client-side routing')) {
      continue;
    }
    
    // Start of generateStaticParams function
    if (line.includes('export function generateStaticParams()')) {
      inGenerateBlock = true;
      continue;
    }
    
    // Inside generateStaticParams function
    if (inGenerateBlock) {
      if (line.trim() === '}') {
        inGenerateBlock = false;
      }
      continue;
    }
    
    // Skip dynamicParams export
    if (line.includes('export const dynamicParams')) {
      continue;
    }
    
    // Skip empty lines that were part of the block
    if (line.trim() === '' && i > 0 && (
      lines[i-1]?.includes('generateStaticParams') || 
      lines[i-1]?.includes('dynamicParams') ||
      lines[i-1]?.includes('For static export')
    )) {
      continue;
    }
    
    cleanedLines.push(line);
  }
  
  // Remove multiple consecutive empty lines
  const finalLines = [];
  let prevEmpty = false;
  for (const line of cleanedLines) {
    if (line.trim() === '') {
      if (!prevEmpty) {
        finalLines.push(line);
        prevEmpty = true;
      }
    } else {
      finalLines.push(line);
      prevEmpty = false;
    }
  }
  
  fs.writeFileSync(filePath, finalLines.join('\n'), 'utf8');
  console.log(`✅ Cleaned: ${filePath}`);
}

// Main
const appDir = path.join(__dirname, 'app');
const dynamicRoutes = findDynamicRoutes(appDir);

console.log(`Found ${dynamicRoutes.length} dynamic route pages\n`);

dynamicRoutes.forEach(cleanFile);

console.log(`\n✅ Done!`);
