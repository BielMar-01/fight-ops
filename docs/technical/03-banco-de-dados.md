# Banco de Dados

## Tecnologia
PostgreSQL no Supabase + Prisma.

## Entidades atuais
- User
- UserSession
- PasswordReset
- Gym
- GymMembership
- SiteSetting
- PublicPage
- PublicPageSection
- SeoSetting

## Enums
`GlobalRole`: USER, SUPER_ADMIN.  
`GymRole`: OWNER, ADMIN, RECEPTIONIST, PROFESSOR, STUDENT.

## Restrição importante
`GymMembership` possui unicidade em `(userId, gymId)`.

## Próxima entidade
`Student`, separada de `User`.

Toda mudança estrutural deve usar migration Prisma.
