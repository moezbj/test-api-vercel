import { createModule } from 'graphql-modules'
import { appointmentResolver } from './appointment.resolver'
import { AppointmentType } from './appointment.type'

export const AppointmentModule = createModule({
  id: 'appointment',
  dirname: __dirname,
  typeDefs: [AppointmentType],
  resolvers: [appointmentResolver],
})
