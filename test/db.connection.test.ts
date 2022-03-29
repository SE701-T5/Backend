import assert from 'assert';
import { connect, getState, closeConn } from '../config/db.server.config';

describe('Database', () => {
  it('Connection statuses', async () => {
    await closeConn(); // Disconnect from the test database
    assert.equal(getState(), 0); // Assert test database is not connected
    await closeConn(); // Disconnect from the app database
    assert.equal(getState(), 0); // Assert app database is not connected

    connect(); // Connect to the test database
    assert.equal(getState(), 2); // Assert test database is connecting
    await closeConn(); // Disconnect from the test database
    assert.equal(getState(), 0); // Assert test database is not connected

    await connect(); // Connect to the test database
    assert.equal(getState(), 1); // Assert test database is connected
    await closeConn(); // Disconnect from the test database
    assert.equal(getState(), 0); // Assert test database is not connected
  });
});
