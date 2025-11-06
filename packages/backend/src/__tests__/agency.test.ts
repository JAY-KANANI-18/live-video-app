import request from 'supertest';
import { app } from '../index';
import prisma from '../config/prisma';

describe('Agency API', () => {
  let accessToken: string;
  let userId: string;
  const testAgencyCode = 'TEST123';

  beforeAll(async () => {
    // Clean up test data
    await prisma.agency.deleteMany({
      where: { code: testAgencyCode },
    });

    await prisma.user.deleteMany({
      where: { email: 'agencytest@example.com' },
    });

    // Create test agency
    await prisma.agency.create({
      data: {
        name: 'Test Agency',
        code: testAgencyCode,
        email: 'agency@example.com',
        commissionRate: 15.0,
      },
    });

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'agencytest@example.com',
        username: 'agencytestuser',
        displayName: 'Agency Test User',
        dateOfBirth: new Date('2000-01-01'),
        wallet: {
          create: {},
        },
      },
    });

    userId = user.id;

    // Get access token
    await request(app).post('/api/v1/auth/send-otp').send({
      email: 'agencytest@example.com',
    });

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'agencytest@example.com',
        otp: '123456',
      });

    accessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    // Clean up
    await prisma.user.deleteMany({
      where: { id: userId },
    });
    await prisma.agency.deleteMany({
      where: { code: testAgencyCode },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/agency/join', () => {
    it('should join agency with valid code', async () => {
      const response = await request(app)
        .post('/api/v1/agency/join')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          agencyCode: testAgencyCode,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Successfully joined agency');
      expect(response.body.user).toHaveProperty('isHost', true);
      expect(response.body.user).toHaveProperty('agencyId');
      expect(response.body).toHaveProperty('accessToken'); // New token with agencyId
    });

    it('should fail with invalid agency code', async () => {
      const response = await request(app)
        .post('/api/v1/agency/join')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          agencyCode: 'INVALID',
        });

      expect(response.status).toBe(404);
    });

    it('should fail without auth', async () => {
      const response = await request(app)
        .post('/api/v1/agency/join')
        .send({
          agencyCode: testAgencyCode,
        });

      expect(response.status).toBe(401);
    });

    it('should fail if already in agency', async () => {
      const response = await request(app)
        .post('/api/v1/agency/join')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          agencyCode: testAgencyCode,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already part of');
    });
  });

  describe('GET /api/v1/agency/info', () => {
    it('should get agency info', async () => {
      const response = await request(app)
        .get('/api/v1/agency/info')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.agency).toHaveProperty('name', 'Test Agency');
      expect(response.body.agency).toHaveProperty('code', testAgencyCode);
      expect(response.body.agency).toHaveProperty('commissionRate', 15.0);
    });

    it('should fail without auth', async () => {
      const response = await request(app).get('/api/v1/agency/info');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/agency/list', () => {
    it('should list all active agencies', async () => {
      const response = await request(app).get('/api/v1/agency/list');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('agencies');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.agencies)).toBe(true);
    });
  });

  describe('POST /api/v1/agency/leave', () => {
    it('should leave agency', async () => {
      const response = await request(app)
        .post('/api/v1/agency/leave')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Successfully left agency');
      expect(response.body.user).toHaveProperty('agencyId', null);
    });

    it('should fail if not in agency', async () => {
      const response = await request(app)
        .post('/api/v1/agency/leave')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(400);
    });
  });
});
