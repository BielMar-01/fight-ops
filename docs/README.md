# FightOps — Documentação

A documentação do FightOps é separada em cinco áreas:

- `business/`: regras de negócio e comportamento esperado.
- `technical/`: implementação, arquitetura, banco, segurança e deploy.
- `api/`: visão consolidada dos contratos HTTP.
- `adr/`: decisões arquiteturais.
- `process/`: workflow e Definition of Done.

## Status atual

| Área | Status |
|---|---|
| Fundação do monorepo | 🟢 |
| API base / Swagger / segurança | 🟢 |
| PostgreSQL / Supabase / Prisma | 🟢 |
| Autenticação e sessão | 🟢 |
| Recuperação de senha por código | 🟢 |
| Área pública dinâmica | 🟢 base |
| Academias | 🟢 |
| RBAC por academia | 🟢 |
| Membros | 🟢 |
| Academia ativa + onboarding | 🟢 |
| Alunos | 🟡 próxima fase |
| Professores | ⚪ |
| Turmas | ⚪ |
| Financeiro | ⚪ |
| Graduações/faixas | ⚪ |
| Super Admin | ⚪ |

Toda nova feature deve atualizar negócio, técnica, API, testes e ADR quando necessário.
