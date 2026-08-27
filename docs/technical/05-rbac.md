# RBAC por Academia

`User.globalRole` controla privilégios globais.  
`GymMembership.role` controla privilégios no tenant.

O guard de academia:
1. exige autenticação;
2. lê `gymId`;
3. encontra membership;
4. valida vínculo;
5. valida academia;
6. valida papel permitido;
7. disponibiliza o contexto da academia na request.

Uso conceitual:

```ts
requireGymRole('OWNER', 'ADMIN')
```

O backend é a autoridade final.
