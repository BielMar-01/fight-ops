# Alunos

## Status
🟡 Próxima fase

## Decisão
Aluno operacional será separado de conta de usuário.

```text
Student = cadastro operacional
User = conta de autenticação
GymMembership STUDENT = autorização de acesso
```

Isso permite cadastrar aluno sem login.

## Operações planejadas
- listar;
- consultar;
- criar;
- editar;
- ativar/inativar;
- busca;
- filtro;
- paginação.

## Campos iniciais
- nome;
- e-mail;
- telefone;
- nascimento;
- contato de emergência;
- telefone de emergência;
- observações;
- status;
- data de entrada.

## Permissões planejadas
OWNER/ADMIN/RECEPTIONIST: gestão.  
PROFESSOR: consulta.  
STUDENT: sem gestão.
