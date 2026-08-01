import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.join(__dirname, "server.js");

function startNode(id, port, peers) {
    return spawn("node", [serverPath], {
        env: {
            ...process.env,
            NODE_ID: id,
            PORT: String(port),
            PEERS: peers.join(",")
        },
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
        // proses belum siap atau mati -> coba port lain / retry
      }
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return null;
}

test('cluster 3 proses terpisah berhasil memilih tepat satu leader', async () => {
  const procA = startNode('A', 5001, ['localhost:5002', 'localhost:5003']);
  const procB = startNode('B', 5002, ['localhost:5001', 'localhost:5003']);
  const procC = startNode('C', 5003, ['localhost:5001', 'localhost:5002']);

  try {
    const leaderPort = await findLeaderPort([5001, 5002, 5003], 5000);
    assert.ok(leaderPort, 'Harus ada leader dalam 5 detik');

    const statuses = await Promise.all(
      [5001, 5002, 5003].map((port) => getStatus(port).catch(() => null))
    );
    const leaders = statuses.filter((s) => s?.role === 'leader');
    assert.equal(leaders.length, 1, 'Harus ada tepat satu leader di antara 3 proses');
  } finally {
    procA.kill();
    procB.kill();
    procC.kill();
  }
});
