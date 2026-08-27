# Autenticação e Acesso

## Status
🟢 Implementado

## Fluxos
- cadastro;
- login;
- refresh;
- restauração de sessão;
- logout;
- consulta do usuário autenticado;
- rotas protegidas;
- rotas de visitante.

## Recuperação de senha
```text
Informar e-mail
→ receber código
→ validar código
→ definir nova senha
```

Regras:
- não revelar se o e-mail existe;
- código com expiração;
- limite de tentativas;
- código/hash não armazenado em texto puro;
- fluxo não reutilizável após uso.

Credenciais SMTP e segredos nunca devem ser versionados.
