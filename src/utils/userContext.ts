import { User, Token } from '@prisma/client'

export interface UserContext {
  // we'd define the properties a user should have
  // in a separate user interface (e.g., email, id, url, etc.)
  user: User
  token: Token
}
