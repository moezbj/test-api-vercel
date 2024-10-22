import { getUser } from "../../middlewares/getUser";
import prisma from "../../config/prisma";

export const patientResolver = {
  Query: {
    patients: async (
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
      if (!existUser) throw new Error("user doesn't exist");

      const list = await prisma.patient.findMany({
        where: {
          userId: existUser.id,
        },
      });
      return list;
    },
    patient: async (
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

      const workspace = await prisma.patient.findFirst({
        where: {
          id: args.id,
        },
      });
      return workspace;
    },
  },
  Mutation: {
    createPatient: async (parent: undefined, args: any, context: any) => {
      const arg = args.input;
      const getIdUser = await getUser(context.authorization.split(" ")[1]);
      if (!getIdUser) throw new Error("id not provided");
      const existUser = await prisma.user.findFirst({
        where: {
          id: getIdUser.sub?.toString(),
        },
      });
      if (!existUser) throw new Error("user dosen't exist");

      const existPatient = await prisma.patient.findFirst({
        where: {
          name: arg.name,
        },
      });
      if (existPatient) throw new Error("user already exist");

      const query: {
        name: string;
        birthDate: string;
        email: string;
        phone: string;
        note: string;
        insurance: string;
        addressedBy: string;
        startDate?: Date;
        endDate?: Date;
      } = {
        name: arg.name,
        birthDate: arg.birthDate,
        email: arg.email,
        phone: arg.phone,
        note: arg.note,
        insurance: arg.insurance,
        addressedBy: arg.addressedBy,
      };
      if (arg.startDate) {
        query.startDate = arg.startDate;
      }
      if (arg.endDate) {
        query.endDate = arg.endDate;
      }

      const [createPatient] = await prisma.$transaction([
        prisma.patient.create({
          data: {
            ...query,
            userId: existUser.id,
          },
        }),
      ]);
      return createPatient;
    },
    updatePatient: async (parent: undefined, args: any, context: any) => {
      const arg = args.input;

      const getIdUser = await getUser(context.authorization.split(" ")[1]);
      if (!getIdUser) throw new Error("id not provided");
      const existUser = await prisma.user.findFirst({
        where: {
          id: getIdUser.sub?.toString(),
        },
      });
      if (!existUser) throw new Error("user dosen't exist");

      const existPatient = await prisma.patient.findFirst({
        where: {
          name: args.id,
        },
      });
      if (!existPatient) throw new Error("patient dosen't exist");

      const [updatePatient] = await prisma.$transaction([
        prisma.patient.update({
          where: {
            id: arg.id,
          },
          data: {
            name: arg.name,
            email: arg.email,
            birthDate: arg.birthDate,
            insurance: arg.insurance,
            phone: arg.phone,
            note: arg.note,
            addressedBy: arg.addressedBy,
            startDate: arg.startDate,
            endDate: arg.endDate,
          },
        }),
      ]);
      return updatePatient;
    },
    deletePatient: async (parent: undefined, args: any, context: any) => {
      const existPatient = await prisma.patient.findFirst({
        where: {
          id: args.id,
        },
      });
      if (!existPatient) throw new Error("Patient does not exist");
      await prisma.appointment.delete({
        where: {
          id: args.id,
        },
      });
      return "deleted";
    },
  },
};
