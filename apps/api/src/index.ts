import express from 'express';
import cors from 'cors';
import { authRouter } from './modules/auth';
import { transactionRouter } from './modules/transactions';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use('/api/auth', authRouter);
app.use('/api/transactions', transactionRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
