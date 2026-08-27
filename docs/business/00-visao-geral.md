# Visão Geral do Produto

## Status
🟢 Documento base ativo

FightOps é uma plataforma de gestão para academias e centros de treinamento.

## Objetivos
- centralizar a operação;
- organizar usuários, membros, professores e alunos;
- permitir múltiplas academias por usuário;
- aplicar papéis diferentes por academia;
- evoluir para turmas, planos, mensalidades, financeiro e graduações;
- manter área pública e área autenticada;
- permitir conteúdo público configurável.

## Conceitos
**User** = conta de acesso.  
**Gym** = tenant principal.  
**GymMembership** = vínculo entre usuário e academia.  
**GlobalRole** = papel global da plataforma.  
**GymRole** = papel do usuário dentro de uma academia.

Exemplo:

```text
Gabriel
├── Academia A → OWNER
├── Academia B → PROFESSOR
└── Academia C → STUDENT
```

## Área pública
- Início
- Funcionalidades
- Planos
- FAQ
- Login
- Cadastro
- Recuperação de senha

## Área autenticada
```text
Login
  ↓
sessão válida
  ↓
GET /gyms
  ↓
0 academias → onboarding
1+ academias → academia ativa → dashboard
```

## Isolamento
Dados operacionais devem ser associados ao `gymId`. Uma academia nunca deve acessar dados de outra apenas manipulando IDs.
