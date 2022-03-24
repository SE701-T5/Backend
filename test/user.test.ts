import request from 'supertest';
import app from '../server';
import assert from 'assert';
import { closeConn, connect } from '../config/db.server.config';
import { resetCollections } from '../models/db.server.model';
import { hashPassword } from '../models/user.server.model';

/**
 * Before all tests, the app database is disconnected before the test database is connected
 */
before(async function () {
  const testDatabaseName = process.env.DATABASE_TEST_NAME;
  await closeConn(); // Disconnect from the app database
  await connect(); // Connect to the test database
});

/**
 * Before each test, all data in the test database is deleted
 */
beforeEach(async function () {
  await resetCollections(); // reset database for testing
});

/**
 * After all tests, all test database document data is deleted and the test database is disconnected
 */
after(async function () {
  await resetCollections(); // reset database for testing
  await closeConn(); // Disconnect from the app database
});

/**
 * Test successful forum user database document creation without a displayName input
 */
describe('Create forum user successfully without displayName', function () {
  it('should return: status 201', function (done) {
    request(app)
      .post('/api/v1/users')
      .send({
        username: 'Bob123',
        email: 'bob420@hotmail.com',
        plaintextPassword: 'passwordbob',
      })
      .expect(201)
      .end(function (err, res) {
        if (err) done(err);
        done();
      });
  });
});

/**
 * Test successfully creating a new forum user with using a displayName field
 */
describe('Create forum user successfully with displayName', function () {
  it('should return: status 201', function (done) {
    request(app)
      .post('/api/v1/users')
      .send({
        username: 'Gary143',
        displayName: 'Gary',
        email: 'gary283@hotmail.com',
        plaintextPassword: 'passwordgary',
      })
      .expect(201)
      .end(function (err, res) {
        if (err) done(err);
        done();
      });
  });
});

/**
 * Test unsuccessfully creating a new forum user with a missing email field
 */
describe("Create forum user test unsuccessfully - missing field 'email'", function () {
  it('should return: status 400', function (done) {
    request(app)
      .post('/api/v1/users')
      .send({
        username: 'Tim123',
        plaintextPassword: 'passwordtim',
      })
      .expect(400)
      .end(function (err, res) {
        if (err) done(err);
        done();
      });
  });
});

/**
 * Test unsuccessfully creating a new forum user with an invalid username field
 */
describe('Create forum user test unsuccessfully - username field length requirement not met', function () {
  it('should return: status 400', function (done) {
    request(app)
      .post('/api/v1/users')
      .send({
        username: 'Yi',
        email: 'yi14123@gmail.com',
        plaintextPassword: 'passwordtim',
      })
      .expect(400)
      .end(function (err, res) {
        if (err) done(err);
        done();
      });
  });
});

/**
 * Test successful password hashing when a forum user document is created
 */
describe('Test password hashing works correctly', function () {
  it('should return: status 201', function (done) {
    request(app)
      .post('/api/v1/users')
      .send({
        username: 'Jim123',
        email: 'Jim420@hotmail.com',
        plaintextPassword: 'passwordjim',
      })
      .expect(201)
      .end(function (err, res) {
        if (err) done(err);
        assert.equal(
          res.body.userData.hashedPassword,
          hashPassword('passwordjim'),
        );
        done();
      });
  });
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
      .expect(201)
      .end(function (err, res) {
        if (err) done(err);
        request(app)
          .post('/api/v1/users/login')
          .send({
            username: 'NewUser',
            email: 'new@user.com',
            plaintextPassword: 'newUser',
          })
          .expect(200)
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
      .expect(201)
      .end(function (err, res) {
        if (err) done(err);
        request(app)
          .post('/api/v1/users/login')
          .send({
            plaintextPassword: 'newUser',
          })
          .expect(400)
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
      .expect(201)
      .end(function (err, res) {
        if (err) done(err);
        request(app)
          .post('/api/v1/users/login')
          .send({
            username: 'NewUser',
            email: 'new@user.com',
          })
          .expect(400)
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
      .expect(201)
      .end(function (err, res) {
        if (err) done(err);
        request(app)
          .post('/api/v1/users/login')
          .send({
            username: 'Nobody',
            plaintextPassword: 'newUser',
          })
          .expect(404)
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
      .expect(201)
      .end(function (err, res) {
        if (err) done(err);
        request(app)
          .post('/api/v1/users/login')
          .send({
            username: 'NewUser',
            plaintextPassword: 'noUser',
          })
          .expect(404)
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
      .expect(201)
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
          .expect(200)
          .end(function (err, res) {
            if (err) done(err);
            request(app)
              .post('/api/v1/users/logout')
              .set({ 'X-Authorization': res.body.authToken })
              .send({
                userID: id,
              })
              .expect(200)
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
      .expect(201)
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
          .expect(200)
          .end(function (err, res) {
            if (err) done(err);
            request(app)
              .post('/api/v1/users/logout')
              .set({ 'X-Authorization': 'wrongToken' })
              .send({
                userID: id,
              })
              .expect(401)
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
      .expect(201)
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
          .expect(200)
          .end(function (err, res) {
            if (err) done(err);
            request(app)
              .post('/api/v1/users/logout')
              .set({ 'X-Authorization': res.body.authToken })
              .send({
                userID: 'wrong ID',
              })
              .expect(400)
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
      .expect(201)
      .end(function (err, res) {
        if (err) done(err);
        request(app)
          .get(`/api/v1/users/${res.body.userData._id}`)
          .expect(200)
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
      .expect(400)
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
      .expect(201)
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
          .expect(200)
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
              .expect(201)
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
      .expect(201)
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
          .expect(200)
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
              .expect(401)
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
      .expect(201)
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
          .expect(200)
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
              .expect(404)
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
      .expect(201)
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
          .expect(400)
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
      .expect(201)
      .end(function (err, res) {
        if (err) done(err);
        request(app)
          .patch(`/api/v1/users/${res.body.userData._id}`)
          .send({})
          .expect(400)
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
      .expect(201)
      .end(function (err, res) {
        if (err) done(err);
        request(app)
          .patch(`/api/v1/users/${res.body.userData._id}`)
          .send({
            username: 'yo',
          })
          .expect(400)
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
      .expect(201)
      .end(function (err, res) {
        if (err) done(err);
        request(app)
          .patch(`/api/v1/users/${res.body.userData._id}`)
          .send({
            displayName: 'A',
          })
          .expect(400)
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
      .expect(201)
      .end(function (err, res) {
        if (err) done(err);
        request(app)
          .patch(`/api/v1/users/${res.body.userData._id}`)
          .send({
            email: 'not an email',
          })
          .expect(400)
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
      .expect(201)
      .end(function (err, res) {
        if (err) done(err);
        request(app)
          .patch(`/api/v1/users/${res.body.userData._id}`)
          .send({
            password: '',
          })
          .expect(400)
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
      .expect(201)
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
          .expect(200)
          .end(function (err, res) {
            if (err) done(err);
            request(app)
              .delete(`/api/v1/users/${id}`)
              .set({ 'X-Authorization': res.body.authToken })
              .expect(200)
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
      .expect(201)
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
          .expect(200)
          .end(function (err, res) {
            if (err) done(err);
            request(app)
              .delete(`/api/v1/users/${id}`)
              .set({ 'X-Authorization': 'wrongToken' })
              .expect(403)
              .end(function (err, res) {
                if (err) done(err);
                done();
              });
          });
      });
  });
});
