import { createModule } from 'graphql-modules'
import { FeeResolver } from './fee.resolver'
import { FeeType } from './fee.type'

export const FeeModule = createModule({
  id: 'fee',
  dirname: __dirname,
  typeDefs: [FeeType],
  resolvers: [FeeResolver],
})
