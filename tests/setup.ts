import { vi } from 'vitest';

vi.mock('../src/prismaClient', () => {
  let plats: any[] = [];
  let users: any[] = [];
  let points: any[] = [];
  let commandes: any[] = [];

  return {
    prisma: {
      user: {
        create: vi.fn().mockImplementation(async ({ data }) => {
          const user = { id: users.length + 1, ...data };
          users.push(user);
          return user;
        }),
      },
      plat: {
        create: vi.fn().mockImplementation(async ({ data }) => {
          const plat = { id: plats.length + 1, ...data };
          plats.push(plat);
          return plat;
        }),
        findUnique: vi.fn().mockImplementation(async ({ where }) => {
          return plats.find((p) => p.id === where.id) ?? null;
        }),
      },
      pointLivraison: {
        create: vi.fn().mockImplementation(async ({ data }) => {
          const point = { id: points.length + 1, ...data };
          points.push(point);
          return point;
        }),
      },
      commande: {
        create: vi.fn().mockImplementation(async ({ data }) => {
          const commande = {
            id: commandes.length + 1,
            ...data,
          };
          commandes.push(commande);
          return commande;
        }),
      },
      $reset: () => {
        plats = [];
        users = [];
        points = [];
        commandes = [];
      },
    },
  };
});
