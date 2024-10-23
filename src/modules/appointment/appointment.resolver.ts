import { APPOINTMENT_TYPE } from "@prisma/client";
import prisma from "../../config/prisma";
import { getUser } from "../../middlewares/getUser";
import { formatISO, format, isSameDay, add } from "date-fns";
export const appointmentResolver = {
  Query: {
    appointments: async (
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
        patient?: { name: string };
        startTime?: string;
        endTime?: string;
        status?: "DONE" | "CANCELED" | "PENDING";
      } = {
        userId: existUser.id,
      };

      if (args.name) {
        arg.patient = {
          name: args.name,
        };
      }
      if (args.status) {
        arg.status = args.status;
      }
      let s = new Date();
      let e = new Date();
      if (args.startTime) {
        const adHourStart = new Date(args.startTime).setHours(
          new Date(args.startTime).getHours() + 1
        );
        const startOfDay = new Date(adHourStart);
        startOfDay.setUTCHours(0, 0, 0, 0);
        s = startOfDay;
      }
      if (args.endTime) {
        const adHourEnd = new Date(args.endTime).setHours(
          new Date(args.endTime).getHours() + 1
        );
        const endOfDay = new Date(adHourEnd);
        endOfDay.setUTCHours(23, 59, 59, 999);
        e = endOfDay;
      }
      const list = await prisma.appointment.findMany({
        where: {
          userId: arg.userId,
          patient: {
            userId: arg.userId,
          },
          OR: [
            
            {
              startTime: { gte: s },
              endTime: { lte: e },
            },
          ],
          ...(arg.patient ? { patient: arg.patient } : {}),
          ...(arg.status ? { status: arg.status } : {}),
        },
        include: {
          patient: true,
          user: true,
        },
      });
      return list;
    },
    appointment: async (
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
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: args.id,
          userId: existUser.id,
        },
      });
      return appointment;
    },
    totalGain: async (
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

      const adHour = new Date(args.date).setHours(
        new Date(args.date).getHours() + 1
      );

      const startOfDay = new Date(adHour);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(adHour);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const [listAppointment, feesList] = await prisma.$transaction([
        prisma.appointment.findMany({
          where: {
            userId: existUser.id,
            status: APPOINTMENT_TYPE.DONE,
            startTime: {
              gte: startOfDay,
            },
            endTime: {
              lte: endOfDay,
            },
          },
        }),
        prisma.fees.findMany({
          where: {
            userId: existUser.id,
            date: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        }),
      ]);

      const res = listAppointment.length
        ? listAppointment.map((e) => e.price).reduce((acc, item) => item + acc)
        : 0;
      const fees = feesList.length
        ? feesList.map((e) => e.amount).reduce((acc, item) => item + acc)
        : 0;
      return res - fees;
    },

    totalGainDetailed: async (
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

      const formatDateStart = formatISO(args.startTime);
      const DateStart = new Date(formatDateStart);

      const formatDateEnd = formatISO(args.endTime);
      const DateEnd = new Date(formatDateEnd);

      const formattedStart = format(DateStart, "yyyy-MM-dd");
      const formattedEnd = format(DateEnd, "yyyy-MM-dd");

      const [listAppointment, feesList] = await prisma.$transaction([
        prisma.appointment.findMany({
          where: {
            userId: existUser.id,
            status: APPOINTMENT_TYPE.DONE,
            startTime: {
              gte: new Date(`${formattedStart}T00:00:00`),
            },
            endTime: {
              lte: new Date(`${formattedEnd}T23:59:59.999`),
            },
          },
        }),
        prisma.fees.findMany({
          where: {
            userId: existUser.id,
            date: {
              gte: new Date(`${formattedStart}T00:00:00`),
              lte: new Date(`${formattedEnd}T23:59:59.999`),
            },
          },
        }),
      ]);

      return {
        appointments: listAppointment,
        fees: feesList,
      };
    },
  },
  Mutation: {
    createAppointment: async (parent: undefined, args: any, context: any) => {
      const arg = args.input;
      const getIdUser = await getUser(context.authorization.split(" ")[1]);
      if (!getIdUser) throw new Error("id not provided");
      const existUser = await prisma.user.findFirst({
        where: {
          id: getIdUser.sub?.toString(),
        },
      });
      if (!existUser) throw new Error("id not provided");

      console.log("arg.colleagueId", arg.colleagueId);

      const existAppointment = await prisma.appointment.findFirst({
        where: {
          startTime: arg.startTime,
          resource: arg.resource,
        },
      });
      if (existAppointment) throw new Error("existAppointment already exist");

      const existPatient = await prisma.patient.findFirst({
        where: {
          id: arg.patientId,
        },
      });

      if (!existPatient) throw new Error("patient already exist");
      const [createAppointment] = await prisma.$transaction([
        prisma.appointment.create({
          data: {
            patient: {
              connect: { id: existPatient.id },
            },
            user: { connect: { id: existUser.id } },
            startTime: arg.startTime,
            endTime: arg.endTime,
            price: 0,
            status: APPOINTMENT_TYPE.PENDING,
            note: arg.note,
            resource: arg.resource,
          },
          include: {
            patient: true,
            user: true,
          },
        }),
      ]);
      return createAppointment;
    },
    updateAppointment: async (parent: undefined, args: any, context: any) => {
      const arg = args.input;
      const getIdUser = await getUser(context.authorization.split(" ")[1]);
      if (!getIdUser) throw new Error("id not provided");
      const existUser = await prisma.user.findFirst({
        where: {
          id: getIdUser.sub?.toString(),
        },
      });
      if (!existUser) throw new Error("id not provided");

      const existAppointment = await prisma.appointment.findFirst({
        where: {
          id: arg.id,
        },
      });
      if (!existAppointment) throw new Error("Appointment does not exist");

      const existPatient = await prisma.patient.findFirst({
        where: {
          id: arg.patientId,
        },
      });

      if (!existPatient) throw new Error("patient already exist");
      const [updateAppointment] = await prisma.$transaction([
        prisma.appointment.update({
          where: {
            id: arg.id,
          },
          data: {
            patient: {
              connect: { id: existPatient.id },
            },
            startTime: arg.startTime,
            endTime: arg.endTime,
            price: arg.price,
            resource: arg.resource,
            status:
              arg.price > 0 ? APPOINTMENT_TYPE.DONE : APPOINTMENT_TYPE.PENDING,
            note: arg.note,
          },
          include: {
            patient: true,
            user: true,
          },
        }),
      ]);
      return updateAppointment;
    },
    deleteAppointment: async (parent: undefined, args: any, context: any) => {
      const existAppointment = await prisma.appointment.findFirst({
        where: {
          id: args.id,
        },
      });
      if (!existAppointment) throw new Error("Appointment does not exist");
      await prisma.appointment.update({
        where: {
          id: args.id,
        },
        data: {
          status: APPOINTMENT_TYPE.CANCELED,
        },
      });
      return "deleted";
    },
    cancelAll: async (parent: undefined, args: any, context: any) => {
      const getIdUser = await getUser(context.authorization.split(" ")[1]);
      if (!getIdUser) throw new Error("id not provided");
      const existUser = await prisma.user.findFirst({
        where: {
          id: getIdUser.sub?.toString(),
        },
      });
      if (!existUser) throw new Error("id not provided");

      const formatDate1 = formatISO(args.date);

      // const n = new Date(formatDate1);
      const adHour = new Date(formatDate1).setHours(
        new Date(formatDate1).getHours() + 1
      );
      const formattedStart = format(adHour, "yyyy-MM-dd");
      const formattedEnd = format(adHour, "yyyy-MM-dd");
      const formatTime = format(new Date().getTime(), "kk:mm:ss");

      const time = isSameDay(new Date(), formatDate1) ? formatTime : "00:00:00";

      const query: {
        startTime: { gte: Date };
        endTime: { lte: Date };
        resource?: string;
      } = {
        startTime: {
          gte: new Date(`${formattedStart}T${time}`),
        },
        endTime: {
          lte: new Date(`${formattedEnd}T23:59:59.999`),
        },
      };
      if (args.resource) {
        query.resource = args.resource;
      }

      const getAppointments = await prisma.appointment.findMany({
        where: { ...query },
      });

      const [canceledAppointment] = await prisma.$transaction([
        prisma.appointment.updateMany({
          where: { id: { in: getAppointments.map((s) => s.id) } },
          data: {
            status: APPOINTMENT_TYPE.CANCELED,
          },
        }),
      ]);
      return "canceled";
    },
  },
};
