import { expect } from 'chai';
import request from 'supertest';
import app from '../app.js';  

describe('Event API Tests', function () {
  let agent;

  before(() => {
    agent = request.agent(app); // Create an agent to maintain session
  });

  describe('User Authentication', () => {
    it('should log in successfully with correct credentials', (done) => {
      agent
        .post('/api/login')
        .send({ username: 'testuser', password: 'password123' })
        .expect(200)
        .end((err, res) => {
          expect(res.text).to.equal('Logged in successfully.');
          done();
        });
    });

    it('should not log in with incorrect credentials', (done) => {
      agent
        .post('/api/login')
        .send({ username: 'testuser', password: 'wrongpassword' })
        .expect(401)
        .end((err, res) => {
          expect(res.text).to.equal('Invalid username or password.');
          done();
        });
    });

    it('should log out successfully', (done) => {
      agent
        .post('/api/logout')
        .expect(200)
        .end((err, res) => {
          expect(res.text).to.equal('Logged out successfully.');
          done();
        });
    });
  });

  describe('Event Creation and Retrieval', () => {
    before((done) => {
      agent
        .post('/api/login')
        .send({ username: 'testuser', password: 'password123' })
        .expect(200)
        .end(done);
    });

    it('should create a new event', (done) => {
      agent
        .post('/api/events')
        .send({
          name: 'Meeting',
          description: 'Project discussion',
          date: '2025-03-20',
          time: '10:00',
          category: 'Meetings',
          reminderTime: '2025-03-19',
        })
        .expect(201)
        .end((err, res) => {
          expect(res.body.name).to.equal('Meeting');
          expect(res.body.description).to.equal('Project discussion');
          done();
        });
    });

    it('should retrieve upcoming events', (done) => {
      agent
        .get('/api/events/upcoming')
        .expect(200)
        .end((err, res) => {
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.be.greaterThan(0);
          done();
        });
    });
  });
});
