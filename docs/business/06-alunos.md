# Módulo de Alunos

## 1. Objetivo

O módulo de Alunos é responsável pelo cadastro e gerenciamento operacional dos alunos vinculados a uma academia no FightOps.

O aluno operacional é representado pela entidade `Student`.

Um `Student` não é obrigatoriamente uma conta de acesso ao sistema.

A separação principal é:

```text
User
=
conta de autenticação

Student
=
registro operacional do aluno

GymMembership com role STUDENT
=
autorização de acesso ao CT