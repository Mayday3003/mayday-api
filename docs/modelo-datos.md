# Modelo de datos

Base de datos PostgreSQL (Supabase), administrada con Prisma. El esquema vive en `prisma/schema.prisma`.

```mermaid
erDiagram
    users ||--o{ interactions : "escribe"
    experiences ||--o{ interactions : "recibe"
    users ||--o{ memory_requests : "propone"
    memory_requests |o--o| experiences : "al aprobarse crea"

    users {
        uuid id PK
        varchar_100 name
        varchar_150 email UK
        text password "hash bcrypt"
        Role role "admin | user"
        timestamp created_at
        timestamp updated_at
    }

    experiences {
        uuid id PK
        varchar_150 title
        ExperienceType type "viaje | situacion | experiencia"
        text description
        text image_url "opcional"
        date date "opcional"
        text_array participants
        timestamp created_at
        timestamp updated_at
    }

    interactions {
        uuid id PK
        text content
        uuid user_id FK
        uuid experience_id FK
        timestamp created_at
        timestamp updated_at
    }

    memory_requests {
        uuid id PK
        varchar_150 title
        ExperienceType type
        text description
        text image_url "opcional"
        date date "opcional"
        text_array participants
        RequestStatus status "pendiente | aprobada | rechazada"
        uuid user_id FK
        uuid experience_id FK "UK, null hasta aprobarse"
        timestamp created_at
        timestamp updated_at
    }
```

## Tablas

| Tabla | Rol en la rúbrica | Notas |
|---|---|---|
| `users` | Usuarios | `email` único; `password` siempre guardado como hash bcrypt; `role` por defecto `user`. |
| `experiences` | Catálogo | Los recuerdos del muro de la Entrega 1 (viajes, situaciones y experiencias). |
| `interactions` | Interacción | Comentario de un usuario sobre un recuerdo. `user_id` sale del token, nunca del body. |
| `memory_requests` | Interacción | Propuesta de recuerdo (formulario principal del muro en la Entrega 1). El admin la aprueba y se crea la experiencia en una transacción. |

Al borrar un usuario o una experiencia, sus comentarios se borran en cascada. Al borrar un usuario se borran sus propuestas; al borrar la experiencia creada desde una propuesta, la propuesta se conserva con `experience_id` en `NULL`.

Índices: `experiences(type)`, `interactions(user_id)`, `interactions(experience_id)`, `memory_requests(user_id)` y `memory_requests(status)`.
