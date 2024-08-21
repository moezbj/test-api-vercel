import prisma from '../../config/prisma'
import { isTokenValid } from '../../middlewares/generateToken'
import { generateTokenResponse } from '../../middlewares/generateUserToken'

export const TokenResolver = {
  Query: {
    validToken: async (parent: any, args: any) => {
      const t = await isTokenValid({
        token: args.token,
        type: args.tokenType,
        user:args.userId,
      })
      if (!t) throw new Error('Invalid token')

      const user = await prisma.user.findFirst({
        where: { id: args.userId },
      })
      if (!user) throw new Error('Invalid token')

      const token = await generateTokenResponse(user.id)

      return { user, token }
    },
  },
}
