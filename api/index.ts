import { gql } from "apollo-server-express";
// import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";

import { port, databaseUri } from "../src/config/vars";
import prisma from "../src/config/prisma";
import getApp from "../src/config/express";

import mongoose from "mongoose";
import { application } from "../src/modules";

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
const typeDefs = gql`
  type Query {
    hello: String
  }
  type Mutation {
    setHello(hey: String): String
  }
`;

const resolvers = {
  Query: {
    hello: () => "world",
  },
  Mutation: {
    setHello(hey) {
      return hey;
    }
  }
};

const startApolloServer = async (app: any, httpServer: any) => {
  const server = new ApolloServer({
    schema,
    resolvers,
    typeDefs,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server
    .start()
    .then(() => console.log(`🎉 server start successfully on port ${port}`));
  //server.applyMiddleware({ app });
  app.use(
    expressMiddleware(server, {
      context: async ({ req }) => req.headers,
    })
  );
};
startApolloServer(app, httpServer);

// export default httpServer;
