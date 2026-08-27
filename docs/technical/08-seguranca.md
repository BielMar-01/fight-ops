# Segurança

## API
- Helmet
- CORS
- rate limit
- redaction de authorization/cookies nos logs

CORS deve suportar os métodos usados:
GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS.

Headers permitidos:
- Content-Type
- Authorization
- Accept

## Segredos
Nunca versionar:
- JWT secrets;
- senhas;
- SMTP/API keys;
- URLs de banco com credenciais.

`.env.example` usa placeholders.

GitHub Push Protection já detectou segredo real durante o projeto; qualquer segredo exposto deve ser rotacionado e removido do histórico local antes do push.
