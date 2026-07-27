export const ROLES = { FOLLOWER: "follower", CANDIDATE: "candidate", LEADER: "leader" };

export class RaftNode {
    constructor (id, cluster) {
        this.id = id;
        this.cluster = cluster;
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

    startElection() {
        this.role = ROLES.CANDIDATE;
        this.term += 1;
        this.votedFor = this.id;
        console.log(`[Node ${this.id}] election timeout -> mulai election term ${this.term}`);

        let votes = 1; // vote untuk diri sendiri
        const peers = this.cluster.getPeersOf(this.id);

        for (const peer of peers) {
            const granted = peer.handleRequestVote(this.term, this.id);
            if (granted) votes += 1;
        }

        const majority = Math.floor(this.cluster.nodes.length / 2) + 1;
        if (votes >= majority && this.role === ROLES.CANDIDATE) {
            this.becomeLeader();
        } else {
            // split vote atau kalah
            this.role = ROLES.FOLLOWER;
            this.resetElectionTimer();
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
        this.starHeartbeat();
    }

    starHeartbeat() {
        this.hearbeatInterval = setInterval(() => {
            const peers = this.cluster.getPeersOf(this.id);
            for (const peer of peers) {
                peer.handleAppendEntries(this.term, this.id);
            }
        }, 50); // target interval ~50ms
    }

    handleAppendEntries(leaderTerm, leaderId) {
        if (leaderTerm >= this.term) {
            this.term = leaderTerm;
            this.role = ROLES.FOLLOWER;
            this.resetElectionTimer(); // heartbeat diterima -> reset timeout
        }
    }
}