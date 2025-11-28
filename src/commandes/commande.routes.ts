import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { createCommande, listCommandesByUser } from './commande.service';

const router = Router();

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const user = (req as any).user;
    const payload = req.body;

    const commande = await createCommande({
      ...payload,
      userId: user.userId,
    });

    return res.status(201).json(commande);
  } catch (err) {
    next(err);
  }
});

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = (req as any).user;

    const commandes = await listCommandesByUser(user.userId);
    return res.json(commandes);
  } catch (err) {
    next(err);
  }
});

export default router;
