import { gql } from "graphql-modules";

export const PatientDefs = gql`
  type Query {
    patient(id: String!): Patient
    patients: [Patient]
  }

  input NewPatientInput {
    name: String
    birthDate: String
    email: String
    phone: String
    insurance: String
    note: String
    addressedBy: String
  }
  input UpdatePatientInput {
    id: String
    name: String
    birthDate: String
    email: String
    phone: String
    insurance: String
    note: String
    addressedBy: String
  }

  type Mutation {
    createPatient(input: NewPatientInput!): Patient
    updatePatient(input: UpdatePatientInput): Patient
    deletePatient(id: ID!): String
  }
  type Patient {
    id: String
    name: String
    note: String
    birthDate: String
    email: String
    phone: String
    insurance: String
    Appointments: [Appointment]
    addressedBy: String
  }
`;
