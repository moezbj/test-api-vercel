import { createModule } from 'graphql-modules'
import { TokenType } from './token.type'
import { TokenResolver } from './token.resolver'

export const TokenModule = createModule({
  id: 'token',
  dirname: __dirname,
  typeDefs: [TokenType],
  resolvers: [TokenResolver],
})
