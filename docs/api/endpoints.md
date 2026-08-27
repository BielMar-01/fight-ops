# Endpoints da API

## Base
- GET `/`
- GET `/health`

## Auth
- POST `/auth/register`
- POST `/auth/login`
- POST `/auth/refresh`
- POST `/auth/logout`
- GET `/auth/me`
- endpoints de recuperação de senha conforme Swagger

## Academias
- POST `/gyms`
- GET `/gyms`
- GET `/gyms/:gymId`

## Membros
- GET `/gyms/:gymId/members`
- POST `/gyms/:gymId/members`
- PATCH `/gyms/:gymId/members/:memberId/role`
- PATCH `/gyms/:gymId/members/:memberId/status`

### Adicionar membro
```json
{
  "email": "usuario@exemplo.com",
  "role": "PROFESSOR"
}
```

### Alterar papel
```json
{
  "role": "RECEPTIONIST"
}
```

### Alterar status
```json
{
  "active": false
}
```

## Próxima API — Alunos
Planejada:
- GET `/gyms/:gymId/students`
- GET `/gyms/:gymId/students/:studentId`
- POST `/gyms/:gymId/students`
- PUT `/gyms/:gymId/students/:studentId`
- PATCH `/gyms/:gymId/students/:studentId/status`
