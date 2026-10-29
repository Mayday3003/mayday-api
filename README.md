# Mayday API

API REST de **Mayday** ([mayday3003.world](https://mayday3003.world)). Gestiona usuarios, el catálogo de recuerdos (experiencias), los comentarios y las propuestas de nuevos recuerdos.

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



### Flujo del login hasta una ruta protegida

Cuando llega `POST /api/auth/login` con email y contraseña, la API busca el usuario y compara la contraseña con el hash guardado usando `bcrypt.compare`. Si coinciden, firma un JWT con `jwt.sign` (con el secreto y la expiración de las variables de entorno) y responde `{ token, user }`. Después, en una ruta protegida como `POST /api/interacciones`, el middleware `authenticate` lee el header `Authorization: Bearer <token>`, verifica la firma y la expiración, y deja `req.user = { id, role }` para el controlador y el caso de uso.

### 401 vs 403

- **401 Unauthorized**: no hay sesión válida. Por ejemplo, `DELETE /api/experiencias/:id` sin token, o con un token falso o expirado.
- **403 Forbidden**: la API sabe quién soy, pero no tengo permiso. El mismo `DELETE` con el token de un usuario con rol `user` que no propuso ese recuerdo responde 403, porque solo pueden borrar el admin o quien lo propuso.

Un caso especial: si el token es válido pero el usuario ya fue borrado, se responde 401 y no 400, porque en realidad ya no hay una sesión válida.

### El userId sale del token, no del body

Al crear un comentario o una propuesta, el autor se toma de `req.user.id`. Si se leyera del body, cualquiera podría mandar el id de otra persona y publicar a su nombre. El token está firmado por el servidor, así que no se puede falsificar sin conocer el secreto.

### Por qué el payload del JWT solo lleva id y role

El payload de un JWT no está cifrado, solo firmado: cualquiera puede decodificarlo y leerlo. Por eso no lleva datos sensibles como el email o la contraseña. Con `id` y `role` basta para saber quién es y qué permisos tiene; el resto se consulta en la base de datos cuando hace falta.

### Dos formas de interacción: comentario y propuesta

El usuario puede participar de dos maneras: comentar un recuerdo que ya existe en el catálogo (`/api/interacciones`) o proponer un recuerdo nuevo (`/api/propuestas`), que el admin revisa antes de publicarlo. Cada una corresponde a uno de los formularios del muro de la Entrega 1, que ahora se guardan en la base de datos asociados al usuario del token.

### Uso de IA

Se usó Claude Code en buena parte del backend, pero siempre revisando lo que generaba y corrigiendo lo que no cumplía con la entrega o tenía problemas de seguridad. Algunos ejemplos:

- **Tipos `any` en el repositorio**: el código generado usaba `any`; los reemplacé por tipos concretos para que TypeScript detectara errores.
- **El registro aceptaba `role`**: cualquiera podía registrarse mandando `"role": "admin"` en el body. Lo corregí para que el rol siempre sea `user`.
- **`?page=abc` daba `NaN`**: la paginación no validaba los parámetros; ahora se validan y se usa un valor por defecto.
- **Contraseña mínima de 8 caracteres**: agregué esa validación al registro.
- **Nomenclatura del curso**: reestructuré el proyecto para que las carpetas y nombres siguieran la arquitectura vista en clase.

Con esto aprendí que la IA acelera mucho el trabajo, pero no reemplaza revisar el código: varios de estos errores eran de seguridad y no se notaban hasta probar casos atípicos.

## Historia del repositorio

Este backend nació dentro del monorepo [WebDevelopment](https://github.com/Mayday3003/WebDevelopment) (carpeta `backend/`, rama `pagina-web`) entre el 29 de septiembre y el 1 de octubre de 2026. El 21 de octubre se separó en este repositorio conservando sus commits originales (`git filter-branch --subdirectory-filter backend`, equivalente a `git subtree split`), por eso los primeros commits tienen fechas anteriores a la creación del repo.
