# Arquitetura Multi-Tenant — FightOps

## Visão Geral

O FightOps utiliza arquitetura multi-tenant baseada em academias e centros de treinamento.

Cada CT é representado por um registro em `gyms`.

Usuários não pertencem diretamente a um único CT.

A relação entre usuário e CT é realizada através de `gym_memberships`.

## Estrutura

```text
User
  |
  +-- GymMembership
          |
          +-- Gym
```
