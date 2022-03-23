import assert from "assert";
import {connect, getState, closeConn} from "../config/db.server.config";

/**
 * Test the database connection
 */
describe("Database connection test", function() {
    it("should connect to and disconnect from the database with correct statuses", async function() {
            const testDatabaseName = process.env.DATABASE_TEST_NAME;

            await closeConn(); // Disconnect from the test database
            assert.equal(getState(), 0); // Assert test database is not connected
            await closeConn(); // Disconnect from the app database
            assert.equal(getState(), 0); // Assert app database is not connected

            connect(testDatabaseName, true); // Connect to the test database
            assert.equal(getState(), 2); // Assert test database is connecting
            await closeConn(); // Disconnect from the test database
            assert.equal(getState(), 0); // Assert test database is not connected

            await connect(testDatabaseName, true); // Connect to the test database
            assert.equal(getState(), 1); // Assert test database is connected
            await closeConn(); // Disconnect from the test database
            assert.equal(getState(), 0); // Assert test database is not connected
    });
});
