import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';

vi.mock('../src/prismaClient', () => {
  const prismaMock: any = {
    user: {
      findUnique: vi.fn(),
    },
    pointLivraison: {
      findUnique: vi.fn(),
    },
    plat: {
      findMany: vi.fn(),
    },
    commande: {
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

describe('Commandes API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a commande with items and relations', async () => {
    const payload = {
      user_id: 1,
      point_livraison_id: 1,
      mode_paiement: 'CB',
      items: [
        { plat_id: 42, quantite: 2 },
      ],
    };

    const prismaMock = prisma as any;

    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
    });

    prismaMock.pointLivraison.findUnique.mockResolvedValue({
      id: 1,
      nom: 'CROUS A',
      actif: true,
    });

    prismaMock.plat.findMany.mockResolvedValue([
      {
        id: 42,
        prix: 7.5,
        disponible: true,
      },
    ]);

    prismaMock.commande.create.mockResolvedValue({
      id: 1,
      userId: 1,
      pointLivraisonId: 1,
      statut: 'PENDING',
      modePaiement: 'CB',
      total: 15,
      items: [
        {
          id: 1,
          platId: 42,
          quantite: 2,
          prixUnitaire: 7.5,
        },
      ],
      pointLivraison: {
        id: 1,
        nom: 'CROUS A',
        actif: true,
      },
    });

    const res = await request(app)
      .post('/api/commandes')
      .send(payload);

    expect(res.status).toBe(201);

    expect(res.body).toMatchObject({
      id: 1,
      statut: 'PENDING',
      total: 15,
    });

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.pointLivraison.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.plat.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.commande.create).toHaveBeenCalledTimes(1);
  });
});
