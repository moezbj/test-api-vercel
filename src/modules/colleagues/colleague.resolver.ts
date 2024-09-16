import { getUser } from "../../middlewares/getUser";
import prisma from "../../config/prisma";

export const colleagueResolver = {
  Query: {
    colleagues: async (
      parent: Record<string, any>,
      args: Record<string, any>,
      context: any
    ) => {
      const getIdUser = await getUser(context.authorization.split(" ")[1]);
      if (!getIdUser) throw new Error("id not provided");
      const existUser = await prisma.user.findFirst({
        where: {
          id: getIdUser.sub?.toString(),
        },
      });
      if (!existUser) throw new Error("user dosen't exist");

      const list = await prisma.colleague.findMany({
        where: {
          userId: existUser.id,
        },
      });
      return list;
    },
    colleague: async (
      parent: Record<string, any>,
      args: Record<string, any>,
      context: any
    ) => {
      const getIdUser = await getUser(context.authorization.split(" ")[1]);
      if (!getIdUser) throw new Error("id not provided");
      const existUser = await prisma.user.findFirst({
        where: {
          id: getIdUser.sub?.toString(),
        },
      });
      if (!existUser) throw new Error("user dosen't exist");

      const workspace = await prisma.colleague.findFirst({
        where: {
          id: args.id,
        },
      });
      return workspace;
    },
  },
  Mutation: {
    createColleague: async (parent: undefined, args: any, context: any) => {
      const arg = args.input;

      const getIdUser = await getUser(context.authorization.split(" ")[1]);
      if (!getIdUser) throw new Error("id not provided");
      const existUser = await prisma.user.findFirst({
        where: {
          id: getIdUser.sub?.toString(),
        },
      });
      if (!existUser) throw new Error("user dosen't exist");

      const existColleague = await prisma.colleague.findFirst({
        where: {
          name: arg.name,
        },
      });
      if (existColleague) throw new Error("user already exist");
      const [createColleague] = await prisma.$transaction([
        prisma.colleague.create({
          data: {
            name: arg.name,
            email: arg.email,
            phone: arg.phone,
            userId: existUser.id,
          },
        }),
      ]);
      return createColleague;
    },
    updateColleague: async (parent: undefined, args: any, context: any) => {
      const getIdUser = await getUser(context.authorization.split(" ")[1]);
      if (!getIdUser) throw new Error("id not provided");
      const existUser = await prisma.user.findFirst({
        where: {
          id: getIdUser.sub?.toString(),
        },
      });
      if (!existUser) throw new Error("user dosen't exist");

      const existColleague = await prisma.colleague.findFirst({
        where: {
          name: args.id,
        },
      });
      if (existColleague) throw new Error("colleague already exist");

      const [updateColleague] = await prisma.$transaction([
        prisma.colleague.update({
          where: {
            id: args.id,
          },
          data: {
            name: args.name,
            email: args.email,
            phone: args.phone,
          },
        }),
      ]);
      return updateColleague;
    },
    deleteColleague: async (parent: undefined, args: any, context: any) => {
      const existColleague = await prisma.colleague.findFirst({
        where: {
          id: args.id,
        },
      });
      if (!existColleague) throw new Error("Colleague does not exist");
      await prisma.appointment.deleteMany({
        where: {
          resource: args.id,
        },
      });
      return "deleted";
    },
  },
};
