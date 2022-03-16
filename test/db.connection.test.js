const
    database = require("../config/db.server.config"),
    assert = require("assert");

/**
 * Test the database connection
 */
describe("Database connection test", function() {
    it("should connect to the database", async function() {
            const testDatabaseName = process.env.DATABASE_TEST_NAME;
            await database.closeConn(); // Disconnect from the database
            assert.equal(database.getState(), 0); // Assert database is not connected
            database.connect(testDatabaseName); // Connect to the database
            assert.equal(database.getState(), 2); // Assert database is connecting
            await database.closeConn(); // Disconnect from the database
            assert.equal(database.getState(), 0); // Assert database is not connected
            await database.connect(testDatabaseName); // Connect to the database
            assert.equal(database.getState(), 1); // Assert database is connected
            await database.closeConn(); // Disconnect from the database
            assert.equal(database.getState(), 0); // Assert database is not connected
    });
});