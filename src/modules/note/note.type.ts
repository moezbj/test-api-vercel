import { gql } from "graphql-modules";

export const NoteType = gql`
  type Note {
    note: String
    user: User
    id: String
  }

  input NewNoteInput {
    note: String
  }
  input UpdateNoteInput {
    id: String
    note: String
  }
  type Query {
    note(id: ID!): Note
    notes(user: ID): [Note]
  }
  type Mutation {
    createNote(input: NewNoteInput!): Note
    updateNote(input: UpdateNoteInput!): Note
    deleteNote(id: ID!): String
  }
`;
