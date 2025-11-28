import { Router } from "express";
import platsRouter from "../plats/plat.routes";
import pointsRouter from "../points-livraison/point.routes";
import commandesRouter from "../commandes/commande.routes";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "DeliveCROUS Livraison API" });
});

router.use("/plats", platsRouter);
router.use("/points-livraison", pointsRouter);
router.use("/commandes", commandesRouter);

export default router;
