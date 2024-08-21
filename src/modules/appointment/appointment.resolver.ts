import { APPOINTMENT_TYPE } from '@prisma/client'
import prisma from '../../config/prisma'
import { getUser } from '../../middlewares/getUser'

export const appointmentResolver = {
  Query: {
    appointments: async (
      parent: Record<string, any>,
      args: Record<string, any>,
      context: any,
    ) => {
      const getIdUser = await getUser(context.authorization.split(' ')[1])
      if (!getIdUser) throw new Error('id not provided')
      const existUser = await prisma.user.findFirst({
        where: {
          id: getIdUser.sub?.toString(),
        },
      })
      if (!existUser) throw new Error('id not provided')
      console.log('args.name', args.name)
      const arg: {
        userId: string
        patient?: { name: string }
        startTime?: string
        endTime?: string
        status?: 'DONE' | 'CANCELED' | 'PENDING'
      } = {
        userId: existUser.id,
      }

      if (args.name) {
        arg.patient = {
          name: args.name,
        }
      }
      if (args.status) {
        arg.status = args.status
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
      })
      return list
    },
    appointment: async (
      parent: Record<string, any>,
      args: Record<string, any>,
      context: any,
    ) => {
      const getIdUser = await getUser(context.authorization.split(' ')[1])
      if (!getIdUser) throw new Error('id not provided')
      const existUser = await prisma.user.findFirst({
        where: {
          id: getIdUser.sub?.toString(),
        },
      })
      if (!existUser) throw new Error("user dosen't exist")
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: args.id,
          userId: existUser.id,
        },
      })
      return appointment
    },
  },
  Mutation: {
    createAppointment: async (parent: undefined, args: any, context: any) => {
      const arg = args.input
      const getIdUser = await getUser(context.authorization.split(' ')[1])
      if (!getIdUser) throw new Error('id not provided')
      const existUser = await prisma.user.findFirst({
        where: {
          id: getIdUser.sub?.toString(),
        },
      })
      if (!existUser) throw new Error('id not provided')

      const existAppointment = await prisma.appointment.findFirst({
        where: {
          startTime: arg.startTime,
        },
      })
      if (existAppointment) throw new Error('existAppointment already exist')

      const existPatient = await prisma.patient.findFirst({
        where: {
          id: arg.patientId,
        },
      })

      if (!existPatient) throw new Error('patient already exist')
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
      ])
      console.log('createAppointment', createAppointment)
      return createAppointment
    },
    updateAppointment: async (parent: undefined, args: any, context: any) => {
      const arg = args.input
      const getIdUser = await getUser(context.authorization.split(' ')[1])
      if (!getIdUser) throw new Error('id not provided')
      const existUser = await prisma.user.findFirst({
        where: {
          id: getIdUser.sub?.toString(),
        },
      })
      if (!existUser) throw new Error('id not provided')

      const existAppointment = await prisma.appointment.findFirst({
        where: {
          id: arg.id,
        },
      })
      if (!existAppointment) throw new Error('Appointment does not exist')

      const existPatient = await prisma.patient.findFirst({
        where: {
          id: arg.patientId,
        },
      })

      if (!existPatient) throw new Error('patient already exist')
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
      ])
      console.log('updateAppointment', updateAppointment)
      return updateAppointment
    },
    deleteAppointment: async (parent: undefined, args: any, context: any) => {
      const existAppointment = await prisma.appointment.findFirst({
        where: {
          id: args.id,
        },
      })
      if (!existAppointment) throw new Error('Appointment does not exist')
      await prisma.appointment.update({
        where: {
          id: args.id,
        },
        data: {
          status: APPOINTMENT_TYPE.CANCELED,
        },
      })
      return 'deleted'
    },
  },
}
