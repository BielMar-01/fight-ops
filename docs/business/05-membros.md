# Gestão de Membros

## Status
🟢 Implementado

Membro = `User + Gym + role + active`.

## Pré-condição atual
Para ser adicionado como membro, o usuário já precisa possuir conta FightOps.

## Recursos
- listar membros;
- resumo de total/ativos/inativos;
- adicionar;
- alterar papel;
- ativar/inativar;
- atualização da lista sem F5;
- RBAC visual e de backend.

## Regras
OWNER:
- adiciona ADMIN, RECEPTIONIST, PROFESSOR e STUDENT;
- gerencia vínculos permitidos.

ADMIN:
- adiciona RECEPTIONIST, PROFESSOR e STUDENT;
- não cria/administra ADMIN;
- não altera OWNER.

Outras regras:
- não duplicar vínculo `(userId, gymId)`;
- usuário inativo não deve ser vinculado;
- OWNER não é inativado pela operação comum;
- ADMIN não gerencia ADMIN;
- e-mail inexistente não cria vínculo.
