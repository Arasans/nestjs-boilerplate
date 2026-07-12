# NestJS DDD Boilerplate

NestJS monorepo boilerplate with **Domain-Driven Design** architecture, CQRS, MongoDB, Redis, and JWT authentication.

## Tech Stack

- **NestJS 11** — Framework
- **MongoDB** (Mongoose 9) — Database
- **Redis** (ioredis) — Cache + BullMQ job queue
- **Passport JWT** — Authentication (access + refresh tokens)
- **CQRS** — Command/Query separation
- **Swagger** — Auto-generated API docs
- **pnpm** — Package manager

## Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Docker & Docker Compose (for local MongoDB + Redis)

## Quick Start

```bash
# 1. Clone
git clone <repo-url> my-project
cd my-project

# 2. Install dependencies
pnpm install

# 3. Start infrastructure
docker compose up -d

# 4. Configure environment
cp .env.example .env
# Edit .env if needed (defaults work with docker-compose)

# 5. Run
pnpm start:dev

# 6. Open Swagger
open http://localhost:3000/api
```

## Project Structure

```
├── apps/
│   └── internal/src/
│       ├── main.ts                    # Bootstrap
│       ├── app.module.ts              # Root module
│       ├── auth/                      # Auth bounded context
│       │   ├── domain/                # Auth service, cache, types
│       │   ├── application/           # Commands, queries, DTOs
│       │   ├── infrastructure/        # Strategies, guards, schemas
│       │   └── presentation/          # Controller
│       └── example/                   # Example CRUD module (template)
│           ├── domain/                # Entity, repository port, service
│           ├── application/           # Commands, queries, DTOs
│           ├── infrastructure/        # Schema, repository impl
│           └── presentation/          # Controller
├── libs/
│   ├── common/                        # Shared utilities
│   └── validator/                     # Custom validators
├── docker-compose.yml                 # MongoDB + Redis
└── .env.example                       # Environment template
```

### DDD Layers

| Layer | Responsibility | Dependencies |
|---|---|---|
| **Domain** | Business logic, entities, repository interfaces | None (pure) |
| **Application** | DTOs, CQRS commands/queries, handlers | Domain |
| **Infrastructure** | Mongoose schemas, repository implementations | Domain, Mongoose |
| **Presentation** | HTTP controllers, route guards | Application |

## Adding a New Module

1. **Copy** the `example/` directory and rename
2. **Domain layer**: Define your entity, repository interface, and service
3. **Infrastructure**: Create Mongoose schema and repository implementation
4. **Application**: Define DTOs, commands, and queries
5. **Presentation**: Create controller with routes
6. **Wire up**: Create `{module}.module.ts` and add to `app.module.ts`

Key pattern:
```typescript
// Module wiring — repository DI
providers: [
  { provide: IYourRepository, useClass: MongoYourRepository },
  YourService,
  ...YourCommandsHandlers,
  ...YourQueriesHandlers,
]
```

## Available Scripts

| Script | Description |
|---|---|
| `pnpm start:dev` | Start app in watch mode |
| `pnpm build` | Build for production |
| `pnpm start:prod` | Run production build |
| `pnpm test` | Run unit tests |
| `pnpm test:cov` | Tests with coverage |
| `pnpm lint` | Lint with auto-fix |
| `pnpm format` | Format with Prettier |

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `APP_PORT` | HTTP server port | `3000` |
| `CORS_ORIGIN` | Allowed CORS origin | `*` |
| `MONGO_URI` | MongoDB connection string | — |
| `REDIS` | Redis URL | — |
| `AT_SECRET` | JWT access token secret | — |
| `RT_SECRET` | JWT refresh token secret | — |

## API Endpoints

### Auth
- `POST /auth/login` — Login (public)
- `POST /auth/refresh` — Refresh tokens
- `GET /auth/me` — Current user info
- `POST /auth/reset-password` — Reset password (rate-limited)

### Examples (CRUD template)
- `GET /examples` — List with cursor pagination
- `GET /examples/:id` — Get one
- `POST /examples` — Create
- `PATCH /examples/:id` — Update
- `PATCH /examples/:id/toggle` — Toggle active status
- `DELETE /examples/:id` — Delete
