import { Router } from 'express';
import { prisma } from '../../prisma';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user!.id },
      orderBy: { date: 'desc' },
      take: 200 // Limiting for UI performance in MVP
    });
    
    const mapped = transactions.map(t => ({
      ...t,
      amount: t.amount.toNumber(),
      balance: t.balance ? t.balance.toNumber() : undefined
    }));
    
    res.json(mapped);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category, tags } = req.body;
    
    const tx = await prisma.transaction.findUnique({ where: { id } });
    if (!tx || tx.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Transaction not found or unauthorized' });
    }
    
    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        category: category !== undefined ? category : tx.category,
        tags: tags !== undefined ? tags : tx.tags
      }
    });
    
    res.json({
      ...updated,
      amount: updated.amount.toNumber(),
      balance: updated.balance ? updated.balance.toNumber() : undefined
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export const transactionRouter = router;
