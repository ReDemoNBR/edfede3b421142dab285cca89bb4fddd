const ms = require("ms");

const {abs, min} = Math;
const {env} = process;
let processCount = env.PROCESS_WORKERS_COUNT || "upto-4";
processCount = abs(parseInt(processCount)) || processCount;
if (processCount && typeof processCount==="string") {
    processCount = processCount.toLowerCase();
    const threads = require("os").cpus()?.length || 1; // added at least one thread because some android phones CPUs are not detected and cpus().length = 0
    if (processCount==="all") processCount = threads;
    else if (processCount.startsWith("upto-")) {
        processCount = abs(parseInt(processCount.replace("upto-", ""))) || 4;
        processCount = min(processCount, threads);
    } else processCount = min(threads, 4);
}


module.exports = Object.freeze({
    
    // DATABASE
    DB_HOST: env.PGHOST || env.POSTGRES_PORT_5432_TCP_ADDR || "localhost", // POSTGRES_PORT_5432_TCP_ADDR is the HOST from Postgres docker image
    DB_PORT: parseInt(env.PGPORT || env.DB_PORT) || 5432,
    DB_NAME: env.PGDATABASE || env.DB_NAME || "money",
    DB_USERNAME: env.PGUSER || env.DB_USERNAME || "admin",
    DB_PASSWORD: env.PGPASSWORD || env.DB_PASSWORD || "admin",
    DB_TIMEZONE: env.DB_TIMEZONE || "Etc/UTC",
    DB_MIN_CONNECTIONS: abs(parseInt(env.DB_MIN_CONNECTIONS)) || 1,
    DB_MAX_CONNECTIONS: abs(parseInt(env.DB_MAX_CONNECTIONS)) || 25,
    DB_IDLE_TIME: ms(env.DB_IDLE_TIME || "10 seconds"),
    DB_ACQUIRE_TIME: ms(env.DB_ACQUIRE_TIME || "60 seconds"),
    DB_CHECK_INTERVAL_CONNECTIONS: ms(env.DB_CHECK_INTERVAL_CONNECTIONS || "3 seconds"),
    DB_QUERY_LOGS: (env.DB_QUERY_LOGS ?? "true").trim().toLowerCase()==="true" && (arg=>console.info(arg)),

    // API SERVICE
    SERVER_API_PORT: abs(parseInt(env.SERVER_API_PORT)) || 10100,
    DEFAULT_LIMIT: abs(parseInt(env.DEFAULT_LIMIT)) || 10,
    DEFAULT_MAX_LIMIT: abs(parseInt(env.DEFAULT_MAX_LIMIT)) || 1000,
    API_HEADER_NAME: env.API_HEADER_NAME || "X-Money-Version",
    API_HEADER_VALUE: env.API_HEADER_VALUE || "0.0.1",
    MAX_REQUEST_BODY_SIZE: env.MAX_BODY_REQUEST_SIZE || "500KB",

    // PROCESS
    PROCESS_WORKERS_COUNT: processCount,
    NODE_ENV: env.NODE_ENV,
    NODE_CLUSTER_SCHED_POLICY: env.NODE_CLUSTER_SCHED_POLICY,
    PROD: env.NODE_ENV==="production",
    CLUSTER_LOG: env.CLUSTER_LOG?.trim()?.toLowerCase()==="true" ?? true
});