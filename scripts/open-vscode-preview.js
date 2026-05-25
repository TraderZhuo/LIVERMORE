import { spawn, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const workspace = process.cwd();
const previewUrl =
  process.argv
    .slice(2)
    .reverse()
    .find((arg) => /^https?:\/\//.test(arg)) ?? 'http://localhost:3000/';

const sourceExtensionPath = path.join(workspace, '.vscode', 'preview-opener');
const installedExtensionPath = path.join(
  homedir(),
  '.vscode',
  'extensions',
  'local.livermore-preview-opener-0.0.1',
);

function findCodeCli() {
  const candidates = [
    process.env.VSCODE_CLI,
    '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code',
    '/Applications/Visual Studio Code - Insiders.app/Contents/Resources/app/bin/code',
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  const result = spawnSync('which', ['code'], { encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : undefined;
}

async function waitForUrl(url, attempts = 40) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok || response.status < 500) {
        return;
      }
    } catch (error) {
      // Vite may still be starting. Keep this quiet so npm output stays readable.
    }

    await delay(150);
  }
}

const codeCli = findCodeCli();
const previewUri = `vscode://local.livermore-preview-opener/open?url=${encodeURIComponent(previewUrl)}`;

mkdirSync(path.dirname(installedExtensionPath), { recursive: true });
cpSync(sourceExtensionPath, installedExtensionPath, { recursive: true, force: true });

await waitForUrl(previewUrl);

if (!codeCli) {
  console.error('VSCode CLI was not found; falling back to the system browser.');
  spawn('open', [previewUrl], { detached: true, stdio: 'ignore' }).unref();
  process.exit(0);
}

const child = spawn(
  codeCli,
  ['--reuse-window', workspace, '--open-url', previewUri],
  {
    detached: true,
    env: process.env,
    stdio: 'ignore',
  },
);

child.unref();
