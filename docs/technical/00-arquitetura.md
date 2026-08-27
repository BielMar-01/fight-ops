# Arquitetura

## Status
🟢 Base implementada

```text
React/Vite
   ↓ HTTP
Fastify API
   ↓
Prisma
   ↓
Supabase PostgreSQL
```

Monorepo:

```text
fight-ops/
├── apps/api
├── apps/web
├── prisma
├── packages
├── tests
└── docs
```

A Web não acessa o banco diretamente para as regras centrais.

Academia é o tenant. `GymMembership` resolve acesso por tenant.
