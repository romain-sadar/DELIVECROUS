import { prisma } from "../prismaClient";

export async function listPlats() {
  return prisma.plat.findMany({
    where: { disponible: true },
    orderBy: { createdAt: "desc" },
  });
}

export type CreatePlatInput = {
  libelle: string;
  description?: string;
  prix: number;
  categorie?: string;
};

export async function createPlat(input: CreatePlatInput) {
  const { libelle, description, prix, categorie } = input;
  return prisma.plat.create({
    data: {
      libelle,
      description,
      prix,
      categorie,
      disponible: true,
    },
  });
}
