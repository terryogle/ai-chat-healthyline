import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

function run() {
  console.log('[prepare-production] Packaging HealthyLine AI Chat Widget...');

  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory not found. Please run vite build first.');
  }

  // 1. Read version from package.json
  const packageJsonPath = path.resolve(rootDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const version = packageJson.version || '1.0.0';
  console.log(`[prepare-production] Packaging version: v${version}`);

  // 2. Locate source bundles
  const sourceJs = path.resolve(distDir, 'tt-chat.bundle.umd.js');
  const sourceCss = path.resolve(distDir, 'style.css');

  if (!fs.existsSync(sourceJs)) {
    throw new Error(`Expected bundle not found: ${sourceJs}`);
  }
  if (!fs.existsSync(sourceCss)) {
    throw new Error(`Expected stylesheet not found: ${sourceCss}`);
  }

  // 3. Create stable production root files: /widget.js and /widget.css
  const targetJs = path.resolve(distDir, 'widget.js');
  const targetCss = path.resolve(distDir, 'widget.css');

  fs.copyFileSync(sourceJs, targetJs);
  fs.copyFileSync(sourceCss, targetCss);
  console.log('✓ Created dist/widget.js');
  console.log('✓ Created dist/widget.css');

  // 4. Create immutable release snapshot: /releases/<version>/...
  const releaseDir = path.resolve(distDir, 'releases', version);
  fs.mkdirSync(releaseDir, { recursive: true });

  fs.copyFileSync(sourceJs, path.resolve(releaseDir, 'widget.js'));
  fs.copyFileSync(sourceCss, path.resolve(releaseDir, 'widget.css'));
  fs.copyFileSync(sourceJs, path.resolve(releaseDir, 'tt-chat.bundle.umd.js'));
  fs.copyFileSync(sourceCss, path.resolve(releaseDir, 'style.css'));
  console.log(`✓ Created immutable release directory: dist/releases/${version}/`);

  // 5. Generate Cloudflare Pages custom _headers file
  const headersContent = `# Cloudflare Pages Headers for chat.healthyline.com
# Stable production endpoints: 5-minute cache with stale-while-revalidate for fast propagation
/widget.js
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, HEAD, OPTIONS
  Content-Type: application/javascript; charset=utf-8
  Cache-Control: public, max-age=300, stale-while-revalidate=3600

/widget.css
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, HEAD, OPTIONS
  Content-Type: text/css; charset=utf-8
  Cache-Control: public, max-age=300, stale-while-revalidate=3600

/tt-chat.bundle.umd.js
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, HEAD, OPTIONS
  Content-Type: application/javascript; charset=utf-8
  Cache-Control: public, max-age=300, stale-while-revalidate=3600

/style.css
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, HEAD, OPTIONS
  Content-Type: text/css; charset=utf-8
  Cache-Control: public, max-age=300, stale-while-revalidate=3600

# Immutable versioned releases: 1-year cache
/releases/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, HEAD, OPTIONS
  Cache-Control: public, max-age=31536000, immutable

# Assets
/assets/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, HEAD, OPTIONS
  Cache-Control: public, max-age=31536000, immutable
`;

  fs.writeFileSync(path.resolve(distDir, '_headers'), headersContent, 'utf-8');
  console.log('✓ Generated dist/_headers for Cloudflare Pages (CORS + Cache-Control)');

  // 6. Write version metadata JSON file
  const versionInfo = {
    name: 'HealthyLine AI Chat Widget',
    version,
    builtAt: new Date().toISOString(),
    endpoints: {
      stableJs: 'https://chat.healthyline.com/widget.js',
      stableCss: 'https://chat.healthyline.com/widget.css',
      versionedJs: `https://chat.healthyline.com/releases/${version}/widget.js`,
      versionedCss: `https://chat.healthyline.com/releases/${version}/widget.css`
    }
  };
  fs.writeFileSync(path.resolve(distDir, 'version.json'), JSON.stringify(versionInfo, null, 2), 'utf-8');
  console.log('✓ Generated dist/version.json');

  console.log('\n[prepare-production] Production artifacts successfully prepared in dist/!\n');
}

run();
