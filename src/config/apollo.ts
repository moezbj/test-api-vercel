import http from 'http'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { application } from '../modules'

import getApp from './express'
import { isDev } from './vars'
export default async function getServer() {
  const schema = application.createSchemaForApollo()
  const [app, appSchema] = await Promise.all([getApp(), schema])
  const httpServer = http.createServer(app)
  const server = new ApolloServer({
    schema: appSchema,
    csrfPrevention: false,
    introspection: isDev,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  })
  await server.start()
  app.use(
    expressMiddleware(server, {
      context: async ({ req }) => req.headers,
    }),
  )
  return httpServer
}

/* import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { application } from '../modules'
import getApp from './express'
import { isDev } from './vars'

export default async function getServer() {
  const schema = await application.createSchemaForApollo()
  const app = await getApp()
  const server = new ApolloServer({
    schema,
    csrfPrevention: false,
    introspection: isDev,
    // plugins: [ApolloServerPluginDrainHttpServer({ httpServer: null })], // No httpServer needed for serverless
  })

  await server.start()

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => req.headers,
    }),
  )

  return app // Return the Express app
}
 */