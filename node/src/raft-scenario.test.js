import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.join(__dirname, 'server.js');

function startNode(id, port, peers) {
  return spawn('node', [serverPath], {
    env: { ...process.env, NODE_ID: id, PORT: String(port), PEERS: peers.join(',') },
  });
}

async function getStatus(port) {
  const res = await fetch(`http://localhost:${port}/status`);
  return res.json();
}

async function findLeaderPort(ports, timeoutMs = 5000, intervalMs = 100) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    for (const port of ports) {
      try {
        const status = await getStatus(port);
        if (status.role === 'leader') return port;
      } catch {
        // belum siap / mati -> retry
      }
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return null;
}

// Poll sampai commitIndex leader bertambah, bukan fixed delay 500ms.
async function waitForCommit(port, minCommitIndex, timeoutMs = 3000, intervalMs = 100) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const status = await getStatus(port);
      if (status.commitIndex >= minCommitIndex) return true;
    } catch {
      // ignore, retry
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}

test('data yang sudah committed tetap konsisten setelah leader mati dan re-election', async () => {
  const ports = [6001, 6002, 6003];
  const procs = {
    A: startNode('A', 6001, ['localhost:6002', 'localhost:6003']),
    B: startNode('B', 6002, ['localhost:6001', 'localhost:6003']),
    C: startNode('C', 6003, ['localhost:6001', 'localhost:6002']),
  };

  try {
    const leaderPort = await findLeaderPort(ports, 5000);
    assert.ok(leaderPort, 'Harus ada leader sebelum test lanjut');

    await fetch(`http://localhost:${leaderPort}/client/set`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'foo', value: 'bar' }),
    });

    const committed = await waitForCommit(leaderPort, 0, 3000);
    assert.ok(committed, 'Write harus ter-commit dalam 3 detik');

    const leaderId = leaderPort === 6001 ? 'A' : leaderPort === 6002 ? 'B' : 'C';
    procs[leaderId].kill();

    const remainingPorts = ports.filter((p) => p !== leaderPort);
    const newLeaderPort = await findLeaderPort(remainingPorts, 5000);
    assert.ok(newLeaderPort, 'Harus ada leader baru setelah leader lama mati');
    assert.notEqual(newLeaderPort, leaderPort, 'Leader baru harus berbeda dari leader lama');

    const getResult = await fetch(`http://localhost:${newLeaderPort}/client/get/foo`).then((r) => r.json());
    assert.equal(getResult.value, 'bar', 'Data yang sudah committed harus tetap ada di leader baru');
  } finally {
    for (const proc of Object.values(procs)) proc.kill();
  }
});