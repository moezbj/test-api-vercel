import { createApplication } from "graphql-modules";
import { UserModule } from "./user/user.module";
import { AppointmentModule } from "./appointment/appointment.module";
import { AuthModule } from "./auth/auth.module";
import { TokenModule } from "./token/token.module";
import { patientModule } from "./patient/patient.module";
import { FeeModule } from "./fees/fee.module";
import { colleagueModule } from "./colleagues/colleague.module";
import { NoteModule } from "./note/note.module";

export const application = createApplication({
  modules: [
    AppointmentModule,
    patientModule,
    UserModule,
    FeeModule,
    AuthModule,
    TokenModule,
    colleagueModule,
    NoteModule,
  ],
});
