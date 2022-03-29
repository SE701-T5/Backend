import request from 'supertest';
import app from '../server';
import { closeConn, connect, getState } from '../config/db.server.config';
import { StatusCodes } from 'http-status-codes';

describe('Database', () => {
  beforeEach(async () => {
    await connect();
  });

  after(async () => {
    await closeConn();
  });

  it('Reset', function (done) {
    request(app)
      .post('/api/v1/reset')
      .expect(StatusCodes.OK)
      .end(function (err, res) {
        if (err) done(err);
        done();
      });
  });

  it('Reset on closed connection', async () => {
    closeConn().then(() => {
      request(app)
        .post('/api/v1/reset')
        .expect(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });

  // XXX: Dummy awaiting implementation
  // it('Reset on closed connection (dummy)', async () => {
  //   request(app)
  //     .post('/api/v1/resample')
  //     .send({ dummyTestInput: 'this text is useless' })
  //     .expect({ dummyTest: 'resampleDB() dummy test passes' });
  // });
});
