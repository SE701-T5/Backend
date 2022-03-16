const
    database = require('mongoose'),
    testDatabase = require('mongoose');

/**
 * Configure and connect to MongoDB database
 * Uses environment variables:
 *  - DATABASE_USER
 *  - DATABASE_PW
 * @param databaseName the name of the database being connected to
 * @param isTestDatabase conditional for if the database in use is for testing
 */
function connect(databaseName, isTestDatabase=false) {
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

    // returns testing database connection if being used for testing, otherwise normal database connection
    if (isTestDatabase) {
        return testDatabase.connect(databaseURI, databaseOptions);
    } else {
        return database.connect(databaseURI, databaseOptions);
    }
}

/**
 * Returns database connection state
 * @param isTestDatabase conditional for if the database in use is for testing
 * @returns {ConnectionStates} 0 for disconnected, 2 for connected, 1 for connecting, 3 for disconnecting
 */
function getState(isTestDatabase=false) {
    if (isTestDatabase) {
        return testDatabase.connection.readyState;
    } else {
        return database.connection.readyState;
    }
}

/**
 * Closes database connection
 * @param isTestDatabase conditional for if the database in use is for testing
 * @returns {Promise<void>}
 */
function closeConn(isTestDatabase=false) {
    return database.disconnect();
}

module.exports = { connect, getState, closeConn };
