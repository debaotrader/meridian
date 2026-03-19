#!/usr/bin/env node
/**
 * check-r3f-ssr.mjs
 * Walk .ts/.tsx files and detect R3F imports outside the allowed zone.
 * Also verifies app/office/3d/page.tsx uses dynamic(..., { ssr: false }).
 * Exit code 1 on any violation.
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join, relative } from 'path';

const ROOT = process.cwd();

// Allowed locations for R3F imports
const ALLOWED_PREFIXES = [
  'src/components/office-3d/',
  'app/office/3d/page.tsx',
];

// R3F package patterns
const R3F_IMPORT = /@react-three\/fiber|@react-three\/drei|['"]three['"]/;

// dynamic() with ssr:false pattern
const DYNAMIC_SSR_FALSE = /dynamic\s*\(.*?\bssr\s*:\s*false/s;

const violations = [];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.next', '.git', 'dist', 'build'].includes(entry.name)) continue;
      await walk(full);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      await checkFile(full);
    }
  }
}

async function checkFile(full) {
  const rel = relative(ROOT, full).replace(/\\/g, '/');
  const content = await readFile(full, 'utf-8');

  const isAllowed = ALLOWED_PREFIXES.some((p) => rel === p || rel.startsWith(p));

  if (!isAllowed && R3F_IMPORT.test(content)) {
    violations.push({
      file: rel,
      type: 'R3F_OUTSIDE_BOUNDARY',
      detail: `Importa @react-three/fiber, @react-three/drei ou three fora da zona isolada.`,
    });
  }
}

async function check() {
  await walk(ROOT);

  // Verify app/office/3d/page.tsx uses dynamic with ssr:false
  const pagePath = join(ROOT, 'app', 'office', '3d', 'page.tsx');
  try {
    const pageContent = await readFile(pagePath, 'utf-8');
    if (!DYNAMIC_SSR_FALSE.test(pageContent)) {
      violations.push({
        file: 'app/office/3d/page.tsx',
        type: 'MISSING_SSR_FALSE',
        detail: `Não usa dynamic(() => import(...), { ssr: false }). R3F vai quebrar o build SSR.`,
      });
    }
  } catch {
    violations.push({
      file: 'app/office/3d/page.tsx',
      type: 'FILE_NOT_FOUND',
      detail: `Arquivo não encontrado — criar a rota com dynamic + ssr:false antes de usar R3F.`,
    });
  }

  if (violations.length === 0) {
    console.log('✅ PASS — Nenhuma violação R3F/SSR encontrada.\n');
    process.exit(0);
  } else {
    console.log(`❌ FAIL — ${violations.length} violação(ões) encontrada(s):\n`);
    for (const v of violations) {
      console.log(`  [${v.type}] ${v.file}`);
      console.log(`  → ${v.detail}\n`);
    }
    process.exit(1);
  }
}

check();
