import { Router } from "express";
import { createPlat, listPlats } from "./plat.service";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const plats = await listPlats();
    res.json(plats);
  } catch (err) {
    next(err);
  }
});


router.post("/", async (req, res, next) => {
  try {
    const { libelle, description, prix, categorie } = req.body;

    if (!libelle || typeof prix !== "number") {
      return res.status(400).json({ error: "libelle and prix are required" });
    }

    const plat = await createPlat({
      libelle,
      description,
      prix,
      categorie,
    });

    res.status(201).json(plat);
  } catch (err) {
    next(err);
  }
});

export default router;
