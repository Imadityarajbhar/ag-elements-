const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('"use client"') || content.includes("'use client'")) {
    const lines = content.split('\n');
    let useClientIndex = -1;
    let useClientLine = "";
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('"use client"') || lines[i].includes("'use client'")) {
        useClientIndex = i;
        useClientLine = lines[i];
        break;
      }
    }
    
    if (useClientIndex > 0) {
      lines.splice(useClientIndex, 1);
      lines.unshift(useClientLine);
      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
      console.log("Fixed use client in", filePath);
    }
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'src'));
