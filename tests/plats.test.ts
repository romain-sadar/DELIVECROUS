import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';

vi.mock('../src/prismaClient', () => {
  const prismaMock: any = {
    plat: {
      create: vi.fn(),
    },
  };

  prismaMock.$transaction = vi.fn(async (cb: any) => {
    if (typeof cb === 'function') {
      return cb(prismaMock);
    }
    return Promise.all(cb);
  });

  return { prisma: prismaMock };
});

import app from '../src/app';
import { prisma } from '../src/prismaClient';

describe('Plats API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a plat with valid payload', async () => {
    const payload = {
      libelle: 'Pâtes bolognaise',
      description: 'Pâtes sauce bolognaise au RU',
      prix: 6.5,
      categorie: 'Plat chaud',
      disponible: true,
    };

    const prismaMock = prisma as any;

    prismaMock.plat.create.mockResolvedValue({
      id: 1,
      ...payload,
    });

    const res = await request(app)
      .post('/api/plats')
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: 1,
      libelle: 'Pâtes bolognaise',
      description: 'Pâtes sauce bolognaise au RU',
      prix: 6.5,
      categorie: 'Plat chaud',
      disponible: true,
    });

    expect(prismaMock.plat.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.plat.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          libelle: payload.libelle,
          description: payload.description,
          prix: payload.prix,
          categorie: payload.categorie,
          disponible: payload.disponible,
        }),
      }),
    );
  });

  it('should reject invalid plat payload (missing libelle)', async () => {
    const payload = {
      description: 'Sans libellé',
      prix: 6.5,
      categorie: 'Plat chaud',
      disponible: true,
    };

    const res = await request(app)
      .post('/api/plats')
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
