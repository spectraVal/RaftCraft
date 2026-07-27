import { RaftNode } from "./raft-node.js";

export class Cluster {
    constructor(nodeIds) {
        this.nodes = nodeIds.map((id) => new RaftNode(id, this));
    }

    getPeersOf(id) {
        return this.nodes.filter((n) => n.id !== id);
    }

    printStatus() {
        console.log("STATUS CLUSTER")
        for (const node of this.nodes) {
            console.log(`Node ${node.id}: role=${node.role} term=${node.term}`);
        }
    }
}