import compress from 'compression'
import cors from 'cors'
import express from 'express'
import RateLimit from 'express-rate-limit'
import passport from 'passport'
import path from 'path'
import { expressMiddleware } from '@apollo/server/express4'

import authorization from '../middlewares/auth'

import { appsDir } from '../helpers/upload'
import strategies from './passport'
import { clientUrl, isDev, clientFront } from './vars'
import helmet from 'helmet'

export default () => {
  const apiLimiter = RateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20000,
    skipSuccessfulRequests: true,
  })
  const app = express()
  app.use(apiLimiter)
  app.use(compress())
  app.use(express.json())
  /*  app.use(
    helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }),
  ) */
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          connectSrc: ["'self'", 'http://localhost:5173'],
        },
      },
    }),
  )

  app.use(express.urlencoded({ extended: true }))
  /* const gqlUpload = (await import('graphql-upload/graphqlUploadExpress.js'))
    .default
  app.use(gqlUpload()) */
  app.use(passport.initialize())
  passport.use('jwt', strategies.jwt)
  app.use(authorization)
  const whitelist = [clientUrl, clientFront]
  const corsOptions = isDev
    ? {}
    : {
        origin: (
          origin: any,
          callback: (err: Error | null, success: boolean) => void,
        ) => {
          if (origin === undefined || whitelist.indexOf(origin) !== -1) {
            return callback(null, true)
          } else {
            const msg =
              'The CORS policy for this site does not allow access from the specified Origin.'
            return callback(new Error(msg), false)
          }
        },
      }
  app.use(cors(corsOptions))
  app.use('/public', express.static(path.join(appsDir, '/public')))
  return app
}
