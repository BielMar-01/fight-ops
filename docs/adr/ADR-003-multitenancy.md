# ADR-003 — Multi-tenancy por Academia

## Status
Aceito

Academia é o tenant. A autorização é resolvida por `GymMembership`.

Consequências:
- entidades operacionais usam `gymId`;
- papel é por academia;
- frontend possui academia ativa;
- testes cobrem isolamento.
