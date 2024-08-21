import { getUser } from '../../middlewares/getUser'
import prisma from '../../config/prisma'
export const userResolver = {
  Query: {
    user: async (parent: any, args: any, context: any) => {
      const { token } = args
      const verifiedUser = await getUser(token)
      if (!verifiedUser) throw new Error('Invalid user')
      const user = await prisma.user.findFirst({
        where: {
          id: verifiedUser.sub?.toString(),
        },
      })

      return user
    },
  },
}
