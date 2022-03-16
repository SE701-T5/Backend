const database = require('mongoose');

/**
 * Configure and connect to MongoDB database
 * Uses environment variables:
 *  - DATABASE_USER
 *  - DATABASE_PW
 * @param databaseName the name of the database being connected to
 */
function connect(databaseName) {
    // Database URI
    const databaseURI = `mongodb://${process.env.DATABASE_USER}:${process.env.DATABASE_PW}` +
        `@uniforumcluster-shard-00-00.wvdq3.mongodb.net:27017,uniforumcluster-shard-00-01.` +
        `wvdq3.mongodb.net:27017,uniforumcluster-shard-00-02.wvdq3.mongodb.net:27017/` +
        `${databaseName}?replicaSet=atlas-13bh8b-shard-0&authSource=admin&w=majority`;

    // Database options
    const databaseOptions = {
        useNewUrlParser: true,
        ssl: true,
        retryWrites: true
    };

    return database.connect(databaseURI, databaseOptions);
}

/**
 * Retures database connection state
 * @returns {ConnectionStates} 0 for disconnected, 2 for connected, 1 for connecting, 3 for disconnecting
 */
function getState() {
    return database.connection.readyState;
}

/**
 * Closes database connection
 * @returns {Promise<void>}
 */
function closeConn() {
    return database.disconnect();
}

module.exports = { connect, getState, closeConn };
