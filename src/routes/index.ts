import { Router } from "express";
import platsRouter from "../plats/plat.routes";
import pointsRouter from "../points-livraison/point.routes";
import commandesRouter from "../commandes/commande.routes";
import authRouter from '../auth/auth.routes';

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "DeliveCROUS Livraison API" });
});

router.use('/auth', authRouter);
router.use("/plats", platsRouter);
router.use("/points-livraison", pointsRouter);
router.use("/commandes", commandesRouter);

export default router;
