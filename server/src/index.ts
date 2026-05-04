import express from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config/env';
import publicRoutes from './routes/publicRoutes';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()),
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// API
app.use('/api', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// 404 + errors
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  console.log(`   Env: ${env.NODE_ENV}`);
  console.log(`   CORS origin: ${env.CORS_ORIGIN}`);
  console.log(`   Upload provider: ${env.UPLOAD_PROVIDER}`);
});
