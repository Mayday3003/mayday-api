import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createAuthRouter } from './interface/routes/authRoutes.js';
import { errorHandler } from './interface/middlewares/errorMiddleware.js';

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Configuración de CORS estricta (no wildcard '*') según exigencia de la rúbrica
app.use(
  cors({
    origin: [FRONTEND_URL, 'http://localhost:3000', 'https://mayday3003.world'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json());

// Endpoint de salud del servidor
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Mayday API REST',
  });
});

// Rutas de Autenticación
app.use('/api/auth', createAuthRouter());

// Manejador global de errores (siempre al final de las rutas)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🌌 Servidor Mayday API corriendo en http://localhost:${PORT}`);
  console.log(`🛡️  CORS configurado para: ${FRONTEND_URL}`);
});

export default app;
