import { createModule } from "graphql-modules";
import { ColleagueDefs } from "./colleague.type";
import { colleagueResolver } from "./colleague.resolver";

export const colleagueModule = createModule({
  id: "colleague",
  dirname: __dirname,
  typeDefs: [ColleagueDefs],
  resolvers: [colleagueResolver],
});
