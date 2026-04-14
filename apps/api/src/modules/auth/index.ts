import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import stubTransport from 'nodemailer-stub-transport';
import { RegisterSchema, LoginSchema, ForgotPasswordSchema, ResetPasswordSchema } from 'shared';
import prisma from '../../prisma';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key';

// Dummy mailer using stub transport
const transport = nodemailer.createTransport(stubTransport());

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = RegisterSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash },
    });

    const tokens = generateTokens(user.id);
    return res.status(201).json({ user: { id: user.id, email: user.email }, ...tokens });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Invalid request' });
  }
});

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const tokens = generateTokens(user.id);
    return res.status(200).json({ user: { id: user.id, email: user.email }, ...tokens });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Invalid request' });
  }
});

authRouter.post('/refresh', (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
    const tokens = generateTokens(decoded.userId);
    return res.status(200).json(tokens);
  } catch (error) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

authRouter.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = ForgotPasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const resetToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
      // Stub sending email
      await transport.sendMail({
        from: 'noreply@moneyradar.com',
        to: email,
        subject: 'Password Reset',
        text: `Your password reset token is: ${resetToken}`
      });
      console.log(`[Stub] Password reset email sent to ${email} with token ${resetToken}`);
    }
    // Return 200 even if user doesn't exist for security
    return res.status(200).json({ message: 'If that user exists, a password reset link has been sent.' });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Invalid request' });
  }
});

authRouter.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = ResetPasswordSchema.parse(req.body);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { passwordHash },
    });
    
    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error: any) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }
});
