import { useEffect, useState } from 'react';
import './App.css';

const NODES = [
  { id: 'A', url: 'http://localhost:4001' },
  { id: 'B', url: 'http://localhost:4002' },
  { id: 'C', url: 'http://localhost:4003' },
];

const ROLE_COLORS = {
  leader: '#2ecc71',
  candidate: '#f1c40f',
  follower: '#3498db',
  unreachable: '#7f8c8d',
};

function useClusterStatus(pollIntervalMs = 1000) {
  const [statuses, setStatuses] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function pollOnce() {
      const results = await Promise.all(
        NODES.map(async (node) => {
          try {
            const res = await fetch(`${node.url}/status`);
            const data = await res.json();
            return [node.id, { ...data, reachable: true }];
          } catch {
            return [node.id, { nodeId: node.id, role: 'unreachable', reachable: false }];
          }
        })
      );
      if (!cancelled) setStatuses(Object.fromEntries(results));
    }

    pollOnce();
    const interval = setInterval(pollOnce, pollIntervalMs);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pollIntervalMs]);

  return statuses;
}

function NodeCard({ status }) {
  const role = status?.role ?? 'unreachable';
  const color = ROLE_COLORS[role] ?? ROLE_COLORS.unreachable;

  return (
    <div className="node-card" style={{ borderColor: color }}>
      <h2 style={{ color }}>{status?.nodeId ?? '?'}</h2>
      <p><strong>Role:</strong> {role}</p>
      <p><strong>Term:</strong> {status?.term ?? '-'}</p>
      <p><strong>Log Length:</strong> {status?.logLength ?? '-'}</p>
      <p><strong>Commit Index:</strong> {status?.commitIndex ?? '-'}</p>
      <p><strong>Known Leader:</strong> {status?.leaderId ?? '-'}</p>
    </div>
  );
}

function App() {
  const statuses = useClusterStatus(1000);

  return (
    <div className="dashboard">
      <h1>Raft Cluster Dashboard</h1>
      <div className="node-grid">
        {NODES.map((node) => (
          <NodeCard key={node.id} status={statuses[node.id]} />
        ))}
      </div>
    </div>
  );
}

export default App;