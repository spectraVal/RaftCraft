import { Cluster } from "./cluster.js";

const cluster = new Cluster(['A', 'B', 'C']);

setInterval(() => cluster.printStatus(), 1000);