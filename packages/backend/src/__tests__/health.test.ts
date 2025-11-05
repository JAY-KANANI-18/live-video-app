import request from 'supertest';
import { app } from '../index';

describe('Health Check', () => {
  it('should return OK status', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });

  it('should return API health status', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });
});
