import { format, formatISO } from "date-fns";
import prisma from "../../config/prisma";
import { getUser } from "../../middlewares/getUser";

export const NoteResolver = {
  Query: {
    notes: async (
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
      } = {
        userId: existUser.id,
      };

      const list = await prisma.note.findMany({
        where: {
          userId: arg.userId,
        },
      });
      return list;
    },
    note: async (
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
      const note = await prisma.note.findFirst({
        where: {
          id: args.id,
          userId: existUser.id,
        },
      });
      return note;
    },
  },
  Mutation: {
    createNote: async (parent: undefined, args: any, context: any) => {
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
      const setStandard = n.setHours(2);

      const [createNote] = await prisma.$transaction([
        prisma.note.create({
          data: {
            user: { connect: { id: existUser.id } },
            note: arg.note,
          },
        }),
      ]);
      return createNote;
    },
    updateNote: async (parent: undefined, args: any, context: any) => {
      const arg = args.input;
      const getIdUser = await getUser(context.authorization.split(" ")[1]);
      if (!getIdUser) throw new Error("id not provided");
      const existUser = await prisma.user.findFirst({
        where: {
          id: getIdUser.sub?.toString(),
        },
      });
      if (!existUser) throw new Error("id not provided");

      const existNote = await prisma.note.findFirst({
        where: {
          id: arg.id,
        },
      });
      if (!existNote) throw new Error("Note does not exist");

      const [updateANote] = await prisma.$transaction([
        prisma.note.update({
          where: {
            id: arg.id,
          },
          data: {
            note: arg.note,
          },
        }),
      ]);
      return updateANote;
    },
    deleteNote: async (parent: undefined, args: any, context: any) => {
      const existNote = await prisma.note.findFirst({
        where: {
          id: args.id,
        },
      });
      if (!existNote) throw new Error("note does not exist");
      await prisma.note.delete({
        where: {
          id: args.id,
        },
      });
      return "deleted";
    },
  },
};
