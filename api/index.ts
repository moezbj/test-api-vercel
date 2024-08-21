import { ApolloServer, gql } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import http from "http";

import { port, databaseUri } from "../src/config/vars";
import prisma from "../src/config/prisma";
import getApp from "../src/config/express";

import mongoose from "mongoose";
import { application } from "../src/modules";

/* const app = express();
app.use(cors());
app.use(express.json()); */

const connectDB = async () => {
  try {
    if (databaseUri) {
      await mongoose.connect(databaseUri);
      console.log("🎉 connected to database successfully");
    }
  } catch (error) {
    console.error(error);
  }
};
connectDB();
prisma.$connect();

const schema = application.createSchemaForApollo();
const app = getApp();
const httpServer = http.createServer(app);

/* const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: () => "world",
  },
}; */

const startApolloServer = async (app: any, httpServer: any) => {
  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();
  server.applyMiddleware({ app });
};
startApolloServer(app, httpServer);

export default httpServer;
