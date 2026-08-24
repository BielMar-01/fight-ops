import type { GlobalRole } from '../../generated/prisma/enums.js'

export interface AuthenticatedUser {
  id: string
  email: string
  globalRole: GlobalRole
}