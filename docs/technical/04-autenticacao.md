# Autenticação

## Estratégia
- hash de senha com bcrypt;
- access token JWT;
- refresh/sessão persistida;
- cookie HttpOnly quando aplicável;
- revogação no logout.

## Endpoints principais
- POST `/auth/register`
- POST `/auth/login`
- POST `/auth/refresh`
- POST `/auth/logout`
- GET `/auth/me`
- fluxo de password reset

Não armazenar access/refresh token em `localStorage`.

`fightops.activeGymId` pode ser persistido por não ser segredo.
