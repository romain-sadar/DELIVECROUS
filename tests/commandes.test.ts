import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/prismaClient';
import { signAccessToken } from '../src/auth/jwt.utils';
import { hashPassword } from '../src/auth/password.utils';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// On mock entièrement prismaClient pour ne jamais toucher à la vraie DB
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
    $transaction: vi.fn(async (fn: any) => fn(prismaMock)),
  };

  return {
    prisma: prismaMock,
  };
});

const prismaMock = prisma as unknown as {
  user: { findUnique: ReturnType<typeof vi.fn> };
  pointLivraison: { findUnique: ReturnType<typeof vi.fn> };
  plat: { findMany: ReturnType<typeof vi.fn> };
  commande: { create: ReturnType<typeof vi.fn> };
  $transaction: ReturnType<typeof vi.fn>;
};

describe('Commandes API', () => {
  const existingUserId = 1;

  beforeEach(() => {
    vi.clearAllMocks();
    // Sécu : on force la valeur du secret JWT utilisée par l’app ET par le test
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('should create a commande with items and relations', async () => {
    const passwordHash = await hashPassword('Password123!');

    prismaMock.user.findUnique.mockResolvedValue({
      id: existingUserId,
      email: 'test@example.com',
      passwordHash,
      firstName: 'Test',
      lastName: 'User',
      role: 'STUDENT',
      createdAt: new Date(),
    });

    // 2) Le service createCommande va chercher le point de livraison
    prismaMock.pointLivraison.findUnique.mockResolvedValue({
      id: 10,
      nom: 'CROUS A',
      typePoint: 'RESTAURANT',
      adresse: 'Campus',
      latitude: 48.0,
      longitude: 2.0,
      actif: true,
      createdAt: new Date(),
    });

    // 3) Le service va chercher les plats disponibles
    prismaMock.plat.findMany.mockResolvedValue([
      {
        id: 100,
        libelle: 'Pâtes bolognaise',
        description: 'Pâtes avec sauce bolognaise',
        prix: 7.5,
        categorie: 'Plat',
        disponible: true,
        createdAt: new Date(),
      },
    ]);

    // 4) Et créer la commande
    prismaMock.commande.create.mockResolvedValue({
      id: 1,
      userId: existingUserId,
      pointLivraisonId: 10,
      statut: 'PENDING',
      total: 15,
      modePaiement: 'CB',
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: 1,
          commandeId: 1,
          platId: 100,
          quantite: 2,
          prixUnitaire: 7.5,
        },
      ],
      pointLivraison: {
        id: 10,
        nom: 'CROUS A',
        typePoint: 'RESTAURANT',
        adresse: 'Campus',
        latitude: 48.0,
        longitude: 2.0,
        actif: true,
        createdAt: new Date(),
      },
    });

    const payload = {
      pointLivraisonId: 10,
      modePaiement: 'CB',
      items: [
        {
          plat_id: 100,
          quantite: 2,
        },
      ],
    };

    // 5) On génère un vrai access token comme en prod
    const token = signAccessToken(existingUserId);

    // 6) On appelle l’API avec le header Authorization
    const res = await request(app)
      .post('/api/commandes')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(201);

    expect(res.body).toMatchObject({
      id: 1,
      statut: 'PENDING',
      total: 15,
      pointLivraison: {
        id: 10,
        nom: 'CROUS A',
      },
    });

    // Vérifier les appels aux mocks (= relation + logique métier)
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.pointLivraison.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.plat.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.commande.create).toHaveBeenCalledTimes(1);
  });
});
