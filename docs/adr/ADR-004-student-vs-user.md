# ADR-004 — Student separado de User

## Status
Aceito para próxima fase

Academias precisam cadastrar alunos sem obrigar criação de login.

Decisão:
`Student` será entidade operacional separada, com `userId` opcional.

`GymMembership(STUDENT)` representa autorização, não o cadastro operacional.
