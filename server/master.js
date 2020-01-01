// master process that only opens and manages the worker/slave threads

const Cluster = require("cluster");

const {PROCESS_WORKERS_COUNT} = require("../env");
Cluster.on("exit", require("./cluster/exit"));
Cluster.on("fork", require("./cluster/fork"));
Cluster.on("online", require("./cluster/online"));
for (let i=0; i<PROCESS_WORKERS_COUNT; i++) Cluster.fork();

module.exports = Cluster;