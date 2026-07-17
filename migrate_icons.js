const fs = require('fs');
const path = require('path');

const ICON_MAP = {
  'expand_more': 'ChevronDown',
  'tune': 'SlidersHorizontal',
  'chevron_left': 'ChevronLeft',
  'chevron_right': 'ChevronRight',
  'verified': 'BadgeCheck',
  'thumb_up': 'ThumbsUp',
  'thumb_down': 'ThumbsDown',
  'favorite': 'Heart',
  'workspace_premium': 'Award',
  'security': 'ShieldCheck',
  'lock': 'Lock',
  'sync_alt': 'RefreshCw',
  'local_shipping': 'Truck',
  'shopping_bag': 'ShoppingBag',
  'search': 'Search',
  'close': 'X',
  'progress_activity': 'Loader2',
  'sentiment_dissatisfied': 'Frown',
  'category': 'Grid',
  'tag': 'Tag',
  'arrow_forward': 'ArrowRight',
  'local_fire_department': 'Flame',
  'remove_shopping_cart': 'ShoppingCart', 
  'add_shopping_cart': 'ShoppingCart',
  'check_circle': 'CheckCircle2',
  'local_offer': 'Tag',
  'error': 'AlertCircle',
  'bolt': 'Zap',
  'shopping_cart_checkout': 'ShoppingCart',
  'call': 'Phone',
  'mail': 'Mail',
  'location_on': 'MapPin',
  'camera': 'Camera',
  'play_circle': 'PlayCircle',
  'history': 'History',
  'menu': 'Menu',
  'account_circle': 'User',
  'star': 'Star',
  'share': 'Share2',
  'info': 'Info',
  'check': 'Check',
  'delete': 'Trash2',
  'edit': 'Edit2',
  'add': 'Plus',
  'remove': 'Minus',
  'visibility': 'Eye',
  'visibility_off': 'EyeOff',
  'arrow_back': 'ArrowLeft',
  'logout': 'LogOut',
  'login': 'LogIn',
  'person': 'User',
  'home': 'Home',
  'settings': 'Settings',
  'help': 'HelpCircle',
  'language': 'Globe',
  'dark_mode': 'Moon',
  'light_mode': 'Sun',
  'more_vert': 'MoreVertical',
  'more_horiz': 'MoreHorizontal',
  'filter_list': 'Filter',
  'sort': 'ArrowUpDown',
  'list': 'List',
  'grid_view': 'Grid',
  'sync': 'RefreshCw',
  'check_box': 'CheckSquare',
  'check_box_outline_blank': 'Square',
  'radio_button_checked': 'CircleDot',
  'radio_button_unchecked': 'Circle'
};

const regex = /<span[^>]*className=(?:\{cn\([^)]*['"]([^'"]*)['"][^)]*\)|["']([^"']+)["'])[^>]*>(.*?)<\/span>/gs;
const simpleRegex = /<span[^>]*className=["']([^"']*)["'][^>]*>(.*?)<\/span>/gs;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // A safer regex replacement logic
  const matches = [...content.matchAll(/<span[^>]*material-symbols-outlined[^>]*>(.*?)<\/span>/gs)];
  if (matches.length === 0) return;

  let iconsUsed = new Set();
  
  // Replace simple static strings first
  for (let match of matches) {
    const fullMatch = match[0];
    const iconName = match[1].trim();
    
    // Ignore if it contains JSX expressions
    if (iconName.includes('{')) continue;

    let mappedIcon = ICON_MAP[iconName] || iconName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    
    if (mappedIcon) {
      iconsUsed.add(mappedIcon);
      
      let classNames = "";
      const classMatch = fullMatch.match(/className=["']([^"']+)["']/);
      if (classMatch) {
         classNames = classMatch[1].replace('material-symbols-outlined', '').trim();
      }
      
      const cnMatch = fullMatch.match(/className=\{cn\(\s*["']([^"']+)["']\s*,\s*([^)]+)\)\}/);
      let cnStr = "";
      if (cnMatch) {
          const stripped = cnMatch[1].replace('material-symbols-outlined', '').trim();
          cnStr = `className={cn("${stripped}", ${cnMatch[2]})}`;
      } else if (classNames) {
          cnStr = `className="${classNames}"`;
      }

      let newJSX = `<${mappedIcon} ${cnStr} />`;
      content = content.replace(fullMatch, newJSX);
    }
  }

  if (iconsUsed.size > 0 && content !== originalContent) {
    const imports = Array.from(iconsUsed).join(', ');
    const importStatement = `import { ${imports} } from 'lucide-react';\n`;
    content = importStatement + content;
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
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
console.log("Done migrating icons.");
