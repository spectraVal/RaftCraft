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
    const { term, leaderId } = req.body;
    const success = node.handleAppendEntries(term, leaderId);
    res.json({ success, term: node.term });
})

app.listen(PORT, () => {
    console.log(`[Node ${NODE_ID}] listening on port ${PORT}`);
});