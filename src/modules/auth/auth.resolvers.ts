import prisma from '../../config/prisma'
import bcrypt from 'bcryptjs'
import { generateTokenResponse } from '../../middlewares/generateUserToken'
import { getUser } from '../../middlewares/getUser'
import { generateToken, isTokenValid } from '../../middlewares/generateToken'
import { TOKEN_TYPE } from '@prisma/client'
import { sandMail } from '../../utils/mailer'
import { clientUrl, mailExpiration } from '../../config/vars'

interface AuthType {
  email: string
  password: string
}

interface RegisterType {
  email: string
  firstName: string
  lastName: string
  company?: string
  password: string
}

export const authResolves = {
  Mutation: {
    login: async (parent: any, args: AuthType) => {
      console.log('args', args)
      const user = await prisma.user.findFirst({
        where: { email: args.email },
      })

      if (!user || !(await bcrypt.compare(args.password, user.password))) {
        throw new Error('LOGIN.INCORRECT')
      }

      if (user && !user?.isActive) {
        throw new Error('LOGIN.BLOCKED')
      }
      const token = await generateTokenResponse(user.id)
      return { token, user }
    },
    register: async (parent: any, args: RegisterType) => {
      const user = await prisma.user.findFirst({
        where: { email: args.email },
      })

      if (user) {
        throw new Error('USER ALREADY EXISTS')
      }

      const createdUser = await prisma.user.create({
        data: {
          email: args.email,
          firstName: args.firstName,
          lastName: args.lastName,
          password: args.password,
        },
      })
      const token = await generateTokenResponse(createdUser.id)
      await sandMail({
        to: createdUser.email,
        text: `welcome to hero task`,
      })
      return { token, user: createdUser }
    },
    logout: async (parent: any, args: any, contextValue: any) => {
      const getIdUser = await getUser(contextValue.authorization.split(' ')[1])
      if (!getIdUser) throw new Error('id not provided')
      const existUser = await prisma.user.findFirst({
        where: {
          id: getIdUser.sub?.toString(),
        },
      })
      if (!existUser) throw new Error("user dosen't exist")
      await isTokenValid({
        token: args.token,
        type: TOKEN_TYPE.REFRESH,
        user: existUser.id,
      })
      return 'done'
    },
    forgotPassword: async (parent: any, args: { email: string }) => {
      const existUser = await prisma.user.findFirst({
        where: {
          email: args.email,
        },
      })
      if (!existUser) throw new Error("user dosen't exist")
      const { token } = await generateToken(existUser.id, TOKEN_TYPE.FORGET, {
        days: mailExpiration,
      })

      let info = await sandMail({
        from: 'contactmoez93@gmail.com',
        to: existUser.email,
        html: `
        <html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Clickable Link</title>
</head>
<body>
    <a href="${clientUrl}/reset-password/${existUser.id}/${token}">Click here to reset your password</a>
</body>
</html>`,
      })

      return 'sent'
    },
    resetPassword: async (
      parent: any,
      args: { password: string; confirm: string; token: string },
    ) => {
      const getIdUser = await getUser(args.token)
      if (!getIdUser) throw new Error('id not provided')
      const existUser = await prisma.user.findFirst({
        where: {
          id: getIdUser.sub?.toString(),
        },
      })
      if (!existUser) throw new Error("user dosen't exist")

      if (args.password !== args.confirm)
        throw new Error('passwords do not match')

      await prisma.user.update({
        where: { id: existUser.id },
        data: { password: args.password },
      })
      return 'updated'
    },
  },
  /* Query: {
    profile: (parent: any, args: unknown, context: any) => {
      console.log('poias', context.req.user)
      return context.req.user
    },
  }, */
}
