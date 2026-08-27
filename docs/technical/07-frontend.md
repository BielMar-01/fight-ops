# Frontend

## Rotas públicas
- `/`
- `/features`
- `/pricing`
- `/faq`

## Visitante
- `/login`
- `/register`
- recuperação de senha

## Protegidas
- `/dashboard`
- `/members`

## Estrutura
```text
ProtectedRoute
→ GymProvider
→ GymRequired
→ AppLayout
→ Página
```

`GymContext` carrega academias, mantém academia ativa e persiste `activeGymId`.

O AppLayout possui sidebar, menu mobile, seletor de academia, papel atual e logout.

Elementos relevantes devem ter `data-testid`.
