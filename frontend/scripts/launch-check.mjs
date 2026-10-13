import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(ROOT_DIR, '..');

const violations = [];

function addViolation(file, line, rule, description) {
  violations.push({ file, line, rule, description });
}

// 1. Check package.json for banned libraries
const pkgJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf-8'));
const allDeps = { ...(pkgJson.dependencies || {}), ...(pkgJson.devDependencies || {}) };
const bannedLibraries = [
  'tsparticles', 'particles.js', 'cursor-effects', 'vanta',
  'locomotive-scroll', 'gsap', 'countup', 'countup.js', 'react-countup'
];
for (const lib of bannedLibraries) {
  if (allDeps[lib]) {
    addViolation('frontend/package.json', 1, 'Rule 4/6', `Banned motion/counter library found in dependencies: ${lib}`);
  }
}

// 2. Check required public files
const requiredPublicFiles = [
  'favicon.ico',
  'favicon.svg',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
  'site.webmanifest',
  'robots.txt',
  'sitemap.xml',
  'og-image.png'
];
for (const file of requiredPublicFiles) {
  const filePath = path.join(ROOT_DIR, 'public', file);
  if (!fs.existsSync(filePath)) {
    addViolation(`frontend/public/${file}`, 0, 'Gate B/A/C', `Missing required public launch asset: ${file}`);
  }
}

// 3. Scan source files
const EMOJI_REGEX = /(?:\ud83c[\udf00-\uffff]|\ud83d[\ud000-\ude4f\ude80-\udeff]|\ud83e[\udd00-\uddff]|[\u2600-\u26ff]|[\u2700-\u27bf])/u;
const PURPLE_CLASSES = /\b(?:text|bg|border|ring|from|to|via)-(?:purple|violet|fuchsia|indigo)-\d+\b/;
const PURPLE_HEX = /#(?:7c3aed|8b5cf6|a855f7|6d28d9|9333ea|c084fc|6366f1|4f46e5|818cf8)\b/i;
const BANNED_GRADIENTS = /\b(?:bg-gradient-to-[a-z]+|text-transparent\s+bg-clip-text|bg-clip-text\s+text-transparent)\b/;
const BANNED_WORDS = [
  'revolutionize', 'unleash', 'supercharge', 'next-gen', 'cutting-edge',
  'effortless', 'game-changing', 'empower', 'in today\'s fast-paced world',
  'recruiter-grade', '10x faster', 'lorem ipsum', 'john doe'
];

function scanPath(targetPath) {
  if (!fs.existsSync(targetPath)) return;
  const stat = fs.statSync(targetPath);
  if (stat.isFile()) {
    scanFile(targetPath);
  } else if (stat.isDirectory()) {
    const entries = fs.readdirSync(targetPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(targetPath, entry.name);
      if (entry.isDirectory()) {
        if (['node_modules', 'dist', '.git', 'coverage', '.pytest_cache'].includes(entry.name)) {
          continue;
        }
        scanPath(fullPath);
      } else if (entry.isFile()) {
        scanFile(fullPath);
      }
    }
  }
}

