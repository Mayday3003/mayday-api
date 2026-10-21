# Mayday API REST (Backend)

API REST robusta desarrollada en Node.js, Express, TypeScript, Prisma ORM y PostgreSQL organizada en 4 capas de arquitectura limpia:
- `src/domain/`: Entidades de negocio, interfaces de repositorios y tipos puros.
- `src/application/`: Casos de uso de autenticación, catálogo de experiencias e interacciones.
- `src/infrastructure/`: Prisma Client singleton, repositorios con Prisma, hashing con Bcrypt y JWT.
- `src/interface/`: Controladores Express, middlewares de autenticación/rol y rutas HTTP.

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
