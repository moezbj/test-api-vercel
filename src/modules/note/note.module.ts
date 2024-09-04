import { createModule } from 'graphql-modules'
import { NoteResolver } from './note.resolver'
import { NoteType } from './note.type'

export const NoteModule = createModule({
  id: 'note',
  dirname: __dirname,
  typeDefs: [NoteType],
  resolvers: [NoteResolver],
})
