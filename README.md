# FightOps

Plataforma SaaS para gestão de academias e centros de treinamento de artes marciais.

## Objetivo

O FightOps será uma plataforma multi-tenant para gestão de academias e CTs.

Funcionalidades previstas:

- usuários;
- academias/CTs;
- alunos;
- professores;
- modalidades;
- graduações;
- aulas;
- presenças;
- planos;
- assinaturas;
- pagamentos;
- financeiro;
- avisos;
- relatórios;
- auditoria;
- LGPD;
- administração global.

## Arquitetura

```text
React PWA
   |
   | REST API
   v
Node.js / Fastify
   |
   | Prisma
   v
PostgreSQL / Supabase
```
