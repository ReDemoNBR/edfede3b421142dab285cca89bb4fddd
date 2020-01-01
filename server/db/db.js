require("../override/pg-types");
const Sequelize = require("sequelize");
const env = require("../../env");

module.exports = new Sequelize({
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    dialect: "postgres",
    logging: env.DB_QUERY_LOGS,

    // benchmark: true,
    timezone: env.DB_TIMEZONE,
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    define: {
        timestamps: true,
        createdAt: "created",
        updatedAt: "updated",
        deletedAt: "deleted",
        paranoid: false,
        underscored: true,
        freezeTableName: true
    },
    pool: {
        max: env.DB_MAX_CONNECTIONS,
        min: env.DB_MIN_CONNECTIONS,
        idle: env.DB_IDLE_TIME,
        acquire: env.DB_ACQUIRE_TIME,
        evict: env.DB_INTERVAL_CHECK_CONNECTIONS
    }
});