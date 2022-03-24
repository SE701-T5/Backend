import {expect} from 'chai';
import {randomUUID} from 'crypto';
import {describe} from 'mocha';
import User from '../config/db_schemas/user.schema';
import { authenticateUser, isUserAuthorized, getUserAuthToken, setUserAuthToken } from '../models/user.server.model';
import {hashPassword} from '../models/user.server.model';
import request from 'supertest';
import assert from 'assert';
import app from '../server';

/**
 * Test successful user authentication using a matching email login and password
 */
describe('Authenticate user with matching email and password', function() {

	beforeEach(async () => {
		await new User({
			username: 'TestDummy',
			displayName: 'MostValuedTest',
			email: 'test@dummy.com',
			hashedPassword: hashPassword('authentication-test'),
			authToken: '6a95b47e-c37d-492e-8278-faca6824ada6'
		}).save();
	});

	it('should fail on incorrect password', function (done){
		authenticateUser({ email: 'test@dummy.com' }, 'incorrectPassword', (result) => {
			expect(result).to.be.false;
			done();
		});
	});

	it('should fail on incorrect username', function(done){
		authenticateUser({ username: 'IncorrectUsername' }, 'authentication-test', (result) => {
			expect(result).to.be.false;
			done();
		});
	});

	it('should fail on incorrect email', function(done){
		authenticateUser({ email: 'incorrectemail@example.com' }, 'authentication-test', (result) => {
			expect(result).to.be.false;
			done();
		});
	});

	it('should fail on incorrect login details', function(done){
		authenticateUser({ displayName: 'MostValuedTest' }, 'authentication-test', (result) => {
			expect(result).to.be.false;
			done();
		});
	});

	it('should succeed on correct username and password', function(done){
		authenticateUser({ username: 'TestDummy' }, 'authentication-test', (result) => {
			expect(result).to.have.property('res');
			expect(result.res.email).to.equal('test@dummy.com');
			expect(result).to.have.property('status');
			expect(result.status).to.equal(200);
			done();
		});
	});

	it('should succeed on correct email and password', function(done){
		authenticateUser({ email: 'test@dummy.com' }, 'authentication-test', (result) => {
			expect(result).to.have.property('res');
			expect(result.res.email).to.equal('test@dummy.com');
			expect(result).to.have.property('status');
			expect(result.status).to.equal(200);
			done();
		});
	});
});

describe('Login to app', function () {

	beforeEach(async () => {
		await new User({
			username: 'Todd123',
			displayName: 'Todd',
			email: 'todd413@hotmail.com',
			hashedPassword: hashPassword('passwordtodd'),
			authToken: '6a95b47e-c37d-492e-8278-faca6824ada6'
		}).save();
	});


	it ('should provide an auth token if details are valid', async function(){
		const response = await request(app)
			.post('/api/v1/users/login')
			.send({
				email: 'todd413@hotmail.com',
				plaintextPassword: 'passwordtodd'
			});
		expect(response.status).to.equal(200);
		expect(response.body).to.have.property('authToken');
	});

	it ('should not provide an auth token if details are invalid', async function(){
		const response = await request(app)
			.post('/api/v1/users/login')
			.send({
				username: 'InvalidUsername',
				email: 'todd413@hotmail.com',
				plaintextPassword: 'passwordtodd'
			});
		expect(response.status).to.equal(403);
		expect(response.body).to.not.have.property('authToken');
	});
});

/**
 * Test successful verification of user authentication using a valid user ID and authentication token
 */
describe.skip('Verify user authentication successfully with valid ID and authentication token', function() {
	it('should return: true', function(done) {
		request(app)
			.post('/api/v1/users')
			.send({
				username: 'Todd123',
				displayName: 'todd',
				email: 'todd413@hotmail.com',
				plaintextPassword: 'passwordtodd'
			})
			.expect(201)
			.end(function(err, res) {
				if (err) done(err);
				const id = res.body.userData._id;
				const response = request(app)
					.post('/api/v1/users/login')
					.send({
						username: 'Todd123',
						email: 'todd413@hotmail.com',
						plaintextPassword: 'passwordtodd'
					})
					.expect(200)
					.end(function(err, res) {
						if (err) done(err);
						isUserAuthorized(id, res.body.authToken, function(result) {
							assert.equal(result.isAuth, true);
							done();
						});
					});
			});
	});
});

/**
 * Test unsuccessful verification of user authentication using a valid user ID and invalid authentication token
 */
describe.skip('Verify user authentication unsuccessfully with valid ID and invalid authentication token', function() {
	it('should return: true', function(done) {
		request(app)
			.post('/api/v1/users')
			.send({
				username: 'Todd123',
				displayName: 'todd',
				email: 'todd413@hotmail.com',
				plaintextPassword: 'passwordtodd'
			})
			.expect(201)
			.end(function(err, res) {
				if (err) done(err);
				const id = res.body.userData._id;
				request(app)
					.post('/api/v1/users/login')
					.send({
						username: 'Todd123',
						email: 'todd413@hotmail.com',
						plaintextPassword: 'passwordtodd'
					})
					.expect(200)
					.end(function(err, res) {
						if (err) done(err);
						isUserAuthorized(id, 'wrongToken', function(result) {
							assert.equal(result.isAuth, false);
							done();
						});
					});
			});
	});
});

