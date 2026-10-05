import { existsSync, mkdirSync, cpSync, rmSync } from 'node:fs';
import { execSync } from 'node:child_process';

const run = cmd => execSync(cmd, { stdio: 'inherit' });

// Capacitor should copy a clean web bundle, not the repository root (which
// eventually contains ios/android native projects and node_modules).
rmSync('www', { recursive: true, force: true });
mkdirSync('www/src', { recursive: true });
cpSync('index.html', 'www/index.html');
cpSync('src', 'www/src', { recursive: true });

if (!existsSync('ios')) run('npx cap add ios');
if (!existsSync('android')) run('npx cap add android');
run('npx cap sync');
console.log('\nGrappleRunner native projects are ready.');
