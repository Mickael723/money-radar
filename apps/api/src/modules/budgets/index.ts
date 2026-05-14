import { Router } from 'express';
import prisma from '../../prisma';
import { authenticate } from '../../middleware/authenticate';

const router = Router();
router.use(authenticate);

// GET /api/budgets
router.get('/', async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const where: any = { userId: (req as any).user.id };
    if (month) where.month = parseInt(month as string, 10);
    if (year) where.year = parseInt(year as string, 10);

    const budgets = await prisma.budget.findMany({
      where
    });
    
    res.json({ budgets });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch budgets' });
  }
});

// PUT /api/budgets/:category
router.put('/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit, month, year } = req.body;

    if (limit === undefined || !month || !year) {
      return res.status(400).json({ error: 'Missing required fields: limit, month, year' });
    }

    const userId = (req as any).user.id;

    const budget = await prisma.budget.upsert({
      where: {
        userId_category_month_year: {
          userId,
          category,
          month: parseInt(month, 10),
          year: parseInt(year, 10)
        }
      },
      update: {
        limit: limit
      },
      create: {
        userId,
        category,
        limit: limit,
        month: parseInt(month, 10),
        year: parseInt(year, 10)
      }
    });

    res.json({ budget });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to upsert budget' });
  }
});

export const budgetRouter = router;
