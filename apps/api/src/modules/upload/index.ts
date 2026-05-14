import { Router } from 'express';
import multer from 'multer';
import { parseStatement } from '../parser';
import { categorizeTransactions } from '../categorizer';
import prisma from '../../prisma';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// Configure multer with memory storage and 10MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

router.use(authenticate);

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileMeta = {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      buffer: req.file.buffer
    };

    // 1. Parse file into base transactions
    const parseResult = await parseStatement(fileMeta);

    // 2. Run categorizer logic
    const categorized = await categorizeTransactions(parseResult.transactions);

    const statement = await prisma.statement.create({
      data: {
        userId: (req as any).user.id,
        filename: req.file!.originalname
      }
    });

    // 3. Batch insert into database
    const dbPayload = categorized.map(t => ({
      statementId: statement.id,
      date: new Date(t.date),
      description: t.description,
      amount: t.amount,
      balance: t.balance !== undefined ? t.balance : null,
      category: t.category,
      tags: t.tags
    }));

    const result = await prisma.transaction.createMany({
      data: dbPayload,
      skipDuplicates: true
    });

    res.json({
      success: true,
      insertedCount: result.count,
      metadata: parseResult.metadata
    });
  } catch (error: any) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: error.message || 'Failed to process file' });
  }
});

export const uploadRouter = router;
