import { prisma } from "../prismaClient";

export type CreateCommandeItemInput = {
  plat_id: number;
  quantite: number;
};

export type CreateCommandeInput = {
  userId: number;
  pointLivraisonId: number;
  modePaiement: string;
  items: CreateCommandeItemInput[];
};

export async function createCommande(input: CreateCommandeInput) {
  const { userId, pointLivraisonId, modePaiement, items } = input;

  if (!items || items.length === 0) {
    throw new Error("La commande doit contenir au moins un plat.");
  }

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error("Utilisateur introuvable.");
    }

    const point = await tx.pointLivraison.findUnique({
      where: { id: pointLivraisonId },
    });
    if (!point || !point.actif) {
      throw new Error("Point de livraison invalide ou inactif.");
    }

    const platIds = items.map((i) => i.plat_id);
    const plats = await tx.plat.findMany({
      where: { id: { in: platIds }, disponible: true },
    });

    if (plats.length !== platIds.length) {
      throw new Error("Un ou plusieurs plats sont indisponibles.");
    }

    let total = 0;
    const itemsData = items.map((item) => {
      const plat = plats.find((p) => p.id === item.plat_id)!;
      const prix = Number(plat.prix);
      total += prix * item.quantite;

      return {
        platId: item.plat_id,
        quantite: item.quantite,
        prixUnitaire: prix,
      };
    });

    const commande = await tx.commande.create({
      data: {
        userId,
        pointLivraisonId,
        statut: "PENDING",
        modePaiement,
        total,
        items: {
          create: itemsData,
        },
      },
      include: {
        items: true,
        pointLivraison: true,
      },
    });

    return commande;
  });
}

export async function listCommandesByUser(userId: number) {
  return prisma.commande.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          plat: true,
        },
      },
      pointLivraison: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getCommandeById(id: number) {
  return prisma.commande.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          plat: true,
        },
      },
      pointLivraison: true,
      user: true,
    },
  });
}
