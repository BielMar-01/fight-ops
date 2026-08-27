# Estrutura do Monorepo

`apps/api`: backend Fastify.  
`apps/web`: frontend React/Vite.  
`prisma`: schema e migrations.  
`docs`: documentação.  
`packages`: compartilhamento futuro quando houver necessidade real.

Regra: Web não importa runtime do backend e backend não depende da Web.
