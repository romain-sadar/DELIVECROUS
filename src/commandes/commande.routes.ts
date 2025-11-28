import { Router } from "express";
import {
  createCommande,
  getCommandeById,
  listCommandesByUser,
} from "./commande.service";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const { user_id, point_livraison_id, mode_paiement, items } = req.body;

    if (!user_id || !point_livraison_id || !mode_paiement || !items) {
      return res.status(400).json({
        error: "user_id, point_livraison_id, mode_paiement et items sont requis",
      });
    }

    const commande = await createCommande({
      userId: Number(user_id),
      pointLivraisonId: Number(point_livraison_id),
      modePaiement: mode_paiement,
      items,
    });

    res.status(201).json(commande);
  } catch (err: any) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const userId = req.query.user_id;
    if (!userId) {
      return res
        .status(400)
        .json({ error: "user_id query param is required" });
    }

    const commandes = await listCommandesByUser(Number(userId));
    res.json(commandes);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const commande = await getCommandeById(id);

    if (!commande) {
      return res.status(404).json({ error: "Commande non trouvée" });
    }

    res.json(commande);
  } catch (err) {
    next(err);
  }
});

export default router;
