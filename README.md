# Mayday API

API REST de **Mayday · Bitácora y muro de recuerdos** ([mayday3003.world](https://mayday3003.world)). Gestiona usuarios, el catálogo de recuerdos (experiencias), los comentarios y las propuestas de nuevos recuerdos.

| | |
|---|---|
| API en producción | https://mayday-api-v9ls.onrender.com ([`/health`](https://mayday-api-v9ls.onrender.com/health)) |
| Frontend | https://www.mayday3003.world (Vercel) |
| Repo del frontend | https://github.com/Mayday3003/mayday-web |

> La API está en el plan gratuito de Render: después de 15 minutos sin uso se duerme y la primera petición tarda unos 50 segundos.

## Stack

Node.js 22 · Express 4 · TypeScript (estricto, sin `any`) · Prisma 6 · PostgreSQL en Supabase · JWT · bcrypt · class-validator · multer + Supabase Storage · Vitest + Supertest.

## Arquitectura

El código está en 4 capas. Cada capa solo conoce a la de abajo, y Prisma solo aparece en `infrastructure/`.

```
petición → router → middlewares (auth, rol, validación) → controller → use case → repository → Prisma → PostgreSQL
```

```
src/
├── app.ts                    # arranque: CORS, JSON, rutas, 404 y manejador de errores
├── domain/                   # tipos puros, sin dependencias
│   ├── models/               # User, Experience, Interaction, MemoryRequest, Pagination
│   ├── repository/           # contratos I*.repository.ts
│   └── services/             # contrato IStorage.service.ts
├── application/              # reglas de negocio
│   ├── errors/               # un error por código HTTP (400, 401, 403, 404, 409)
│   └── *.use-case.ts         # auth, experiences, interactions, memory-requests
├── infrastructure/           # detalles técnicos
│   ├── dtos/                 # validación de body, query y params con class-validator
│   ├── repository/           # client.ts (Prisma) y *.pg.repository.ts
│   └── services/             # bcrypt, jwt, email (Resend) y storage (Supabase)
└── interface/                # HTTP
    ├── controllers/
    ├── middlewares/          # auth, role (soloAdmin), validate, upload, error.handler
    └── routers/
```

## Modelo de datos

Cuatro tablas: `users`, `experiences` (catálogo), `interactions` (comentarios) y `memory_requests` (propuestas de recuerdo). El diagrama completo está en [docs/modelo-datos.md](docs/modelo-datos.md).

## Endpoints

Todas las rutas empiezan por `/api`. Los errores responden `{ error: { message, statusCode, fields? } }`; `fields` trae el mensaje de cada campo inválido.

### Auth
| Método | Ruta | Acceso | Respuestas |
|---|---|---|---|
| POST | `/auth/register` | público | 201 `{ token, user }` · 400 · 409 email repetido |
| POST | `/auth/login` | público | 200 `{ token, user }` · 400 · 401 credenciales inválidas |
| POST | `/auth/forgot-password` | público | 200 (misma respuesta exista o no el email) |
| POST | `/auth/reset-password` | público | 200 · 400 |

### Experiencias (catálogo)
| Método | Ruta | Acceso | Respuestas |
|---|---|---|---|
| GET | `/experiencias` | público | 200 `{ pagination, data }` · 400 |
| GET | `/experiencias/meta` | público | 200 `{ types, participants }` |
| GET | `/experiencias/:id` | público | 200 (con comentarios) · 400 · 404 |
| POST | `/experiencias` | admin | 201 · 400 · 401 · 403 |
| PUT | `/experiencias/:id` | admin | 200 · 400 · 401 · 403 · 404 |
| DELETE | `/experiencias/:id` | admin o quien propuso el recuerdo | 204 (borra también su propuesta, foto y comentarios) · 401 · 403 · 404 |
| POST | `/experiencias/:id/imagen` | admin | 200 · 400 · 401 · 403 · 404 |

Query de `GET /experiencias`, combinables: `page` (≥ 1), `limit` (1–50), `search` (título o descripción), `type` (`viaje`, `situacion`, `experiencia`), `participant`, `from` y `to` (`AAAA-MM-DD`).

La imagen se envía como `multipart/form-data` en el campo `image` (JPG, PNG, WEBP o GIF, máximo 10 MB).

### Comentarios (interacción)
| Método | Ruta | Acceso | Respuestas |
|---|---|---|---|
| POST | `/interacciones` | usuario autenticado | 201 · 400 · 401 · 404 |
| GET | `/interacciones/mias` | usuario autenticado | 200 |
| GET | `/interacciones` | admin | 200 · 401 · 403 |

### Propuestas de recuerdo
| Método | Ruta | Acceso | Respuestas |
|---|---|---|---|
| POST | `/propuestas` | usuario autenticado | 201 · 400 · 401 |
| GET | `/propuestas/mias` | usuario autenticado | 200 |
| DELETE | `/propuestas/:id` | autor o admin | 204 · 401 · 403 · 404 · 409 ya aprobada (se borra desde el recuerdo) |
| POST | `/propuestas/:id/imagen` | autor de la propuesta | 200 · 400 · 401 · 403 no es el autor · 404 · 409 ya revisada |
| GET | `/propuestas?status=` | admin | 200 · 400 · 403 |
| PATCH | `/propuestas/:id/aprobar` | admin | 200 (crea la experiencia) · 403 · 404 · 409 ya revisada |
| PATCH | `/propuestas/:id/rechazar` | admin | 200 · 403 · 404 · 409 ya revisada |

La foto de una propuesta se sube desde el dispositivo igual que la de una experiencia (`multipart/form-data`, campo `image`) y queda en el bucket bajo `propuestas/<id>/`. Si se aprueba, la experiencia usa esa misma foto; si se rechaza, se borra del bucket.

La colección de Bruno con todas estas peticiones está en [`mayday-collection/`](mayday-collection), con entornos `produccion` y `local`.

## Credenciales de prueba

| Rol | Email | Contraseña |
|---|---|---|
| admin | `admin@mayday3003.world` | `AdminMayday2026*` |
| user | `evaluador@mayday3003.world` | `UserMayday2026*` |

## Correr en local

```bash
npm install
cp .env.example .env          # completar con los datos de Supabase
npx prisma migrate deploy     # aplica las migraciones
npm run db:seed               # carga datos solo si la base está vacía (db:seed:reset para recargar)
npm run dev                   # http://localhost:4000
npm test                      # pruebas de los middlewares de auth y rol
```

## Variables de entorno

| Variable | Para qué |
|---|---|
| `PORT` | Puerto del servidor (Render lo asigna solo) |
| `DATABASE_URL` | Conexión a PostgreSQL por el pooler de Supabase (puerto 6543) |
| `DIRECT_URL` | Conexión directa, la usa Prisma para las migraciones (puerto 5432) |
| `JWT_SECRET` | Secreto para firmar los tokens; la API no arranca sin él |
| `JWT_EXPIRES_IN` | Duración del token (`1d` en producción) |
| `FRONTEND_URL` | URL del frontend: enlace de restablecer contraseña y origen permitido por CORS |
| `CORS_ORIGINS` | Orígenes extra para CORS, separados por coma (`mayday3003.world` y `www.mayday3003.world` ya están fijos) |
| `RESEND_API_KEY` | Correos de bienvenida y de recuperación de contraseña |
| `SUPABASE_URL` · `SUPABASE_SERVICE_ROLE_KEY` · `SUPABASE_BUCKET` | Subida de imágenes a Supabase Storage |

## Despliegue

Render (Web Service) con auto-deploy desde `main`. Build command: `npm run render:build`, que instala dependencias, compila, aplica las migraciones y corre el seed (que no borra nada si la base ya tiene datos). Start command: `npm start`. Health check: `/health`.

## Decisiones técnicas

<!--
  ESTA SECCIÓN LA ESCRIBES TÚ, con tus palabras (el profe lo pide sin IA).
  Preguntas guía; borra este comentario cuando termines:

  1. Flujo de login: ¿qué pasa desde que mandas email y contraseña hasta que una ruta
     protegida (ej. POST /api/interacciones) te responde? (bcrypt.compare, firma del JWT,
     header Authorization, authenticate, req.user)
  2. 401 vs 403: explícalo con DELETE /api/experiencias/:id sin token y con token de user.
  3. ¿Por qué el userId de un comentario o propuesta sale del token y no del body?
  4. ¿Por qué el payload del JWT solo lleva id y role?
  5. ¿Por qué la interacción tiene dos formas (comentario y propuesta) y cómo se conectan
     con los formularios del muro de la Entrega 1?
  6. Uso de IA: qué te generó y qué corregiste o decidiste tú. Ideas de este proyecto:
     el `any` del repositorio, el registro que aceptaba role, ?page=abc que daba NaN,
     la contraseña mínima de 8, la reestructura a la nomenclatura del curso.
-->

## Historia del repositorio

Este backend nació dentro del monorepo [WebDevelopment](https://github.com/Mayday3003/WebDevelopment) (carpeta `backend/`, rama `pagina-web`) entre el 29 de septiembre y el 1 de octubre de 2026. El 21 de octubre se separó en este repositorio conservando sus commits originales (`git filter-branch --subdirectory-filter backend`, equivalente a `git subtree split`), por eso los primeros commits tienen fechas anteriores a la creación del repo.
