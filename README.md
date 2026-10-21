# Mayday API REST (Backend)

API REST robusta desarrollada en Node.js, Express, TypeScript, Prisma ORM y PostgreSQL organizada en 4 capas de arquitectura limpia:
- `src/domain/`: modelos (`models/`) e interfaces de repositorio (`repository/`), sin dependencias externas.
- `src/application/`: casos de uso (`auth`, `experiences`, `interactions` .use-case.ts) y errores HTTP (`errors/`).
- `src/infrastructure/`: DTOs con class-validator (`dtos/`), repositorios Prisma (`repository/`) y servicios bcrypt, JWT y correo (`services/`).
- `src/interface/`: controladores, routers y middlewares (autenticación, rol y manejo de errores).

Modelo de datos: [docs/modelo-datos.md](docs/modelo-datos.md).

## Configuración y ejecución local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Generar cliente de Prisma y ejecutar migraciones
npx prisma generate
npx prisma migrate dev

# 4. Cargar datos semilla (admin, usuario de prueba y catálogo)
npm run db:seed

# 5. Iniciar servidor de desarrollo
npm run dev
```
