import { beforeAll, describe, expect, it } from 'vitest';
import express, { type Express } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { authenticate } from '../src/interface/middlewares/auth.middleware.js';
import { soloAdmin } from '../src/interface/middlewares/role.middleware.js';
import { errorHandler } from '../src/interface/middlewares/error.handler.js';

const SECRET = 'secreto-solo-para-tests';

// Mini app con rutas dummy: prueba los middlewares sin tocar la base de datos
let app: Express;

beforeAll(() => {
  process.env.JWT_SECRET = SECRET;
  app = express();
  app.get('/protegida', authenticate, (req, res) => {
    res.json({ user: req.user });
  });
  app.delete('/solo-admin', authenticate, soloAdmin, (_req, res) => {
    res.status(204).send();
  });
  app.use(errorHandler);
});

function token(payload: object, options: jwt.SignOptions = { expiresIn: '1h' }, secret = SECRET): string {
  return jwt.sign(payload, secret, options);
}

describe('authenticate', () => {
  it('sin header Authorization -> 401', async () => {
    const res = await request(app).get('/protegida');
    expect(res.status).toBe(401);
  });

  it('formato distinto a "Bearer <token>" -> 401', async () => {
    const res = await request(app).get('/protegida').set('Authorization', `Token ${token({ id: 'u1', role: 'user' })}`);
    expect(res.status).toBe(401);
  });

  it('token basura -> 401', async () => {
    const res = await request(app).get('/protegida').set('Authorization', 'Bearer esto-no-es-un-jwt');
    expect(res.status).toBe(401);
  });

  it('token firmado con otro secreto -> 401', async () => {
    const res = await request(app)
      .get('/protegida')
      .set('Authorization', `Bearer ${token({ id: 'u1', role: 'user' }, { expiresIn: '1h' }, 'otro-secreto')}`);
    expect(res.status).toBe(401);
  });

  it('token vencido -> 401', async () => {
    const vencido = token({ id: 'u1', role: 'user', exp: Math.floor(Date.now() / 1000) - 60 }, {});
    const res = await request(app).get('/protegida').set('Authorization', `Bearer ${vencido}`);
    expect(res.status).toBe(401);
  });

  it('token válido -> pasa y deja req.user = { id, role }', async () => {
    const res = await request(app).get('/protegida').set('Authorization', `Bearer ${token({ id: 'u1', role: 'user' })}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: 'u1', role: 'user' });
  });

  it('el error 401 no expone el stack', async () => {
    const res = await request(app).get('/protegida');
    expect(JSON.stringify(res.body)).not.toContain('at ');
    expect(res.body.error.message).toBeTypeOf('string');
  });
});

describe('soloAdmin', () => {
  it('sin token -> 401 (no 403)', async () => {
    const res = await request(app).delete('/solo-admin');
    expect(res.status).toBe(401);
  });

  it('rol user -> 403', async () => {
    const res = await request(app).delete('/solo-admin').set('Authorization', `Bearer ${token({ id: 'u1', role: 'user' })}`);
    expect(res.status).toBe(403);
  });

  it('rol admin -> pasa', async () => {
    const res = await request(app).delete('/solo-admin').set('Authorization', `Bearer ${token({ id: 'a1', role: 'admin' })}`);
    expect(res.status).toBe(204);
  });
});
