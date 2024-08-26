import { Appointment, APPOINTMENT_TYPE } from "@prisma/client";
import prisma from "../../config/prisma";
import { getUser } from "../../middlewares/getUser";
import { formatISO, format, isSameDay } from "date-fns";
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
      const list = await prisma.appointment.findMany({
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
          ...(arg.patient ? { patient: arg.patient } : {}),
          ...(arg.status ? { status: arg.status } : {}),
        },
        include: {
          patient: true,
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

      const formatDate1 = formatISO(args.date);
      const n = new Date(formatDate1);
      const formattedStart = format(n, "yyyy-MM-dd");
      const formattedEnd = format(n, "yyyy-MM-dd");

      const [listAppointment, feesList] = await prisma.$transaction([
        prisma.appointment.findMany({
          where: {
            userId: args.userId,
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
            date: {
              gte: new Date(`${formattedEnd}T00:00:00`),
              lte: new Date(`${formattedEnd}T23:59:59.999`),
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
            userId: args.userId,
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

      const existAppointment = await prisma.appointment.findFirst({
        where: {
          startTime: arg.startTime,
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
              connect: existPatient,
            },
            user: { connect: existUser },
            startTime: arg.startTime,
            endTime: arg.endTime,
            price: 0,
            status: APPOINTMENT_TYPE.PENDING,
            note: arg.note,
          },
        }),
      ]);
      console.log("createAppointment", createAppointment);
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
              connect: existPatient,
            },
            startTime: arg.startTime,
            endTime: arg.endTime,
            price: arg.price,
            status:
              arg.price > 0 ? APPOINTMENT_TYPE.DONE : APPOINTMENT_TYPE.PENDING,
            note: arg.note,
          },
        }),
      ]);
      console.log("updateAppointment", updateAppointment);
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
      console.log("formatDate1", new Date().getTime());

      const n = new Date(formatDate1);
      const formattedStart = format(n, "yyyy-MM-dd");
      const formattedEnd = format(n, "yyyy-MM-dd");
      const formatTime = format(new Date().getTime(), "kk:mm:ss");
      console.log("formatTime", formatTime);
      console.log("test", isSameDay(new Date(), formatDate1));
      const time = isSameDay(new Date(), formatDate1) ? formatTime : "00:00:00";

      const getAppointments = await prisma.appointment.findMany({
        where: {
          startTime: {
            gte: new Date(`${formattedStart}T${time}`),
          },
          endTime: {
            lte: new Date(`${formattedEnd}T23:59:59.999`),
          },
        },
      });
      console.log("getAppointments", getAppointments);

      const [canceledAppointment] = await prisma.$transaction([
        prisma.appointment.updateMany({
          where: { id: { in: getAppointments.map((s) => s.id) } },
          data: {
            status: APPOINTMENT_TYPE.CANCELED,
          },
        }),
      ]);
      console.log("canceledAppointment", canceledAppointment);
      return "canceled";
    },
  },
};
