# API e Swagger

Framework: Fastify.  
Validação: Zod.  
Documentação executável: Swagger/OpenAPI.

## Domínios atuais
- base/health;
- autenticação;
- área pública;
- academias;
- membros.

## Padrão de erro
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensagem legível."
  }
}
```

Toda nova rota deve atualizar Swagger e `docs/api/endpoints.md`.
