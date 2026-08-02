import express from 'express';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.join(__dirname, 'server.js');

const NODE_CONFIGS = {
    A: { port: 4001, peers: ['localhost:4002', 'localhost:4003'] },
    B: { port: 4002, peers: ['localhost:4001', 'localhost:4003'] },
    C: { port: 4003, peers: ['localhost:4001', 'localhost:4002'] },
};

const processes = [];

function startNode(id) {
    const config = NODE_CONFIGS[id];
    const child = spawn("node", [serverPath], {
        env: { ...process.env, NODE_ID: id, PORT: String(config.port), PEERS: config.peers.join(',') },
        stdio: "inherit",
    });
    processes[id] = child;
    child.on('exit', () => {
        if (processes[id] === child) processes[id] = null;
    });
    console.log(`[Orchestrator] Node ${id} started (pid ${child.pid})`);
};

function killNode(id) {
    const child = processes[id];
    if (child) {
        child.kill();
        processes[id] = null;
        console.log(`[Orchestrator] Node ${id} killed`);
        return true;
    }
    return false;
};

for (const id of Object.keys(NODE_CONFIGS)) {
    startNode(id);
};

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/nodes', (req, res) => {
    const list = Object.keys(NODE_CONFIGS).map((id) => ({
        id,
        port: NODE_CONFIGS[id].port,
        alive: Boolean(processes[id]),
    }));
    res.json(list);
});

app.post('/kill/:id', (req, res) => {
    const { id } = req.params;
    if (!NODE_CONFIGS[id]) return res.status(404).json({ error: 'unknown node id' });
    res.json({ success: killNode(id) });
});

app.post('/revive/:id', (req, res) => {
    const { id } = req.params;
    if (!NODE_CONFIGS[id]) return res.status(404).json({ error: 'unknown node id' });
    if (processes[id]) return res.status(400).json({ error: 'node already alive' });
    startNode(id);
    res.json({ success: true });
});

const CONTROL_PORT = 7000;
app.listen(CONTROL_PORT, () => {
    console.log(`[Orchestrator] Control API listening on port ${CONTROL_PORT}`);
});

process.on("SIGINT", () => {
    console.log('\n[Orchestrator] Shutting down all nodes...');
    for (const id of Object.keys(NODE_CONFIGS)) killNode(id);
    process.exit(0);
});