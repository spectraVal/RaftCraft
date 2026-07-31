export const ROLES = { FOLLOWER: "follower", CANDIDATE: "candidate", LEADER: "leader" };

export class RaftNode {
    constructor (id, peers) {
        this.id = id;
        this.peers = peers; // array "host:port"
        this.term = 0;
        this.votedFor = null;
        this.role = ROLES.FOLLOWER;
        this.electionTimer = null;
        this.hearbeatInterval = null;
        this.resetElectionTimer();
    }

    resetElectionTimer() {
        clearTimeout(this.electionTimer);
        const timeoutMs = 150 + Math.random() * 150; // 150-300ms sesuai target non-functional
        this.electionTimer = setTimeout(() => this.startElection(), timeoutMs);
    }

    async startElection() {
        this.role = ROLES.CANDIDATE;
        this.term += 1;
        this.votedFor = this.id;
        console.log(`[Node ${this.id}] election timeout -> mulai election term ${this.term}`);

        let votes = 1; // vote untuk diri sendiri
        
        const results = await Promise.allSettled(
            this.peers.map((peer) => this.requestVoteFrom(peer))
        );

        for (const result of results) {
            if (result.status === 'fulfilled' && result.value) {
                votes += 1;
            }
        }

        const majority = Math.floor(this.peers.length / 2) + 1;
        
        if (votes >= majority && this.role === ROLES.CANDIDATE) {
            this.becomeLeader();
        } else {
            this.role = ROLES.FOLLOWER;
            this.resetElectionTimer();
        }
    }

    async requestVoteFrom(peer) {
        try {
            const response = await fetch(`http://${peer}/request-vote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ term: this.term, candidateId: this.id })
            });
            const data = await response.json();
            return data.voteGranted;
        } catch (err) {
            console.error(`[Node ${this.id}] Error requesting vote from ${peer}:`, err);
            return false;
        }
    }

    handleRequestVote(candidateTerm, candidateId) {
        if (candidateTerm > this.term) {
            this.term = candidateTerm;
            this.votedFor = null;
            this.role = ROLES.FOLLOWER;
        }

        if (candidateTerm === this.term && (this.votedFor === null || this.votedFor === candidateId)) {
            this.votedFor = candidateId;
            this.resetElectionTimer();
            console.log(`[Node ${this.id}] vote GRANTED ke ${candidateId} untuk term ${candidateTerm}`);
            return true;
        }

        console.log(`[Node ${this.id}] vote REJECTED ke ${candidateId} untuk term ${candidateTerm}`);
        return false;
    }

    becomeLeader() {
        this.role = ROLES.LEADER;
        clearTimeout(this.electionTimer);
        console.log(`[Node ${this.id}] *** JADI LEADER untuk term ${this.term} ***`)
        this.startHeartbeat();
    }

    startHeartbeat() {
        this.hearbeatInterval = setInterval(() => {
            for (const peer of this.peers) {
                this.sendAppendEntriesTo(peer);
            }
        }, 50); // target interval ~50ms
    }

    async sendAppendEntriesTo(peer) {
        try {
            await fetch(`http://${peer}/append-entries`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ term: this.term, leaderId: this.id })
            });
        } catch (err) {
            console.error(`[Node ${this.id}] Error sending append entries to ${peer}:`, err);
        }
    }

    handleAppendEntries(leaderTerm, leaderId) {
        if (leaderTerm >= this.term) {
            this.term = leaderTerm;
            this.role = ROLES.FOLLOWER;
            this.resetElectionTimer(); // heartbeat diterima -> reset timeout
            return true;
        }
        return false;
    }

    getStatus() {
        return { nodeId: this.id, role: this.role, term: this.term };
    }
}