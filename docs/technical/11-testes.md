# Testes

Backend: Vitest.  
API manual: Postman.

## Validação de endpoint
Registrar:
- método;
- URL;
- params;
- headers;
- body;
- status;
- resposta;
- papel usado.

## Multi-tenant
Todo módulo por academia deve testar tentativa de acesso cruzado entre academias.

## Frontend
Usar `data-testid` estável e semântico.

Exemplos:
- `members-add-button`
- `member-row-{id}`
- `member-manage-button-{id}`

## Fechamento de bloco
- typecheck
- lint
- test
- build
