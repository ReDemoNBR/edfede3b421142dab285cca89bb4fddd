const Cluster = require("cluster");

if (Cluster.isMaster) require("./master"); // opens and manages multiple threads of the worker
else require("./worker");

module.exports = Cluster;