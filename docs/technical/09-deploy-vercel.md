# Deploy na Vercel

API e Web possuem projetos separados.

## API
Cuidados:
- entrypoint serverless não deve depender de listener persistente;
- Prisma Client deve existir no runtime;
- variáveis de ambiente completas;
- validar `/`, `/health`, `/docs` e fluxos autenticados.

## Web
Variável pública:
`VITE_API_URL`.

## Pós-deploy
Validar:
- área pública;
- login;
- refresh/F5;
- logout;
- dashboard;
- members;
- recuperação de senha;
- CORS entre Web e API.
