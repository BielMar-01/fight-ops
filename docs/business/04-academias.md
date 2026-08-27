# Academias

## Status
🟢 Implementado

Academia é o tenant principal do FightOps.

## Criação
Usuário autenticado cria uma academia e passa a ser `OWNER`.

## Dados atuais
- nome
- slug
- descrição
- telefone
- e-mail
- logo
- active
- timestamps

## Academia ativa
O frontend mantém uma academia ativa. O identificador pode ser persistido localmente porque não é segredo.

## Usuário sem academia
Recebe onboarding para criar a primeira academia. Após criação, o contexto é atualizado e o dashboard é liberado sem novo login.

## Isolamento
A API valida vínculo ativo e academia ativa antes de permitir operações multi-tenant.
