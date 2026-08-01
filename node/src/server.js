import express from "express";
import { RaftNode } from "./raft-node.js";

// Configure via environment variables
const NODE_ID = process.env.NODE_ID;
const PORT = process.env.PORT;
const PEERS = (process.env.PEERS || "")
    .split(",")
    .filter(Boolean);

if (!NODE_ID || !PORT) {
    console.error("NODE_ID dan PORT wajib diisi. Contoh: NODE_ID=A PORT=4001 PEERS=localhost:4002,localhost:4003 npm start");
    process.exit(1);
}

const node = new RaftNode(NODE_ID, PEERS);

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Endpoint
app.get("/ping", (req, res) => {
    res.json({ nodeId: NODE_ID, status: 'alive', timestamp: Date.now() });
});

app.get("/status", (req, res) => {
    res.json(node.getStatus());
});

app.post("/request-vote", (req, res) => {
    const { term, candidateId } = req.body;
    const voteGranted = node.handleRequestVote(term, candidateId);
    res.json({ voteGranted, term: node.term });
});

app.post("/append-entries", (req, res) => {
    const result = node.handleAppendEntries(req.body);
    res.json(result);
});

app.post("/client/set", (req, res) => {
    const { key, value } = req.body;
    res.json(node.clientSet(key, value));
});

app.get("/client/get/:key", (req, res) => {
    res.json(node.clientGet(req.params.key));
});

app.listen(PORT, () => {
    console.log(`[Node ${NODE_ID}] listening on port ${PORT}`);
});