import { prisma } from "../prismaClient";

export async function listPointsLivraison() {
  return prisma.pointLivraison.findMany({
    where: { actif: true },
    orderBy: { nom: "asc" },
  });
}

export type CreatePointLivraisonInput = {
  nom: string;
  typePoint: string;
  adresse?: string;
  latitude?: number;
  longitude?: number;
};

export async function createPointLivraison(input: CreatePointLivraisonInput) {
  const { nom, typePoint, adresse, latitude, longitude } = input;
  return prisma.pointLivraison.create({
    data: {
      nom,
      typePoint,
      adresse,
      latitude,
      longitude,
      actif: true,
    },
  });
}
