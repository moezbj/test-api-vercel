import { createModule, gql } from 'graphql-modules'
import { User } from './user.type'
import { userResolver } from './user.resolver'

export const UserModule = createModule({
  id: 'user',
  dirname: __dirname,
  typeDefs: [User],
  resolvers: [userResolver],
})
