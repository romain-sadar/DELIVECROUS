import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "DeliveCROUS Livraison API" });
});

export default router;
