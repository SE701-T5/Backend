import database from "mongoose";

/**
 * Configure and connect to MongoDB database
 * Uses environment variables:
 *  - DATABASE_USER
 *  - DATABASE_PW
 * @param databaseName the name of the database being connected to
 * @param isTestDatabase conditional for if the database in use is for testing
 */
export function connect(databaseName: string, isTestDatabase: boolean = false): Promise<typeof database> {
    // Database URI
    const databaseURI = `mongodb://localhost/uniforum`;

    // Database options
    const databaseOptions = {
        useNewUrlParser: true,
        ssl: false,
        retryWrites: true
    };

    return database.connect(databaseURI, databaseOptions);
}

/**
 * Returns database connection state
 * @param isTestDatabase conditional for if the database in use is for testing
 * @returns {ConnectionStates} 0 for disconnected, 2 for connected, 1 for connecting, 3 for disconnecting
 */
export function getState(isTestDatabase=false) {
    if (isTestDatabase) {
        return database.connection.readyState;
    } else {
        return database.connection.readyState;
    }
}

/**
 * Closes database connection
 * @param isTestDatabase conditional for if the database in use is for testing
 * @returns {Promise<void>}
 */
export function closeConn(isTestDatabase=false) {
    return database.disconnect();
}
