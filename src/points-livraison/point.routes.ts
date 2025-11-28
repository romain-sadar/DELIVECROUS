import { Router } from "express";
import {
  createPointLivraison,
  listPointsLivraison,
} from "./point.service";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const points = await listPointsLivraison();
    res.json(points);
  } catch (err) {
    next(err);
  }
});


router.post("/", async (req, res, next) => {
  try {
    const { nom, typePoint, adresse, latitude, longitude } = req.body;

    if (!nom || !typePoint) {
      return res
        .status(400)
        .json({ error: "nom and typePoint are required" });
    }

    const point = await createPointLivraison({
      nom,
      typePoint,
      adresse,
      latitude,
      longitude,
    });

    res.status(201).json(point);
  } catch (err) {
    next(err);
  }
});

export default router;
