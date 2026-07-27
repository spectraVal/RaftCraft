import express from "express";

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

const app = express();
app.use(express.json());

// Endpoint
app.get("/ping", (req, res) => {
    res.json({ nodeId: NODE_ID, status: 'alive', timestamp: Date.now() });
});

app.listen(PORT, () => {
    console.log(`[Node ${NODE_ID}] listening on port ${PORT}`);
    startPingingPeers();
});

// Function to ping peers
function startPingingPeers() {
    setInterval(async () => {
        for (const peer of PEERS) {
            try {
                const response = await fetch(`http://${peer}/ping`);
                const data = await response.json();
                console.log(`[Node ${NODE_ID}] -> peer ${peer} respond: node ${data.nodeId} is ${data.status}`);
            } catch (err) {
                console.log(`[Node ${NODE_ID}] -> peer ${peer} UNREACHABLE (${err.message})`);
            }
        }
    }, 2000); // Ping every 2 seconds
}