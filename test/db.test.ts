import request from 'supertest';
import app from '../server';
import { closeConn, connect, getState } from '../config/db.server.config';
import { StatusCodes } from 'http-status-codes';
import { expect } from 'chai';

describe('Database', () => {
  // beforeEach(async () => {
  //   await connect();
  // });

  it('Reset', () => {
    request(app).post('/api/v1/reset').expect(StatusCodes.OK);
  });

  it('Connection statuses', async () => {
    closeConn();
    expect(getState()).equals(3); // Disconnecting
    await closeConn();
    expect(getState()).equals(0); // Disconnected

    connect();
    expect(getState()).equals(2); // Connecting
    await closeConn();
    expect(getState()).equals(0); // Disconnected

    await connect();
    expect(getState()).equals(1); // Connected
    await closeConn();
    expect(getState()).equals(0); // Disconnected
    await connect();
  });

  it('Reset on closed connection', async () => {
    await closeConn().then(() => {
      request(app)
        .post('/api/v1/reset')
        .expect(StatusCodes.INTERNAL_SERVER_ERROR);
    });
    await connect();
  });

  // XXX: Dummy awaiting implementation
  it('Reset on closed connection (dummy)', async () => {
    await closeConn();
    request(app)
      .post('/api/v1/resample')
      .send({ dummyTestInput: 'this text is useless' })
      .expect({ dummyTest: 'resampleDB() dummy test passes' });
    await connect();
  });
});
