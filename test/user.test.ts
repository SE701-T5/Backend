import request from 'supertest';
import app from '../server';
import { hashPassword } from '../models/user.server.model';
import { StatusCodes } from 'http-status-codes';
import { expect } from 'chai';
import assert from 'assert';

describe('User', () => {
  it('Create without displayName', async () => {
    request(app)
      .post('/api/v1/users')
      .send({
        username: 'Bob123',
        email: 'bob420@hotmail.com',
        plaintextPassword: 'passwordbob',
      })
      .expect(StatusCodes.CREATED);
  });

  it('Create with displayName', async () => {
    request(app)
      .post('/api/v1/users')
      .send({
        username: 'Bob123',
        displayName: 'Bob123',
        email: 'bob420@hotmail.com',
        plaintextPassword: 'passwordbob',
      })
      .expect(StatusCodes.CREATED);
  });

  it('Create with missing email', async () => {
    request(app)
      .post('/api/v1/users')
      .send({
        username: 'Bob123',
        plaintextPassword: 'passwordbob',
      })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it('Create with unmet username length requirement ', async () => {
    request(app)
      .post('/api/v1/users')
      .send({
        username: 'Yi',
        email: 'bob420@hotmail.com',
        plaintextPassword: 'passwordbob',
      })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it('Create and check password hash', async () => {
    const createUserPayload = {
      username: 'Jim123',
      email: 'Jim420@hotmail.com',
      plaintextPassword: 'passwordjim',
    };
    const createUserRequest = await request(app)
      .post('/api/v1/users')
      .send(createUserPayload)
      .expect(StatusCodes.CREATED);

    expect(createUserRequest.body.userData.res.hashedPassword).equals(
      hashPassword(createUserPayload.plaintextPassword),
    );
  });
});

  it('Login', async () => {


  });
/**
 * Test successfully logging in a forum user
 */
describe('Log in forum user successfully', function () {
  it('should return: 200', function (done) {
    request(app)
      .post('/api/v1/users')
      .send({
        username: 'NewUser',
        displayName: 'NewUser',
        email: 'new@user.com',
        plaintextPassword: 'newUser',
      })
      .expect(StatusCodes.CREATED)
      .end(function (err, res) {
        if (err) done(err);
        request(app)
          .post('/api/v1/users/login')
          .send({
            username: 'NewUser',
            email: 'new@user.com',
            plaintextPassword: 'newUser',
          })
          .expect(StatusCodes.OK)
          .end(function (err, res) {
            if (err) done(err);
            done();
          });
      });
  });
});

/**
 * Test unsuccessfully logging in a forum user with an invalid login
 */
describe('Log in forum user unsuccessfully - no valid login', function () {
  it('should return: 400', function (done) {
    request(app)
      .post('/api/v1/users')
      .send({
        username: 'NewUser',
        displayName: 'NewUser',
        email: 'new@user.com',
        plaintextPassword: 'newUser',
      })
      .expect(StatusCodes.CREATED)
      .end(function (err, res) {
        if (err) done(err);
        request(app)
          .post('/api/v1/users/login')
          .send({
            plaintextPassword: 'newUser',
          })
          .expect(StatusCodes.BAD_REQUEST)
          .end(function (err, res) {
            if (err) done(err);
            done();
          });
      });
  });
});

/**
 * Test unsuccessfully logging in a forum user with an invalid password
 */
describe('Log in forum user unsuccessfully - no valid password', function () {
  it('should return: 400', function (done) {
    request(app)
      .post('/api/v1/users')
      .send({
        username: 'NewUser',
        displayName: 'NewUser',
        email: 'new@user.com',
        plaintextPassword: 'newUser',
      })
      .expect(StatusCodes.CREATED)
      .end(function (err, res) {
        if (err) done(err);
        request(app)
          .post('/api/v1/users/login')
          .send({
            username: 'NewUser',
            email: 'new@user.com',
          })
          .expect(StatusCodes.BAD_REQUEST)
          .end(function (err, res) {
            if (err) done(err);
            done();
          });
      });
  });
});

/**
 * Test unsuccessfully logging in a forum user with a non-matching login
 */
describe('Log in forum user unsuccessfully - non-matching login', function () {
  it('should return: 404', function (done) {
    request(app)
      .post('/api/v1/users')
      .send({
        username: 'NewUser',
        displayName: 'NewUser',
        email: 'new@user.com',
        plaintextPassword: 'newUser',
      })
      .expect(StatusCodes.CREATED)
      .end(function (err, res) {
        if (err) done(err);
        request(app)
          .post('/api/v1/users/login')
          .send({
            username: 'Nobody',
            plaintextPassword: 'newUser',
          })
          .expect(StatusCodes.NOT_FOUND)
          .end(function (err, res) {
            if (err) done(err);
            done();
          });
      });
  });
});

/**
 * Test unsuccessfully logging in a forum user with a non-matching login
 */
describe('Log in forum user unsuccessfully - non-matching password', function () {
  it('should return: 404', function (done) {
    request(app)
      .post('/api/v1/users')
      .send({
        username: 'NewUser',
        displayName: 'NewUser',
        email: 'new@user.com',
        plaintextPassword: 'newUser',
      })
      .expect(StatusCodes.CREATED)
      .end(function (err, res) {
        if (err) done(err);
        request(app)
          .post('/api/v1/users/login')
          .send({
            username: 'NewUser',
            plaintextPassword: 'noUser',
          })
          .expect(StatusCodes.NOT_FOUND)
          .end(function (err, res) {
            if (err) done(err);
            done();
          });
      });
  });
});

/**
 * Test successful logging out of a forum user using existing and valid ID
 */
describe('Logout forum user successfully', function () {
  it('should return: 200', function (done) {
    request(app)
      .post('/api/v1/users')
      .send({
        username: 'NewUser',
        displayName: 'todd',
        email: 'new@user.com',
        plaintextPassword: 'newUser',
      })
      .expect(StatusCodes.CREATED)
      .end(function (err, res) {
        if (err) done(err);
        const id = res.body.userData._id;
        request(app)
          .post('/api/v1/users/login')
          .send({
            username: 'NewUser',
            email: 'new@user.com',
            plaintextPassword: 'newUser',
          })
          .expect(StatusCodes.OK)
          .end(function (err, res) {
            if (err) done(err);
            request(app)
              .post('/api/v1/users/logout')
              .set({ 'X-Authorization': res.body.authToken })
              .send({
                userID: id,
              })
              .expect(StatusCodes.OK)
              .end(function (err, res) {
                if (err) done(err);
                done();
              });
          });
      });
  });
});

/**
 * Test unsuccessful logging out of a forum user using invalid authorization token
 */
describe('Logout forum user unsuccessfully - invalid authorization token', function () {
  it('should return: 401', function (done) {
    request(app)
      .post('/api/v1/users')
      .send({
        username: 'NewUser',
        displayName: 'todd',
        email: 'new@user.com',
        plaintextPassword: 'newUser',
      })
      .expect(StatusCodes.CREATED)
      .end(function (err, res) {
        if (err) done(err);
        const id = res.body.userData._id;
        request(app)
          .post('/api/v1/users/login')
          .send({
            username: 'NewUser',
            email: 'new@user.com',
            plaintextPassword: 'newUser',
          })
          .expect(StatusCodes.OK)
          .end(function (err, res) {
            if (err) done(err);
            request(app)
              .post('/api/v1/users/logout')
              .set({ 'X-Authorization': 'wrongToken' })
              .send({
                userID: id,
              })
              .expect(StatusCodes.UNAUTHORIZED)
              .end(function (err, res) {
                if (err) done(err);
                done();
              });
          });
      });
  });
});

/**
 * Test unsuccessful logging out of a forum user using invalid user ID
 */
describe('Logout forum user unsuccessfully - invalid user ID', function () {
  it('should return: 400', function (done) {
    request(app)
      .post('/api/v1/users')
      .send({
        username: 'NewUser',
        displayName: 'todd',
        email: 'new@user.com',
        plaintextPassword: 'newUser',
      })
      .expect(StatusCodes.CREATED)
      .end(function (err, res) {
        if (err) done(err);
        const id = res.body.userData._id;
        request(app)
          .post('/api/v1/users/login')
          .send({
            username: 'NewUser',
            email: 'new@user.com',
            plaintextPassword: 'newUser',
          })
          .expect(StatusCodes.OK)
          .end(function (err, res) {
            if (err) done(err);
            request(app)
              .post('/api/v1/users/logout')
              .set({ 'X-Authorization': res.body.authToken })
              .send({
                userID: 'wrong ID',
              })
              .expect(StatusCodes.BAD_REQUEST)
              .end(function (err, res) {
                if (err) done(err);
                done();
              });
          });
      });
  });
});

/**
 * Test successfully logging in a forum user with an invalid login
 */
describe('View forum user by ID successfully', function () {
  it('should return: status 200', function (done) {
    request(app)
      .post('/api/v1/users')
      .send({
        username: 'Bob1234',
        displayName: 'bob',
        email: 'bob420@hotmail.com',
        plaintextPassword: 'passwordbob',
      })
      .expect(StatusCodes.CREATED)
      .end(function (err, res) {
        if (err) done(err);
        request(app)
          .get(`/api/v1/users/${res.body.userData._id}`)
          .expect(StatusCodes.OK)
          .end(function (err, res) {
            if (err) done(err);
            done();
          });
      });
  });
});

/**
 * Test unsuccessfully viewing a forum user with an invalid ID
 */
describe('View forum user by ID unsuccessfully with invalid ID', function () {
  it('should return a 400 response for invalid id', function (done) {
    request(app)
      .get('/api/v1/users/x')
      .expect(StatusCodes.BAD_REQUEST)
      .end(function (err, res) {
        if (err) done(err);
        done();
      });
  });
});

/**
 * Test successful forum user database document update using valid ID
 */
describe('Update forum user successfully with valid ID', function () {
  it('should return: 201', function (done) {
    request(app)
      .post('/api/v1/users')
      .send({
        username: 'NewBob',
        displayName: 'Bobby',
        email: 'bobby@joe.com',
        plaintextPassword: 'BobbyJoe',
      })
      .expect(StatusCodes.CREATED)
      .end(function (err, res) {
        if (err) done(err);
        const id = res.body.userData._id;
        request(app)
          .post('/api/v1/users/login')
          .send({
            username: 'NewBob',
            email: 'bobby@joe.com',
            plaintextPassword: 'BobbyJoe',
          })
          .expect(StatusCodes.OK)
          .end(function (err, res) {
            if (err) done(err);
            request(app)
              .patch(`/api/v1/users/${id}`)
              .set({ 'X-Authorization': res.body.authToken })
              .send({
                username: 'OldBob',
                displayName: 'Bob',
                email: 'joe@bobby.com',
                plaintextPassword: 'JoeBob',
              })
              .expect(StatusCodes.CREATED)
              .end(function (err, res) {
                if (err) done(err);
                assert.equal(res.body.updatedForumUser.username, 'OldBob');
                assert.equal(res.body.updatedForumUser.displayName, 'Bob');
                assert.equal(res.body.updatedForumUser.email, 'joe@bobby.com');
                assert.equal(
                  res.body.updatedForumUser.hashedPassword,
                  hashPassword('JoeBob'),
                );
                done();
              });
          });
      });
  });
});

/**
 * Test unsuccessful forum user database document update using invalid authorization token
 */
describe('Update forum user unsuccessfully with invalid authorization token', function () {
  it('should return: 401', function (done) {
    request(app)
      .post('/api/v1/users')
      .send({
        username: 'NewBob',
        displayName: 'Bobby',
        email: 'bobby@joe.com',
        plaintextPassword: 'BobbyJoe',
      })
      .expect(StatusCodes.CREATED)
      .end(function (err, res) {
        if (err) done(err);
        const id = res.body.userData._id;
        request(app)
          .post('/api/v1/users/login')
          .send({
            username: 'NewBob',
            email: 'bobby@joe.com',
            plaintextPassword: 'BobbyJoe',
          })
          .expect(StatusCodes.OK)
          .end(function (err, res) {
            if (err) done(err);
            request(app)
              .patch(`/api/v1/users/${id}`)
              .set({ 'X-Authorization': 'wrongToken' })
              .send({
                username: 'OldBob',
                displayName: 'Bob',
                email: 'joe@bobby.com',
                plaintextPassword: 'JoeBob',
              })
              .expect(StatusCodes.UNAUTHORIZED)
              .end(function (err, res) {
                if (err) done(err);
                done();
              });
          });
      });
  });
});

/**
 * Test unsuccessful forum user database document update using valid but un-matching ID
 */
describe('Update forum user unsuccessfully with valid but un-matching ID', function () {
  it('should return: 404', function (done) {
    request(app)
      .post('/api/v1/users')
      .send({
        username: 'NewBob',
        displayName: 'Bobby',
        email: 'bobby@joe.com',
        plaintextPassword: 'BobbyJoe',
      })
      .expect(StatusCodes.CREATED)
      .end(function (err, res) {
        if (err) done(err);
        const id = res.body.userData._id;
        request(app)
          .post('/api/v1/users/login')
          .send({
            username: 'NewBob',
            email: 'bobby@joe.com',
            plaintextPassword: 'BobbyJoe',
          })
          .expect(StatusCodes.OK)
          .end(function (err, res) {
            if (err) done(err);
            request(app)
              .patch('/api/v1/users/62328e357ec0006e40e1b29b')
              .set({ 'X-Authorization': res.body.authToken })
              .send({
                username: 'WrongBob',
                displayName: 'NotFound',
                email: 'what@email.com',
                plaintextPassword: 'password',
              })
              .expect(StatusCodes.NOT_FOUND)
              .end(function (err, res) {
                if (err) done(err);
                done();
              });
          });
      });
  });
});

/**
 * Test unsuccessful forum user database document update using invalid ID
 */
describe('Update forum user unsuccessfully with invalid ID', function () {
  it('should return: 400', function (done) {
    request(app)
      .post('/api/v1/users')
      .send({
        username: 'NewBob',
        displayName: 'Bobby',
        email: 'bobby@joe.com',
        plaintextPassword: 'BobbyJoe',
      })
      .expect(StatusCodes.CREATED)
      .end(function (err, res) {
        if (err) done(err);
        request(app)
          .patch('/api/v1/users/abc')
          .send({
            username: 'NewBob',
            displayName: 'Bobby',
            email: 'bobby@joe.com',
            plaintextPassword: 'BobbyJoe',
          })
          .expect(StatusCodes.BAD_REQUEST)
          .end(function (err, res) {
            if (err) done(err);
            done();
          });
      });
  });
});

/**
 * Test unsuccessful forum user database document update using empty update object
 */
describe('Update forum user unsuccessfully with empty update object', function () {
  it('should return: 400', function (done) {
    request(app)
      .post('/api/v1/users')
      .send({
        username: 'NewBob',
        displayName: 'Bobby',
        email: 'bobby@joe.com',
        plaintextPassword: 'BobbyJoe',
      })
      .expect(StatusCodes.CREATED)
      .end(function (err, res) {
        if (err) done(err);
        request(app)
          .patch(`/api/v1/users/${res.body.userData._id}`)
          .send({})
          .expect(StatusCodes.BAD_REQUEST)
          .end(function (err, res) {
            if (err) done(err);
            done();
          });
      });
  });
});

/**
 * Test unsuccessful forum user database document update using invalid username update field
 */
describe('Update forum user unsuccessfully with invalid username update field', function () {
  it('should return: 400', function (done) {
    request(app)
      .post('/api/v1/users')
      .send({
        username: 'NewBob',
        displayName: 'Bobby',
        email: 'bobby@joe.com',
        plaintextPassword: 'BobbyJoe',
      })
      .expect(StatusCodes.CREATED)
      .end(function (err, res) {
        if (err) done(err);
        request(app)
          .patch(`/api/v1/users/${res.body.userData._id}`)
          .send({
            username: 'yo',
          })
          .expect(StatusCodes.BAD_REQUEST)
          .end(function (err, res) {
            if (err) done(err);
            done();
          });
      });
  });
});

/**
 * Test unsuccessful forum user database document update using invalid displayName update field
 */
describe('Update forum user unsuccessfully with invalid displayName update field', function () {
  it('should return: 400', function (done) {
    request(app)
      .post('/api/v1/users')
      .send({
        username: 'NewBob',
        displayName: 'Bobby',
        email: 'bobby@joe.com',
        plaintextPassword: 'BobbyJoe',
      })
      .expect(StatusCodes.CREATED)
      .end(function (err, res) {
        if (err) done(err);
        request(app)
          .patch(`/api/v1/users/${res.body.userData._id}`)
          .send({
            displayName: 'A',
          })
          .expect(StatusCodes.BAD_REQUEST)
          .end(function (err, res) {
            if (err) done(err);
            done();
          });
      });
  });
});

/**
 * Test unsuccessful forum user database document update using invalid email update field
 */
describe('Update forum user unsuccessfully with invalid email update field', function () {
  it('should return: 400', function (done) {
    request(app)
      .post('/api/v1/users')
      .send({
        username: 'NewBob',
        displayName: 'Bobby',
        email: 'bobby@joe.com',
        plaintextPassword: 'BobbyJoe',
      })
      .expect(StatusCodes.CREATED)
      .end(function (err, res) {
        if (err) done(err);
        request(app)
          .patch(`/api/v1/users/${res.body.userData._id}`)
          .send({
            email: 'not an email',
          })
          .expect(StatusCodes.BAD_REQUEST)
          .end(function (err, res) {
            if (err) done(err);
            done();
          });
      });
  });
});

/**
 * Test unsuccessful forum user database document update using invalid password update field
 */
describe('Update forum user unsuccessfully with invalid password update field', function () {
  it('should return: 400', function (done) {
    request(app)
      .post('/api/v1/users')
      .send({
        username: 'NewBob',
        displayName: 'Bobby',
        email: 'bobby@joe.com',
        plaintextPassword: 'BobbyJoe',
      })
      .expect(StatusCodes.CREATED)
      .end(function (err, res) {
        if (err) done(err);
        request(app)
          .patch(`/api/v1/users/${res.body.userData._id}`)
          .send({
            password: '',
          })
          .expect(StatusCodes.BAD_REQUEST)
          .end(function (err, res) {
            if (err) done(err);
            done();
          });
      });
  });
});

/**
 * Test successful forum user database document deletion using existing and valid ID
 */
describe('Delete forum user successfully', function () {
  it('should return: 200', function (done) {
    request(app)
      .post('/api/v1/users')
      .send({
        username: 'Todd123',
        displayName: 'todd',
        email: 'todd413@hotmail.com',
        plaintextPassword: 'passwordtodd',
      })
      .expect(StatusCodes.CREATED)
      .end(function (err, res) {
        if (err) done(err);
        const id = res.body.userData._id;
        request(app)
          .post('/api/v1/users/login')
          .send({
            username: 'Todd123',
            email: 'todd413@hotmail.com',
            plaintextPassword: 'passwordtodd',
          })
          .expect(StatusCodes.OK)
          .end(function (err, res) {
            if (err) done(err);
            request(app)
              .delete(`/api/v1/users/${id}`)
              .set({ 'X-Authorization': res.body.authToken })
              .expect(StatusCodes.OK)
              .end(function (err, res) {
                if (err) done(err);
                done();
              });
          });
      });
  });
});

/**
 * Test unsuccessful forum user database document deletion using invalid authorization token
 */
describe('Delete forum user unsuccessfully using invalid authorization token', function () {
  it('should return: 401', function (done) {
    request(app)
      .post('/api/v1/users')
      .send({
        username: 'Todd123',
        displayName: 'todd',
        email: 'todd413@hotmail.com',
        plaintextPassword: 'passwordtodd',
      })
      .expect(StatusCodes.CREATED)
      .end(function (err, res) {
        if (err) done(err);
        const id = res.body.userData._id;
        request(app)
          .post('/api/v1/users/login')
          .send({
            username: 'Todd123',
            email: 'todd413@hotmail.com',
            plaintextPassword: 'passwordtodd',
          })
          .expect(StatusCodes.OK)
          .end(function (err, res) {
            if (err) done(err);
            request(app)
              .delete(`/api/v1/users/${id}`)
              .set({ 'X-Authorization': 'wrongToken' })
              .expect(StatusCodes.FORBIDDEN)
              .end(function (err, res) {
                if (err) done(err);
                done();
              });
          });
      });
  });
});
