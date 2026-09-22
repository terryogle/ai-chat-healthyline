import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

function rollback() {
  const targetVersion = process.argv[2]?.trim();

  if (!targetVersion) {
    console.error('Usage: node scripts/rollback.js <target_version>');
    console.error('Example: node scripts/rollback.js 1.0.0');
    process.exit(1);
  }

  console.log(`[rollback] Initiating rollback of HealthyLine AI Chat Widget to v${targetVersion}...`);

  const releasesDir = path.resolve(distDir, 'releases');
  const targetReleaseDir = path.resolve(releasesDir, targetVersion);

  if (!fs.existsSync(targetReleaseDir)) {
    console.error(`\nError: Release version "${targetVersion}" was not found in ${releasesDir}.`);
    if (fs.existsSync(releasesDir)) {
      const available = fs.readdirSync(releasesDir);
      console.log(`Available cached versions: ${available.join(', ') || 'none'}\n`);
    }
    process.exit(1);
  }

  const targetJs = path.resolve(targetReleaseDir, 'widget.js');
  const targetCss = path.resolve(targetReleaseDir, 'widget.css');

  if (!fs.existsSync(targetJs) || !fs.existsSync(targetCss)) {
    console.error(`Error: Release artifacts in ${targetReleaseDir} are incomplete.`);
    process.exit(1);
  }

  // Restore root files
  fs.copyFileSync(targetJs, path.resolve(distDir, 'widget.js'));
  fs.copyFileSync(targetCss, path.resolve(distDir, 'widget.css'));

  const altJs = path.resolve(targetReleaseDir, 'tt-chat.bundle.umd.js');
  const altCss = path.resolve(targetReleaseDir, 'style.css');
  if (fs.existsSync(altJs)) fs.copyFileSync(altJs, path.resolve(distDir, 'tt-chat.bundle.umd.js'));
  if (fs.existsSync(altCss)) fs.copyFileSync(altCss, path.resolve(distDir, 'style.css'));

  console.log(`✓ Replaced dist/widget.js with v${targetVersion}`);
  console.log(`✓ Replaced dist/widget.css with v${targetVersion}`);

  // Update version.json
  const versionInfo = {
    name: 'HealthyLine AI Chat Widget',
    version: targetVersion,
    isRollback: true,
    rolledBackAt: new Date().toISOString(),
    endpoints: {
      stableJs: 'https://chat.healthyline.com/widget.js',
      stableCss: 'https://chat.healthyline.com/widget.css',
      versionedJs: `https://chat.healthyline.com/releases/${targetVersion}/widget.js`,
      versionedCss: `https://chat.healthyline.com/releases/${targetVersion}/widget.css`
    }
  };
  fs.writeFileSync(path.resolve(distDir, 'version.json'), JSON.stringify(versionInfo, null, 2), 'utf-8');

  console.log(`\n[rollback] Production assets successfully rolled back to v${targetVersion}!`);
  console.log('Deploy this dist folder or commit to GitHub to restore production.\n');
}

rollback();
