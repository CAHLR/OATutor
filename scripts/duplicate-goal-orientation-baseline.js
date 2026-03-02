#!/usr/bin/env node
/**
 * Duplicates all goalOrientationAI_* lessons to goalOrientationBaseline_*
 * (same content, IDs and labels changed to [Goal Orientation Baseline]).
 * Run from repo root: node scripts/duplicate-goal-orientation-baseline.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const CONTENT_POOL = path.join(REPO_ROOT, 'src/content-sources/oatutor/content-pool');

const OLD_PREFIX = 'goalOrientationAI';
const NEW_PREFIX = 'goalOrientationBaseline';
const OLD_LABEL = '[Goal Orientation AI]';
const NEW_LABEL = '[Goal Orientation Baseline]';

function getAllPaths(dir, base = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const paths = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.relative(base, full);
    paths.push({ full, rel, isDir: e.isDirectory() });
    if (e.isDirectory()) {
      paths.push(...getAllPaths(full, base));
    }
  }
  return paths;
}

function duplicateOne(srcDirName) {
  const srcPath = path.join(CONTENT_POOL, srcDirName);
  const destDirName = srcDirName.replace(OLD_PREFIX, NEW_PREFIX);
  const destPath = path.join(CONTENT_POOL, destDirName);

  if (fs.existsSync(destPath)) {
    console.warn(`Skip (exists): ${destDirName}`);
    return;
  }

  // 1) Copy directory tree
  execSync(`cp -R "${srcPath}" "${destPath}"`, { cwd: REPO_ROOT });

  // 2) Collect all files/dirs under dest that contain OLD_PREFIX in their name; sort deepest first
  const all = getAllPaths(destPath);
  const toRename = all
    .filter(({ rel }) => rel.includes(OLD_PREFIX))
    .sort((a, b) => b.rel.length - a.rel.length);

  for (const { full, rel } of toRename) {
    if (!fs.existsSync(full)) continue;
    const newName = path.basename(full).replace(OLD_PREFIX, NEW_PREFIX);
    const newFull = path.join(path.dirname(full), newName);
    if (full !== newFull) {
      fs.renameSync(full, newFull);
    }
  }

  // 3) Replace content in all files under dest
  const allAgain = getAllPaths(destPath);
  for (const { full } of allAgain) {
    if (allAgain.find(p => p.full === full).isDir) continue;
    try {
      let content = fs.readFileSync(full, 'utf8');
      const updated = content
        .split(OLD_PREFIX).join(NEW_PREFIX)
        .split(OLD_LABEL).join(NEW_LABEL);
      if (updated !== content) {
        fs.writeFileSync(full, updated, 'utf8');
      }
    } catch (_) {
      // Skip binary or unreadable files
    }
  }
}

function main() {
  const dirs = fs.readdirSync(CONTENT_POOL).filter((d) => {
    const p = path.join(CONTENT_POOL, d);
    return d.startsWith(OLD_PREFIX + '_') && fs.statSync(p).isDirectory();
  });

  console.log(`Found ${dirs.length} lesson(s) to duplicate.`);
  let n = 0;
  for (const d of dirs) {
    duplicateOne(d);
    n++;
    if (n % 50 === 0) console.log(`  ${n}/${dirs.length} done.`);
  }
  console.log(`Done. Created ${dirs.length} [Goal Orientation Baseline] lesson(s).`);
}

main();
