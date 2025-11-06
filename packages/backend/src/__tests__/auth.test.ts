import request from 'supertest';
import { app } from '../index';
import prisma from '../config/prisma';

describe('Auth API', () => {
  beforeAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: 'test@example.com' },
          { phoneNumber: '+1234567890' },
          { username: 'testuser' },
        ],
      },
    });
  });

  afterAll(async () => {
    // Clean up after tests
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: 'test@example.com' },
          { phoneNumber: '+1234567890' },
          { username: 'testuser' },
        ],
      },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/send-otp', () => {
    it('should send OTP to email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/send-otp')
        .send({
          email: 'test@example.com',
          type: 'LOGIN',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'OTP sent successfully');
      expect(response.body).toHaveProperty('expiresIn', 10);
    });

    it('should send OTP to phone', async () => {
      const response = await request(app)
        .post('/api/v1/auth/send-otp')
        .send({
          phoneNumber: '+1234567890',
          type: 'LOGIN',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should fail without email or phone', async () => {
      const response = await request(app).post('/api/v1/auth/send-otp').send({});

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/signup', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          displayName: 'Test User',
          dateOfBirth: '2000-01-01',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body.user).toHaveProperty('username', 'testuser');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should fail with age < 18', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'young@example.com',
          username: 'younguser',
          dateOfBirth: '2015-01-01', // Too young
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('18 years old');
    });

    it('should fail with duplicate username', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'another@example.com',
          username: 'testuser', // Already exists
          dateOfBirth: '2000-01-01',
        });

      expect(response.status).toBe(409);
    });

    it('should fail with invalid username format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'test2@example.com',
          username: 'a', // Too short
          dateOfBirth: '2000-01-01',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid OTP', async () => {
      // First send OTP
      await request(app).post('/api/v1/auth/send-otp').send({
        email: 'test@example.com',
      });

      // Then login with OTP (in dev, OTP is always 123456)
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          otp: '123456',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should fail with invalid OTP', async () => {
      await request(app).post('/api/v1/auth/send-otp').send({
        email: 'test@example.com',
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          otp: '000000', // Wrong OTP
        });

      expect(response.status).toBe(400);
    });

    it('should fail without OTP', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    let accessToken: string;

    beforeAll(async () => {
      // Login to get access token
      await request(app).post('/api/v1/auth/send-otp').send({
        email: 'test@example.com',
      });

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          otp: '123456',
        });

      accessToken = loginResponse.body.accessToken;
    });

    it('should get profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).toHaveProperty('username', 'testuser');
    });

    it('should fail without token', async () => {
      const response = await request(app).get('/api/v1/auth/profile');

      expect(response.status).toBe(401);
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/v1/auth/profile', () => {
    let accessToken: string;

    beforeAll(async () => {
      // Get access token
      await request(app).post('/api/v1/auth/send-otp').send({
        email: 'test@example.com',
      });

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          otp: '123456',
        });

      accessToken = loginResponse.body.accessToken;
    });

    it('should update profile', async () => {
      const response = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          displayName: 'Updated Name',
          bio: 'Test bio',
          country: 'USA',
        });

      expect(response.status).toBe(200);
      expect(response.body.user.displayName).toBe('Updated Name');
      expect(response.body.user.bio).toBe('Test bio');
    });

    it('should fail without auth', async () => {
      const response = await request(app)
        .put('/api/v1/auth/profile')
        .send({
          displayName: 'Hacker',
        });

      expect(response.status).toBe(401);
    });
  });
});
