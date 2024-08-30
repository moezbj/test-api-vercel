import { gql } from "graphql-modules";

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
    resource: String
  }

  input NewAppointmentInput {
    patientId: String
    startTime: String
    endTime: String
    status: String
    note: String
    resource: String
    
  }
  input UpdateAppointmentInput {
    id: String
    patientId: String
    startTime: String
    endTime: String
    price: Int
    status: String
    note: String
    resource: String
  }

  type DetailedGain {
    appointments: [Appointment]
    fees: [Fee]
  }

  type Query {
    appointment(id: ID!): Appointment
    appointments(
      name: String
      startTime: String
      endTime: String
      status: String
    ): [Appointment]
    totalGain(date: String): String
    totalGainDetailed(startTime: String, endTime: String): DetailedGain
  }
  type Mutation {
    createAppointment(input: NewAppointmentInput!): Appointment
    updateAppointment(input: UpdateAppointmentInput!): Appointment
    deleteAppointment(id: ID!): String
    cancelAll(date: String!, resource: String): String
  }
`;
