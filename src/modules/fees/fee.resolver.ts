import { format, formatISO } from "date-fns";
import prisma from "../../config/prisma";
import { getUser } from "../../middlewares/getUser";

export const FeeResolver = {
  Query: {
    fees: async (
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
      if (!existUser) throw new Error("id not provided");
      const arg: {
        userId: string;
        startTime?: string;
        endTime?: string;
      } = {
        userId: existUser.id,
      };

      const list = await prisma.fees.findMany({
        where: {
          userId: arg.userId,
          ...(args.startTime && args.endTime
            ? {
                startTime: {
                  gte: args.startTime, // Greater than or equal to startTime
                },
                endTime: {
                  lte: args.endTime, // Less than or equal to endTime
                },
              }
            : {}),
        },
      });
      return list;
    },
    fee: async (
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
      const fee = await prisma.fees.findFirst({
        where: {
          id: args.id,
          userId: existUser.id,
        },
      });
      return fee;
    },
  },
  Mutation: {
    createFee: async (parent: undefined, args: any, context: any) => {
      const arg = args.input;
      const getIdUser = await getUser(context.authorization.split(" ")[1]);
      if (!getIdUser) throw new Error("id not provided");
      const existUser = await prisma.user.findFirst({
        where: {
          id: getIdUser.sub?.toString(),
        },
      });
      if (!existUser) throw new Error("id not provided");
      const formatDate1 = formatISO(arg.date);
      const n = new Date(formatDate1);
      n.setDate(n.getDate());
      const setStandard= n.setHours(2)

      const [createFee] = await prisma.$transaction([
        prisma.fees.create({
          data: {
            user: { connect: existUser },
            date: formatISO(setStandard),
            amount: arg.amount,
            note: arg.note,
          },
        }),
      ]);
      return createFee;
    },
    updateFee: async (parent: undefined, args: any, context: any) => {
      const arg = args.input;
      const getIdUser = await getUser(context.authorization.split(" ")[1]);
      if (!getIdUser) throw new Error("id not provided");
      const existUser = await prisma.user.findFirst({
        where: {
          id: getIdUser.sub?.toString(),
        },
      });
      if (!existUser) throw new Error("id not provided");

      const existFee = await prisma.fees.findFirst({
        where: {
          id: arg.id,
        },
      });
      if (!existFee) throw new Error("Fee does not exist");

      const [updateAFee] = await prisma.$transaction([
        prisma.fees.update({
          where: {
            id: arg.id,
          },
          data: {
            date: arg.startTime,
            amount: arg.amount,
            note: arg.note,
          },
        }),
      ]);
      return updateAFee;
    },
    deleteFee: async (parent: undefined, args: any, context: any) => {
      const existFee = await prisma.fees.findFirst({
        where: {
          id: args.id,
        },
      });
      if (!existFee) throw new Error("fee does not exist");
      await prisma.fees.delete({
        where: {
          id: args.id,
        },
      });
      return "deleted";
    },
  },
};
