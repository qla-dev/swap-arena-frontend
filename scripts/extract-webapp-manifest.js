const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const webAppRoot = path.join(repoRoot, 'webapp');
const outputPath = path.join(__dirname, '..', 'src', 'utils', 'generatedWebappManifest.json');

const bottomNavSource = fs.readFileSync(
  path.join(webAppRoot, 'src', 'components', 'BottomNav.tsx'),
  'utf8'
);
const cssSource = fs.readFileSync(path.join(webAppRoot, 'src', 'index.css'), 'utf8');
const appSource = fs.readFileSync(path.join(webAppRoot, 'src', 'App.tsx'), 'utf8');

const viewTypeMatch = bottomNavSource.match(/export type View = ([^;]+);/);
const routeIds = Array.from(bottomNavSource.matchAll(/\{ id: '([^']+)'/g)).map(
  (match) => match[1]
);
const screenImports = Array.from(appSource.matchAll(/import \{ ([A-Za-z0-9_]+) \}/g)).map(
  (match) => match[1]
);
const cssTokens = Object.fromEntries(
  Array.from(cssSource.matchAll(/--color-([a-z-]+):\s*([^;]+);/g)).map((match) => [
    match[1],
    match[2].trim()
  ])
);

const manifest = {
  extractedAt: new Date().toISOString(),
  viewType: viewTypeMatch ? viewTypeMatch[1] : null,
  bottomNavRoutes: routeIds,
  importedScreens: screenImports,
  themeColors: cssTokens
};

fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
console.log(`Wrote manifest to ${outputPath}`);
