import { gql } from 'graphql-modules'

export const PatientDefs = gql`
  type Query {
    patient(id: String!): Patient
    patients: [Patient]
  }

  input NewPatientInput {
    name: String
    age: String
    email: String
    phone: String
    insurance: String
    note: String
  }

  type Mutation {
    createPatient(input: NewPatientInput!): Patient
    updatePatient(
      id: String
      name: String
      age: String
      email: String
      phone: String
      insurance: String
      note: String
    ): Patient
  }
  type Patient {
    id: String
    name: String
    note: String
    age: String
    email: String
    phone: String
    insurance: String
    Appointments: [Appointment]
  }
`
