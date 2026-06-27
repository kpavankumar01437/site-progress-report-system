import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const backendUrl = process.env.BACKEND_URL?.replace(/\/+$/, '');

if (!backendUrl) {
  console.error('Missing BACKEND_URL. Set it to the public URL of the Railway backend service.');
  process.exit(1);
}

const replacements = [
  {
    file: 'frontend/src/App.jsx',
    from: "const BACKEND_URL = 'http://127.0.0.1:5000';",
    to: `const BACKEND_URL = '${backendUrl}';`,
  },
  {
    file: 'frontend/src/components/Login.jsx',
    from: 'http://127.0.0.1:5000/api/auth/login',
    to: `${backendUrl}/api/auth/login`,
  },
];

for (const replacement of replacements) {
  const source = readFileSync(replacement.file, 'utf8');
  if (!source.includes(replacement.from)) {
    throw new Error(`Expected local API URL was not found in ${replacement.file}`);
  }
  writeFileSync(replacement.file, source.replace(replacement.from, replacement.to));
}

function runNpm(args) {
  if (process.platform === 'win32') {
    execFileSync('cmd.exe', ['/d', '/s', '/c', 'npm', ...args], { stdio: 'inherit' });
  } else {
    execFileSync('npm', args, { stdio: 'inherit' });
  }
}

runNpm(['ci', '--prefix', 'frontend']);
runNpm(['run', 'build', '--prefix', 'frontend']);
