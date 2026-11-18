import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const appConfigUrl = pathToFileURL(
  path.join(here, '..', 'utils', 'appConfig.js')
).href;

describe('dotenv ordering for cloudServerUrl (#85)', () => {
  it('honors .env file values with no exported PORT/PARSE_MOUNT', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dotenv-order-'));
    fs.writeFileSync(
      path.join(dir, '.env'),
      'PORT=8234\nPARSE_MOUNT=/parse\n'
    );
    const env = { ...process.env };
    for (const key of [
      'PORT',
      'PARSE_MOUNT',
      'SERVER_URL',
      'PUBLIC_API_URL',
      'CLOUD_SERVER_URL'
    ]) {
      delete env[key];
    }
    const out = execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `import(${JSON.stringify(appConfigUrl)}).then(m => console.log(m.cloudServerUrl))`
      ],
      { cwd: dir, env, encoding: 'utf8' }
    ).trim();
    expect(out).toBe('http://localhost:8234/parse');
    fs.rmSync(dir, { recursive: true, force: true });
  });
});
