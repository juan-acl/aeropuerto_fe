const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
};

// Exhaustive list of target emojis extracted from the project
const emojis = [
  '👨‍✈️', '✈️', '✈', '🏨', '🤖', '🚌', '📍', '🎁', '🏅', '📅', '🔧',
  '🏢', '🧍', '✅', '🎟️', '💎', '🔔', '⚠️', '🌅', '🌇', '⏱️', '💰',
  '👤', '⚙️', '🛍️', '🛬', '🏠', '📊', '🔐', '🌊', '🏰', '🌿', '⛪',
  '🏙️', '🌴', '🏊', '💪', '💆', '🍽️', '📶', '🅿️', '🍸', '🛎️', '🥐',
  '💼', '🛏️', '🟢', '🟡', '⏳', '🔍', '⇄', '⭐', '🌟'
];

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Build OR regex pattern
const pattern = emojis.map(escapeRegExp).join('|');
const regex = new RegExp(pattern, 'g');

const dirs = ['./app', './components', './context', './src'];
let files = [];
dirs.forEach(d => {
  if (fs.existsSync(d)) files = files.concat(walk(d));
});

let changed = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let newContent = content.replace(regex, '');
  if (content !== newContent) {
    fs.writeFileSync(f, newContent, 'utf8');
    changed++;
    console.log('Cleaned: ' + f);
  }
});

console.log(`\nSuccessfully removed emojis from ${changed} files.`);
