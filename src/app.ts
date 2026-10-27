import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './interface/routers/auth.router.js';
import experienceRoutes from './interface/routers/experiences.router.js';
import interactionRoutes from './interface/routers/interactions.router.js';
import memoryRequestRoutes from './interface/routers/memory-requests.router.js';
import { errorHandler, notFoundHandler } from './interface/middlewares/error.handler.js';

// Sin JWT_SECRET la API no debe arrancar: no hay forma segura de firmar tokens
if (!process.env.JWT_SECRET) {
  console.error('❌ Falta la variable de entorno JWT_SECRET');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Sin '/' final: el navegador manda el Origin sin él y la comparación es exacta
const normalize = (url: string) => url.trim().replace(/\/+$/, '');

// CORS estricto (no wildcard '*') según exigencia de la rúbrica.
// Los dominios de producción van fijos; CORS_ORIGINS agrega otros separados por coma (p. ej. el *.vercel.app)
const ALLOWED_ORIGINS = [
  ...new Set(
    [
      FRONTEND_URL,
      'http://localhost:3000',
      'https://mayday3003.world',
      'https://www.mayday3003.world',
      ...(process.env.CORS_ORIGINS ?? '').split(','),
    ]
      .map(normalize)
      .filter(Boolean)
  ),
];

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
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

// Rutas inexistentes -> 404
app.use(notFoundHandler);

// Manejador global de errores (siempre al final de las rutas)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🌌 Servidor Mayday API corriendo en http://localhost:${PORT}`);
  console.log(`🛡️  CORS configurado para: ${ALLOWED_ORIGINS.join(', ')}`);
});

export default app;
