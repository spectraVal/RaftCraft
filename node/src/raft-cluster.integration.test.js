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

test('cluster 3 proses terpisah berhasil memilih tepat satu leader', async () => {
  const procA = startNode('A', 5001, ['localhost:5002', 'localhost:5003']);
  const procB = startNode('B', 5002, ['localhost:5001', 'localhost:5003']);
  const procC = startNode('C', 5003, ['localhost:5001', 'localhost:5002']);

  try {
    // beri waktu proses start + election terjadi
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const statuses = await Promise.all(
      ['5001', '5002', '5003'].map((port) =>
        fetch(`http://localhost:${port}/status`).then((r) => r.json())
      )
    );

    const leaders = statuses.filter((s) => s.role === 'leader');
    assert.equal(leaders.length, 1, 'Harus ada tepat satu leader di antara 3 proses');
  } finally {
    procA.kill();
    procB.kill();
    procC.kill();
  }
});
