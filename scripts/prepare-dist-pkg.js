// Generate a minimal package.json inside dist/ for "npm pack dist" use.
// It mirrors key metadata and fixes entry points relative to dist as the package root.
const fs = require('fs');
const path = require('path');

const rootDir = __dirname ? path.resolve(__dirname, '..') : process.cwd();
const distDir = path.join(rootDir, 'dist');

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function writeJSON(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

function main() {
  const rootPkgPath = path.join(rootDir, 'package.json');
  if (!fs.existsSync(rootPkgPath)) {
    console.error('prepare-dist-pkg: root package.json not found');
    process.exit(1);
  }
  if (!fs.existsSync(distDir)) {
    console.error('prepare-dist-pkg: dist directory not found. Did you run build?');
    process.exit(1);
  }

  const rootPkg = readJSON(rootPkgPath);

  // Minimal package.json for the dist package root
  const distPkg = {
    name: rootPkg.name,
    version: rootPkg.version,
    description: rootPkg.description,
    license: rootPkg.license,
    // Entry points relative to dist being the root
    main: 'index.js',
    types: 'index.d.ts',
    // Keep helpful metadata
    repository: rootPkg.repository,
    keywords: rootPkg.keywords,
    homepage: rootPkg.homepage,
    bugs: rootPkg.bugs,
    // Avoid lifecycle scripts in dist to prevent builds when packing inside dist
    // dependencies are usually empty for libs compiled to JS
  };

  // Optionally include exports if present and simple
  if (rootPkg.exports && typeof rootPkg.exports === 'string') {
    distPkg.exports = './index.js';
  }

  // Ensure the dist package contains a minimal files whitelist if desired
  // Not necessary, but harmless
  distPkg.files = [
    '*',
    'lib/**'
  ];

  const distPkgPath = path.join(distDir, 'package.json');
  writeJSON(distPkgPath, distPkg);

  // Optionally copy README and LICENSE if present so "npm pack dist" includes them
  for (const fname of ['README.md', 'LICENSE', 'LICENSE.md']) {
    const src = path.join(rootDir, fname);
    const dest = path.join(distDir, fname);
    if (fs.existsSync(src)) {
      try {
        fs.copyFileSync(src, dest);
      } catch (e) {
        // best-effort copy, non-fatal
      }
    }
  }
  console.log('prepare-dist-pkg: wrote', path.relative(rootDir, distPkgPath));
}

main();
