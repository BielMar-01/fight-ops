# Perfis e Permissões

## Papéis globais
- USER
- SUPER_ADMIN

## Papéis por academia
- OWNER
- ADMIN
- RECEPTIONIST
- PROFESSOR
- STUDENT

### OWNER
Proprietário da academia. Possui controle operacional e ações críticas.

Pode gerenciar ADMIN, RECEPTIONIST, PROFESSOR e STUDENT. Não deve ser removido/inativado pelas operações comuns de membros.

### ADMIN
Administrador operacional. Pode gerenciar RECEPTIONIST, PROFESSOR e STUDENT.

Não pode:
- criar outro ADMIN;
- alterar OWNER;
- alterar outro ADMIN;
- transferir propriedade;
- executar ações reservadas ao proprietário.

### RECEPTIONIST
Perfil operacional de recepção. No módulo de membros atual pode consultar, mas não gerenciar.

### PROFESSOR
Pode consultar membros. Gestão própria será detalhada nos módulos de turmas/aulas.

### STUDENT
Perfil de acesso do aluno. Não participa da gestão de membros.

## Matriz atual de Membros

| Ação | OWNER | ADMIN | RECEPTIONIST | PROFESSOR | STUDENT |
|---|---:|---:|---:|---:|---:|
| Listar | ✅ | ✅ | ✅ | ✅ | ❌ |
| Adicionar ADMIN | ✅ | ❌ | ❌ | ❌ | ❌ |
| Adicionar RECEPTIONIST | ✅ | ✅ | ❌ | ❌ | ❌ |
| Adicionar PROFESSOR | ✅ | ✅ | ❌ | ❌ | ❌ |
| Adicionar STUDENT | ✅ | ✅ | ❌ | ❌ | ❌ |
| Alterar ADMIN | ✅ | ❌ | ❌ | ❌ | ❌ |
| Alterar papel operacional | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ativar/inativar vínculo operacional | ✅ | ✅ | ❌ | ❌ | ❌ |

Frontend adapta a UX; backend é a autoridade de autorização.
