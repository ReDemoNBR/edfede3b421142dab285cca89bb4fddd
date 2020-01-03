const {worker} = require("cluster");
const {CLUSTER_LOG} = require("../../../env");

module.exports = (req, res, next)=>{
    if (CLUSTER_LOG) console.info(`cluster ${worker.id} (pid: ${process.pid}) responding to '${req.originalUrl}'`);
    return next();
};