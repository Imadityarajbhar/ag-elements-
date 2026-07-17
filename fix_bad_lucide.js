const fs = require('fs');
const path = require('path');

const BAD_TO_GOOD = {
  'Schedule': 'Clock',
  'CameraAlt': 'Camera',
  'SearchOff': 'SearchX',
  'DeleteForever': 'Trash2',
  'ReceiptLong': 'Receipt',
  'MarkEmailRead': 'MailCheck',
  'NotificationsActive': 'BellRing',
  'FavoriteBorder': 'Heart',
  'Chat': 'MessageCircle',
  'AllInclusive': 'Infinity',
  'AutoAwesome': 'Wand2',
  'DesignServices': 'PenTool',
  'Handshake': 'Handshake',
  'FeaturedSeasonalAndGifts': 'Gift',
  'Inventory2': 'Package',
  'Loyalty': 'Award',
  'Redeem': 'Gift'
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const [bad, good] of Object.entries(BAD_TO_GOOD)) {
    // Replace in imports
    const importRegex = new RegExp(`\\b${bad}\\b`, 'g');
    if (content.includes(`import {`) && content.includes(bad)) {
      content = content.replace(importRegex, good);
    }
    // Replace in JSX components
    const jsxRegex = new RegExp(`<${bad}\\b`, 'g');
    content = content.replace(jsxRegex, `<${good}`);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed bad imports in ${filePath}`);
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
