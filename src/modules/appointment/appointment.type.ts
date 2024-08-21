import { gql } from 'graphql-modules'

export const AppointmentType = gql`
  type Appointment {
    id: String
    createdAt: String
    updatedAt: String
    patient: Patient
    startTime: String
    endTime: String
    price: Int
    user: User
    status: String
    note: String
  }

  input NewAppointmentInput {
    patientId: String
    startTime: String
    endTime: String
    status: String
    note: String
  }
  input UpdateAppointmentInput {
    id: String
    patientId: String
    startTime: String
    endTime: String
    price: Int
    status: String
    note: String
  }

  type Query {
    appointment(id: ID!): Appointment
    appointments(
      name: String
      startTime: String
      endTime: String
      status: String
    ): [Appointment]
  }
  type Mutation {
    createAppointment(input: NewAppointmentInput!): Appointment
    updateAppointment(input: UpdateAppointmentInput!): Appointment
    deleteAppointment(id: ID!): String
  }
`
