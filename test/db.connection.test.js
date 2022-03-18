const
    { connect, getState, closeConn } = require("../config/db.server.config"),
    assert = require("assert");

/**
 * Test the database connection
 */
describe("Database connection test", function() {
    it("should connect to and disconnect from the database with correct statuses", async function() {
            const testDatabaseName = process.env.DATABASE_TEST_NAME;

            await closeConn(true); // Disconnect from the test database
            assert.equal(getState(true), 0); // Assert test database is not connected
            await closeConn(); // Disconnect from the app database
            assert.equal(getState(), 0); // Assert app database is not connected

            connect(testDatabaseName, true); // Connect to the test database
            assert.equal(getState(true), 2); // Assert test database is connecting
            await closeConn(true); // Disconnect from the test database
            assert.equal(getState(true), 0); // Assert test database is not connected

            await connect(testDatabaseName, true); // Connect to the test database
            assert.equal(getState(true), 1); // Assert test database is connected
            await closeConn(true); // Disconnect from the test database
            assert.equal(getState(true), 0); // Assert test database is not connected
    });
});
