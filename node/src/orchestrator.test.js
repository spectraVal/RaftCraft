import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const orchestratorPath = path.join(__dirname, 'orchestrator.js');

async function getJson(url, options) {
  const res = await fetch(url, options);
  return res.json();
}

async function waitFor(conditionFn, timeoutMs = 5000, intervalMs = 100) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await conditionFn()) return true;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}

// Catatan: pastikan port 4001-4003 & 7000 tidak dipakai proses lain saat test ini jalan.
test('orchestrator dapat kill dan revive node melalui control API', async () => {
  const proc = spawn('node', [orchestratorPath]);

  try {
    const ready = await waitFor(async () => {
      try {
        const nodes = await getJson('http://localhost:7000/nodes');
        return nodes.every((n) => n.alive);
      } catch {
        return false;
      }
    });
    assert.ok(ready, 'Semua node harus alive setelah orchestrator start');

    await getJson('http://localhost:7000/kill/A', { method: 'POST' });
    const killed = await waitFor(async () => {
      const nodes = await getJson('http://localhost:7000/nodes');
      return nodes.find((n) => n.id === 'A').alive === false;
    });
    assert.ok(killed, 'Node A harus berstatus mati setelah di-kill');

    await getJson('http://localhost:7000/revive/A', { method: 'POST' });
    const revived = await waitFor(async () => {
      const nodes = await getJson('http://localhost:7000/nodes');
      return nodes.find((n) => n.id === 'A').alive === true;
    });
    assert.ok(revived, 'Node A harus berstatus hidup lagi setelah di-revive');
  } finally {
    proc.kill();
  }
});