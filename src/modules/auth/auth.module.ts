import { createModule } from 'graphql-modules'
import { AuthType } from './auth.type'
import { authResolves } from './auth.resolvers'

export { User } from '../user/user.type'

export const AuthModule = createModule({
  id: 'auth',
  dirname: __dirname,
  typeDefs: [AuthType],
  resolvers: [authResolves],
})
