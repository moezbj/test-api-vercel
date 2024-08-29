import { gql } from "graphql-modules";

export const ColleagueDefs = gql`
  type Query {
    colleague(id: String!): Colleague
    colleagues: [Colleague]
  }

  input NewColleagueInput {
    name: String
    email: String
    phone: String
  }

  type Mutation {
    createColleague(input: NewColleagueInput!): Colleague
    updateColleague(
      id: String
      name: String
      email: String
      phone: String
    ): Colleague
  }
  type Colleague {
    id: String
    name: String
    email: String
    phone: String
    Appointments: [Appointment]
  }
`;
