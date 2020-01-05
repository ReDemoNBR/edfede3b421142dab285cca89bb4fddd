# edfede3b421142dab285cca89bb4fddd


## **INTRODUCTION**
Simple PSP (Payment Service Provider)


## **SUMMARY**
-   [**Purpose**](#purpose)
-   [**Requirements**](#requirements)
-   [**Environment Variables**](#environment-variables)
-   [**Project Quirks And Tips**](#project-quirks-and-tips)
-   [**Routes Documentations**](#routes-documentations)
-   [**Running Tests**](#running-tests)
-   [**Local Development**](#local-development)


## **PURPOSE**
This project is the API server and DB manager for a generic PSP (Payment Service Provider). It provides transactions and creates
payables for the customers so they know when they can redeem the money of each transaction.


## **REQUIREMENTS**
-   GNU/Linux v5.4.7 environment
-   Bash v5.0.11
-   NodeJS v13.5.0 (with **_harmony_**)
-   NPM v6.13.4
-   PostgreSQL v12.1 (if running database locally)


## **ENVIRONMENT VARIABLES**
Below is a list environment variables this project loads. You can set it in multiple ways. In local development
it's suggested to use `export`, but in production environment one should add these variables in a file that is
loaded by Systemd service manager (file path is located in `/etc/game-pulse/env.conf`)
-   **DATABASE**:
    -   **PGHOST** or **DB_HOST**: Database host address. The system only loads `DB_HOST` if `PGHOST` is not defined. Defaults to `localhost`
    -   **PGPORT** or **DB_PORT**: Database access port. The system only loads `DB_PORT` if `PGPORT` is not set. Defaults to `5432`
    -   **PGDATABASE** or **DB_NAME**: Database name. The system only loads `DB_NAME` if `PGDATABASE` is not set. Defaults to `money`
    -   **PGUSER** or **DB_USERNAME**: Database user for authentication. The system only loads `DB_USERNAME` if `PGUSER` is not set. Defaults to `admin`
    -   **PGPASSWORD** or **DB_PASSWORD**: Database user's password for authentication. The system only loads `DB_PASSWORD` if `PGPASSWORD` is not set. Defaults to `admin`,
    -   **DB_TIMEZONE**: Database timezone for parsing DateTime values correctly. Can be any valid entry in IANA Timezone Database, moment.js or `+/-HH:MM` format. Defaults to `Etc/UTC`
    -   **DB_MIN_CONNECTIONS**: Minimum open connections to database. Defaults to `1`
    -   **DB_MAX_CONNECTIONS**: Maximum open connections to database, any exceeding connection will queue up and wait for a connection to be freed. Defaults to `25`
    -   **DB_IDLE_TIME**: Time to consider a database connection idle and allow it to be closed. Value is parsed by [ms](https://www.npmjs.com/package/ms). Defalts to `10 seconds`
    -   **DB_ACQUIRE_TIME**: Maximum time to try to acquire a database connection and throw an error. Value is parsed by [ms](https://www.npmjs.com/package/ms). Defaults to `60 seconds`
    -   **DB_CHECK_INTERVAL_CONNECTIONS**: Interval time to check and close idle database connections. Value is parsed by [ms](https://www.npmjs.com/package/ms). Defaults to `3 seconds`
    -   **DB_QUERY_LOGS**: Will print console logs with _info level_ the database queries whether the value is set to `true` or `false`. Defaults to `true`
-   **API SERVICE**:
    -   **SERVER_API_PORT**: Server API port to listen. Defaults to `10100`
    -   **DEFAULT_LIMIT**: Default value for `limit` when requesting lists of items. Defaults to `10`
    -   **DEFAULT_MAX_LIMIT**: Default maximum value for `limit` when requesting lists of items. Defaults to `1000`
    -   **API_HEADER_NAME**: Server API header name for identifying the Server API version. Defaults to `X-Money-Version`
    -   **API_HEADER_VALUE**: Server API header value for identifying the Server API version. This value should follow SemVer. Defaults to `0.0.1`
    -   **MAX_REQUEST_BODY_SIZE**: Maximum size of the request body to server. Can be any value parseable by [Bytes](https://www.npmjs.com/package/bytes). Server returns HTTP `413` if file is bigger than the limit. Defaults to `500KB`
-   **PROCESS**:
    -   **PROCESS_WORKERS_COUNT**: Number of worker processes to use in cluster, not including the master process which is only a worker manager. Setting this to a non-zero integer number `n` will force the the master process to create `n` processes independently of the number of CPU threads available. Using the prefix `upto-` will consider the number of CPU threads and will not create more than the number of CPU threads available. Setting this value to `all` will create a number of worker processes to match the number of CPU threads available. Examples: `4`, `8`, `12`, `upto-4`, `upto-12`, `all`. Defaults to `upto-4`
    -   **NODE_ENV**: Conventional environment variable to check if application is running in production environment. Set to `production` so external modules can run with better performance. Unset by default
    -   **NODE_CLUSTER_SCHED_POLICY**: Cluster scheduling policy. Valid values are `rr` (round-robin policy managed by Node) and `none` (let the operating system decide). If it is unset, Node will use the `rr` in Linux operating system. Unset by default
    -   **CLUSTER_LOG**: Will print console logs with _info level_ which worker of the cluster is taking care of the request whether the value is set to `true` or `false`. Defaults to `true`


## **PROJECT QUIRKS AND TIPS**
-   **PostgreSQL's BIGINT**: There is an override of the PGTypes (`pg` NPM package) to convert PostgreSQL's `BIGINT` (type ID `20`) to JavaScript's `BigInt` type
-   **JS BigInt Serialization**: There is a JSON replacer function in ExpressJS (`express` NPM package) to convert JavaScript's `BigInt` type to `string` type to avoid issues with `JSON.stringify` serializations
-   **Health Routes**: This project contains 2 _health check_ routes
    -   `/health/ready` returns HTTP `204` if is online. This is good if you run this project in multiple backends behind a single proxy (like a load balancer) and you need to check if the backend still available
    -   `/health/status` returns server information, like memory usage, number of CPUs, OS etc
-   **Request body treatment**: All texts from any incoming request body are trimmed and have the multiple spacing removed.
-   **Cluster Master process**: The cluster process has a master process and it doesn't listen to connections nor access the database. It only manages the other worker processes
-   **Cluster Worker processes**: The cluster process must have at least 1 worker process in order to listen to connection and access database as the master process isn't designed for this


## **ROUTES DOCUMENTATIONS**
The routes follow the RESTful API standard. It always responds with JSON (`application/json`) format. It accepts request bodies in JSON (`application/json`) and URL-Encoded (`application/x-www-form-urlencoded`).  
For the **_user_** entity, all CRUD (create, read, update and delete) operations were implemented.  
Meanwhile, the **_transaction_** entity only has `list` and `create` operations. The `update`, `patch` and `delete` operations were not implemented to avoid messing with the transaction history.

As was written in [Project Quirks And Tips](#project-quirks-and-tips), there are two routes for health checking the service in addition to the service ones, this way a load balancer works nicely with this service.


### Main routes
#### `POST /transaction`
Create a transaction

#### `GET /user/:userId/payables`
List the payables of the user

#### `GET /user/:userId`
Shows the user and the amounts of money available and pending.


## **RUNNING TESTS**
To run tests you need a local PostgreSQL database server, with a database named `money_test`, owned by user `admin` that has password `admin`. You can change the user and the password by setting environment variables.
-   A local working installation of PostgreSQL
-   A database named `money_test`
-   A database user named `admin` with password set to `admin`. _This is can be changed, but to set another user/password you need to set [environment variables](#environment-variables)_


## **LOCAL DEVELOPMENT**
To run locally, you should use `npm start` command. All [environment variables](#environment-variables) loaded are the default ones,
so please have the database already created and have it ready for connection before starting the service.
