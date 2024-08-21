import { getUser } from '../../middlewares/getUser'
import prisma from '../../config/prisma'

export const patientResolver = {
  Query: {
    patients: async (
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

      const list = await prisma.patient.findMany()
      return list
    },
    patient: async (
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

      const workspace = await prisma.patient.findFirst({
        where: {
          id: args.id,
        },
      })
      return workspace
    },
  },
  Mutation: {
    createPatient: async (parent: undefined, args: any, context: any) => {
      const arg = args.input

      const getIdUser = await getUser(context.authorization.split(' ')[1])
      if (!getIdUser) throw new Error('id not provided')
      const existUser = await prisma.user.findFirst({
        where: {
          id: getIdUser.sub?.toString(),
        },
      })
      if (!existUser) throw new Error("user dosen't exist")

      const existPatient = await prisma.patient.findFirst({
        where: {
          name: arg.name,
        },
      })
      if (existPatient) throw new Error('user already exist')
      const [createPatient] = await prisma.$transaction([
        prisma.patient.create({
          data: {
            name: arg.name,
            email: arg.email,
            age: arg.age,
            insurance: arg.insurance,
            phone: arg.phone,
            note: arg.note,
          },
        }),
      ])
      return createPatient
    },
    updatePatient: async (parent: undefined, args: any, context: any) => {
      const getIdUser = await getUser(context.authorization.split(' ')[1])
      if (!getIdUser) throw new Error('id not provided')
      const existUser = await prisma.user.findFirst({
        where: {
          id: getIdUser.sub?.toString(),
        },
      })
      if (!existUser) throw new Error("user dosen't exist")

      const existPatient = await prisma.patient.findFirst({
        where: {
          name: args.id,
        },
      })
      if (existPatient) throw new Error('patient already exist')

      const [createPatient] = await prisma.$transaction([
        prisma.patient.update({
          where: {
            id: args.id,
          },
          data: {
            name: args.name,
            email: args.email,
            age: args.age,
            insurance: args.insurance,
            phone: args.phone,
            note: args.note,
          },
        }),
      ])
      return createPatient
    },
  },
}