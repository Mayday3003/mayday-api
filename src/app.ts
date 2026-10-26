import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './interface/routers/auth.router.js';
import experienceRoutes from './interface/routers/experiences.router.js';
import interactionRoutes from './interface/routers/interactions.router.js';
import memoryRequestRoutes from './interface/routers/memory-requests.router.js';
import { errorHandler } from './interface/middlewares/error.handler.js';

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Configuración de CORS estricta (no wildcard '*') según exigencia de la rúbrica
app.use(
  cors({
    origin: [FRONTEND_URL, 'http://localhost:3000', 'https://mayday3003.world'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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

// Rutas de la API REST
app.use('/api/auth', authRoutes);
app.use('/api/experiencias', experienceRoutes);
app.use('/api/interacciones', interactionRoutes);
app.use('/api/propuestas', memoryRequestRoutes);

// Manejador global de errores (siempre al final de las rutas)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🌌 Servidor Mayday API corriendo en http://localhost:${PORT}`);
  console.log(`🛡️  CORS configurado para: ${FRONTEND_URL}`);
});

export default app;
