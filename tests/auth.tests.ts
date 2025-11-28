import request from 'supertest';
import app from '../src/app';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';


describe('Auth JWT', () => {
  it('should login and access a protected route', async () => {

    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'jwt@test.com',
        password: 'password123',
        firstName: 'JWT',
        lastName: 'Test',
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'jwt@test.com',
        password: 'password123',
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('accessToken');

    const accessToken = loginRes.body.accessToken as string;


    const protectedRes = await request(app)
      .get('/api/commandes')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(protectedRes.status).toBe(200);
  });
});