/**
 * Test unsuccessful verification of user authentication using an invalid user ID and valid authentication token
 */
describe.skip('Verify user authentication unsuccessfully with invalid ID and valid authentication token', function() {
	it('should return: true', function(done) {
		request(app)
			.post('/api/v1/users')
			.send({
				username: 'Todd123',
				displayName: 'todd',
				email: 'todd413@hotmail.com',
				plaintextPassword: 'passwordtodd'
			})
			.expect(201)
			.end(function(err, res) {
				if (err) done(err);
				const id = res.body.userData._id;
				request(app)
					.post('/api/v1/users/login')
					.send({
						username: 'Todd123',
						email: 'todd413@hotmail.com',
						plaintextPassword: 'passwordtodd'
					})
					.expect(200)
					.end(function(err, res) {
						if (err) done(err);
						isUserAuthorized('wrongID', res.body.authToken, function(result) {
							assert.equal(result.isAuth, false);
							done();
						});
					});
			});
	});
});

/**
 * Test successful getting of a user authentication token with valid and logged-in user ID
 */
describe.skip('Get user authentication token successfully with valid and logged-in user ID', function() {
	it('should return: authToken', function(done) {
		request(app)
			.post('/api/v1/users')
			.send({
				username: 'Todd123',
				displayName: 'todd',
				email: 'todd413@hotmail.com',
				plaintextPassword: 'passwordtodd'
			})
			.expect(201)
			.end(function(err, res) {
				if (err) done(err);
				const id = res.body.userData._id;
				request(app)
					.post('/api/v1/users/login')
					.send({
						username: 'Todd123',
						email: 'todd413@hotmail.com',
						plaintextPassword: 'passwordtodd'
					})
					.expect(200)
					.end(function(err, res) {
						if (err) done(err);
						getUserAuthToken(id, function(result) {
							assert.equal(result.length === 16, true);
							done();
						});
					});
			});
	});
});

/**
 * Test unsuccessful getting of a user authentication token with invalid user ID
 */
describe.skip('Get user authentication token unsuccessfully with invalid user ID', function() {
	it('should return: 404', function(done) {
		request(app)
			.post('/api/v1/users')
			.send({
				username: 'Todd123',
				displayName: 'todd',
				email: 'todd413@hotmail.com',
				plaintextPassword: 'passwordtodd'
			})
			.expect(201)
			.end(function(err, res) {
				if (err) done(err);
				request(app)
					.post('/api/v1/users/login')
					.send({
						username: 'Todd123',
						email: 'todd413@hotmail.com',
						plaintextPassword: 'passwordtodd'
					})
					.expect(200)
					.end(function(err, res) {
						if (err) done(err);
						getUserAuthToken('wrong ID', function(result) {
							assert.equal(result.status, 404);
							done();
						});
					});
			});
	});
});

/**
 * Test successful setting of a user authentication token with valid and logged-in user ID
 */
describe.skip('Set user authentication token successfully with valid and logged-in user ID', function() {
	it('should return: authToken', function(done) {
		request(app)
			.post('/api/v1/users')
			.send({
				username: 'Todd123',
				displayName: 'todd',
				email: 'todd413@hotmail.com',
				plaintextPassword: 'passwordtodd'
			})
			.expect(201)
			.end(function(err, res) {
				if (err) done(err);
				const id = res.body.userData._id;
				request(app)
					.post('/api/v1/users/login')
					.send({
						username: 'Todd123',
						email: 'todd413@hotmail.com',
						plaintextPassword: 'passwordtodd'
					})
					.expect(200)
					.end(function(err, res) {
						if (err) done(err);
						setUserAuthToken(id, function(result) {
							assert.equal(result.res.length === 16, true);
							done();
						});
					});
			});
	});
});

/**
 * Test unsuccessful setting of a user authentication token with invalid user ID
 */
describe.skip('set user authentication token unsuccessfully with invalid user ID', function() {
	it('should return: 404', function(done) {
		request(app)
			.post('/api/v1/users')
			.send({
				username: 'Todd123',
				displayName: 'todd',
				email: 'todd413@hotmail.com',
				plaintextPassword: 'passwordtodd'
			})
			.expect(201)
			.end(function(err, res) {
				if (err) done(err);
				request(app)
					.post('/api/v1/users/login')
					.send({
						username: 'Todd123',
						email: 'todd413@hotmail.com',
						plaintextPassword: 'passwordtodd'
					})
					.expect(200)
					.end(function(err, res) {
						if (err) done(err);
						setUserAuthToken('wrong ID', function(result) {
							assert.equal(result.status, 404);
							done();
						});
					});
			});
	});
});
