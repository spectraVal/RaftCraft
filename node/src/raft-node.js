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

        // Milestone 3
        this.log = [];
        this.commitIndex = -1;
        this.lastApplied = -1;
        this.store = new Map(); // state machine hasil apply command
        this.leaderId = null;
        this.nextIndex = {}; // per peer: indext entry berikutnya yang akan dikirim
        this.matchIndex = {}; // per peer: index entry tertinggi yang telah di-acknowledge oleh peer

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
            if (result.status === 'fulfilled' && result.value) votes += 1;
        }

        const majority = Math.floor(this.peers.length / 2) + 1;
        
        if (votes >= majority && this.role === ROLES.CANDIDATE) {
            this.becomeLeader();
        } else if (this.role === ROLES.CANDIDATE) {
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
        this.leaderId = this.id;
        clearTimeout(this.electionTimer);
        console.log(`[Node ${this.id}] *** JADI LEADER untuk term ${this.term} ***`)
        
        for (const peer of this.peers) {
            this.nextIndex[peer] = this.log.length;
            this.matchIndex[peer] = -1;
        }

        this.startHeartbeat();
    }

    startHeartbeat() {
        this.hearbeatInterval = setInterval(() => {
            for (const peer of this.peers) {
                this.replicateTo(peer);
            }
        }, 50); // target interval ~50ms
    }

    async replicateTo(peer) {
        const nextIdx = this.nextIndex[peer] ?? this.log.length;
        const prevLogIndex = nextIdx - 1;
        const prevLogTerm = prevLogIndex >= 0 ? this.log[prevLogIndex].term : 0;
        const entries = this.log.slice(nextIdx);

        try {
            const response = await fetch(`http://${peer}/append-entries`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    term: this.term,
                    leaderId: this.id,
                    prevLogIndex,
                    prevLogTerm,
                    entries,
                    leaderCommit: this.commitIndex,
                }),
            });

            const data = await response.json();

            if (data.term > this.term) {
                this.term = data.term;
                this.role = ROLES.FOLLOWER;
                this.leaderId = null;
                clearInterval(this.hearbeatInterval);
                this.resetElectionTimer();
                return;
            }

            if (data.success) {
                this.matchIndex[peer] = prevLogIndex + entries.length;
                this.nextIndex[peer] = this.matchIndex[peer] + 1;
                this.updateCommitIndex();
            } else {
                this.nextIndex[peer] = Math.max(0, nextIdx - 1);
            }
        } catch (err) {}
    }

    updateCommitIndex() {
        const matchIndexes = [this.log.length -1, ...Object.values(this.matchIndex)];
        matchIndexes.sort((a, b) => b - a);
        const majorityIndex = matchIndexes[Math.floor(matchIndexes.length / 2)];

        if (
            majorityIndex > this.commitIndex &&
            majorityIndex >= 0 &&
            this.log[majorityIndex].term === this.term
        ) {
            this.commitIndex = majorityIndex;
            this.applyCommitted();
        }
    }

    applyCommitted() {
        while (this.lastApplied < this.commitIndex) {
            this.lastApplied += 1;
            const { command } = this.log[this.lastApplied];
            if (command.type === "set") {
                this.store.set(command.key, command.value);
            }
        }
    }

    handleAppendEntries(payload) {
        const { term, leaderId, prevLogIndex, prevLogTerm, entries, leaderCommit } = payload;

        if (term < this.term) {
            return { success: false, term: this.term };
        }

        this.term = term;
        this.role = ROLES.FOLLOWER;
        this.leaderId = leaderId;
        this.resetElectionTimer();

        if (prevLogIndex >= 0) {
            const prevEntry = this.log[prevLogIndex];
            if (!prevEntry || prevEntry.term !== prevLogTerm) {
                return { success: false, term: this.term };
            }
        }

        this.log = this.log.slice(0, prevLogIndex + 1).concat(entries);

        if (leaderCommit > this.commitIndex) {
            this.commitIndex = Math.min(leaderCommit, this.log.length - 1);
            this.applyCommitted();
        }

        return { success: true, term: this.term };
    }

    // Client facing
    clientSet(key, value) {
        if (this.role !== ROLES.LEADER) {
            return { success: false, message: "Not the leader", leaderId: this.leaderId };
        }
        this.log.push({ term: this.term, command: { type: "set", key, value } });
        return { success: true };
    }

    clientGet(key) {
        if (this.role !== ROLES.LEADER) {
            return { success: false, message: "Not the leader", leaderId: this.leaderId };
        }
        return { success: true, value: this.store.get(key) ?? null };
    }

    getStatus() {
        return { 
            nodeId: this.id,
            role: this.role,
            term: this.term,
            logLength: this.log.length,
            commitIndex: this.commitIndex,
            leaderId: this.leaderId,
         };
    }
}