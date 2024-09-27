import { getUser } from "../../middlewares/getUser";
import prisma from "../../config/prisma";
export const userResolver = {
  Query: {
    user: async (parent: any, args: any, context: any) => {
      const { token } = args;
      const verifiedUser = await getUser(token);
      if (!verifiedUser) throw new Error("Invalid user");
      const user = await prisma.user.findFirst({
        where: {
          id: verifiedUser.sub?.toString(),
        },
      });

      return user;
    },

    users: async (parent: any, args: any, context: any) => {
      const token = context.authorization.split(" ")[1];
      const verifiedUser = await getUser(token);
      if (!verifiedUser) throw new Error("Invalid user");
      const users = await prisma.user.findMany();
      return users;
    },
  },
  Mutation: {
    toggleUserStatus: async (parent: any, args: any, contextValue: any) => {
      const getIdUser = await getUser(contextValue.authorization.split(" ")[1]);
      if (!getIdUser) throw new Error("id not provided");

      const existUser = await prisma.user.findFirst({
        where: {
          id: args.id,
        },
      });
      if (!existUser) throw new Error("user dosen't exist");

      const updatedUser = await prisma.user.update({
        where: {
          id: existUser.id,
        },
        data: {
          isActive: !existUser.isActive,
        },
      });
      return {
        updatedUser,
      };
    },
  },
};