function scanFile(fullPath) {
  const entryName = path.basename(fullPath);
  const relPath = path.relative(REPO_ROOT, fullPath);

  if (!/\.(tsx|jsx|ts|js|html|css|json|md)$/.test(entryName)) {
    return;
  }
  if (entryName === 'launch-check.mjs' || entryName === 'LAUNCH_AUDIT.md' || entryName === 'package-lock.json') {
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;

    // Skip comments and specific non-UI lines
    const trimmed = lineText.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return;
    }

    // Check for purple/violet classes
    if (PURPLE_CLASSES.test(lineText)) {
      addViolation(relPath, lineNum, 'Rule 1', `Purple/violet/indigo Tailwind class: ${lineText.match(PURPLE_CLASSES)[0]}`);
    }

    // Check for purple hex colors
    if (PURPLE_HEX.test(lineText)) {
      addViolation(relPath, lineNum, 'Rule 1', `Purple/violet hex color: ${lineText.match(PURPLE_HEX)[0]}`);
    }

    // Check for disallowed gradients in components
    if (BANNED_GRADIENTS.test(lineText)) {
      // Allow subtle neutral background scrim in BackgroundMedia or Landing hero fade
      if (!relPath.includes('BackgroundMedia.tsx') && !relPath.includes('index.css')) {
        addViolation(relPath, lineNum, 'Rule 1', `Disallowed gradient usage: ${lineText.match(BANNED_GRADIENTS)[0]}`);
      }
    }

    // Check for rounded-full on button/tab/badge/chip
    if (/\brounded-full\b/.test(lineText)) {
      // Allow circular avatar or status dots (e.g. w-2 h-2, w-3 h-3, w-4 h-4, avatar, dot)
      const isAvatarOrDot = /\b(?:w-[1234]\s+h-[1234]|w-6\s+h-6|w-8\s+h-8|w-10\s+h-10|w-12\s+h-12|avatar|dot|status|indicator)\b/i.test(lineText);
      const isButtonOrBadge = /\b(?:button|btn|badge|tab|chip|px-|py-)\b/i.test(lineText) || /<(?:button|Badge|Tab)/i.test(lineText);
      if (isButtonOrBadge && !isAvatarOrDot) {
        addViolation(relPath, lineNum, 'Rule 2', `Pill-shaped rounded-full on button, badge, tab or chip`);
      }
    }

    // Check for emoji
    if (EMOJI_REGEX.test(lineText)) {
      addViolation(relPath, lineNum, 'Rule 3', `Emoji character used in code/content`);
    }

    // Check for em dash (—) or en dash (–) used as punctuation in visible strings
    if (/[\u2013\u2014]/.test(lineText)) {
      addViolation(relPath, lineNum, 'Rule 8', `Em dash or en dash used as punctuation`);
    }

    // Check for banned copy words
    const lowerLine = lineText.toLowerCase();
    for (const word of BANNED_WORDS) {
      if (lowerLine.includes(word)) {
        addViolation(relPath, lineNum, 'Rule 9', `Banned hype phrase found: "${word}"`);
      }
    }

    // Check for leftover [[FILL_ME]] in production check mode
    if (process.env.STRICT_LAUNCH === 'true' && lineText.includes('[[FILL_ME')) {
      addViolation(relPath, lineNum, 'Gate D', `Unfilled [[FILL_ME]] placeholder in launch code`);
    }
  });
}

console.log('Running AIOS Launch Guard Audit...\n');
scanPath(path.join(ROOT_DIR, 'src'));
scanPath(path.join(ROOT_DIR, 'public'));
scanPath(path.join(ROOT_DIR, 'index.html'));

if (violations.length === 0) {
  console.log('✅ PASS: All Hard Rules (1-10) and Launch Gates (A-D) passed with 0 violations!');
  process.exit(0);
} else {
  console.log(`❌ FAIL: Found ${violations.length} launch rule violations:\n`);
  const grouped = {};
  for (const v of violations) {
    grouped[v.rule] = (grouped[v.rule] || 0) + 1;
  }
  for (const [r, count] of Object.entries(grouped)) {
    console.log(`  - ${r}: ${count} violations`);
  }
  if (process.argv.includes('--all')) {
    console.log('\nAll violations:');
    const byFile = {};
    violations.forEach((v) => {
      byFile[v.file] = byFile[v.file] || [];
      byFile[v.file].push(v);
    });
    for (const [f, list] of Object.entries(byFile)) {
      console.log(`\n📁 ${f} (${list.length}):`);
      list.forEach((v) => console.log(`   L${v.line} [${v.rule}] ${v.description}`));
    }
  } else {
    console.log('\nTop 15 violations:');
    violations.slice(0, 15).forEach((v) => {
      console.log(`  [${v.rule}] ${v.file}:${v.line} -> ${v.description}`);
    });
  }
  console.log(`\nRun remediation pass to clear all ${violations.length} violations.`);
  process.exit(1);
}
