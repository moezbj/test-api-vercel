import { createModule } from 'graphql-modules'
import { PatientDefs } from './patient.type'
import { patientResolver } from './patient.resolvers'

export const patientModule = createModule({
  id: 'patient',
  dirname: __dirname,
  typeDefs: [PatientDefs],
  resolvers: [patientResolver],
})
