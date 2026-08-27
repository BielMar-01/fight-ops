# CI/CD

## Status
🟡 A evoluir

Pipeline recomendado:

```text
install
→ prisma generate
→ lint
→ typecheck
→ test
→ build
→ deploy
```

Recomendações:
- PR para mudanças relevantes;
- checks obrigatórios;
- migrations revisadas;
- preview antes de production;
- smoke test pós-deploy.
