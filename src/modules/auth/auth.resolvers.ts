import prisma from "../../config/prisma";
import bcrypt from "bcryptjs";
import { generateTokenResponse } from "../../middlewares/generateUserToken";
import { getUser } from "../../middlewares/getUser";
import { generateToken, isTokenValid } from "../../middlewares/generateToken";
import { LANGUAGE_TYPE, TOKEN_TYPE } from "@prisma/client";
import { sandMail } from "../../utils/mailer";
import { clientUrl, mailExpiration } from "../../config/vars";
import { sendSms } from "../../utils/sms";
import { format, formatISO } from "date-fns";

interface AuthType {
  email: string;
  password: string;
}

interface RegisterType {
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  password: string;
  withResoures?: boolean;
  taxRegistration: string;
}

export const authResolves = {
  Mutation: {
    login: async (parent: any, args: AuthType) => {
      console.log("args", args);
      const user = await prisma.user.findFirst({
        where: { email: args.email },
      });

      if (!user || !(await bcrypt.compare(args.password, user.password))) {
        throw new Error("LOGIN.INCORRECT");
      }

      if (user && !user?.isActive) {
        throw new Error("LOGIN.BLOCKED");
      }
      const token = await generateTokenResponse(user.id);
      // await sendSms(["+21652984142"], "Greetings from D7 API ")
      return { token, user };
    },
    register: async (parent: any, args: RegisterType) => {
     /*  const userCreated = await prisma.user.findFirst();

      if (userCreated) {
        throw new Error("USER ALREADY EXISTS");
      } */
      const user = await prisma.user.findFirst({
        where: { email: args.email },
      });

      if (user) {
        throw new Error("USER ALREADY EXISTS");
      }
      const timeStart = new Date().setHours(8, 0, 0, 0);
      const formattedStart = format(timeStart, "yyyy-MM-dd kk:mm:ss");
      const timeEnd = new Date().setHours(18, 0, 0, 0);
      const formattedEnd = format(timeEnd, "yyyy-MM-dd kk:mm:ss");
      const createdUser = await prisma.user.create({
        data: {
          email: args.email,
          firstName: args.firstName,
          lastName: args.lastName,
          password: args.password,
          withResoures: args.withResoures,
          language: "fr",
          startWork: formattedStart,
          endWork: formattedEnd,
          taxRegistration: args.taxRegistration,
        },
      });
      const token = await generateTokenResponse(createdUser.id);
      /*    await sandMail({
        to: createdUser.email,
        text: `welcome to hero task`,
      }); */
      return { token, user: createdUser };
    },
    logout: async (parent: any, args: any, contextValue: any) => {
      const getIdUser = await getUser(contextValue.authorization.split(" ")[1]);
      if (!getIdUser) throw new Error("id not provided");
      const existUser = await prisma.user.findFirst({
        where: {
          id: getIdUser.sub?.toString(),
        },
      });
      if (!existUser) throw new Error("user dosen't exist");
      await isTokenValid({
        token: args.token,
        type: TOKEN_TYPE.REFRESH,
        user: existUser.id,
      });
      return "done";
    },
    forgotPassword: async (parent: any, args: { email: string }) => {
      const existUser = await prisma.user.findFirst({
        where: {
          email: args.email,
        },
      });
      if (!existUser) throw new Error("USER_NOT_EXIST");
      const { token } = await generateToken(existUser.id, TOKEN_TYPE.FORGET, {
        days: mailExpiration,
      });

      let info = await sandMail({
        from: "Office schedule",
        to: existUser.email,
        html: `
        <html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Clickable Link</title>
</head>
<body>
       <p>To reset your password, please click the link below:</p>
        <a href="${clientUrl}/reset-password/${existUser.id}/${token}" style="color: #1a73e8; text-decoration: none;">Click here to reset your password</a>
        <br>
        <p>If the above link doesn't work, you can copy and paste this URL into your browser:</p>
        <p>${clientUrl}/reset-password/${existUser.id}/${token}</p>
</body>
</html>`,
      });
      return "sent";
    },
    resetPassword: async (
      parent: any,
      args: { password: string; confirm: string; token: string }
    ) => {
      const getIdUser = await getUser(args.token);
      if (!getIdUser) throw new Error("id not provided");
      const existUser = await prisma.user.findFirst({
        where: {
          id: getIdUser.sub?.toString(),
        },
      });
      if (!existUser) throw new Error("USER_NOT_EXIST");

      if (args.password !== args.confirm)
        throw new Error("PASSWORD_NOT_MATCH");

      await prisma.user.update({
        where: { id: existUser.id },
        data: { password: args.password },
      });
      return "updated";
    },

    updateLanguages: async (
      parent: any,
      args: { lang: LANGUAGE_TYPE },
      contextValue: any
    ) => {
      const getIdUser = await getUser(contextValue.authorization.split(" ")[1]);
      if (!getIdUser) throw new Error("id not provided");
      const existUser = await prisma.user.findFirst({
        where: {
          id: getIdUser.sub?.toString(),
        },
      });
      if (!existUser) throw new Error("user dosen't exist");
      await prisma.user.update({
        where: {
          id: existUser.id,
        },
        data: {
          language: args.lang,
        },
      });
      return args.lang;
    },
    updateCountry: async (parent: any, args: any, contextValue: any) => {
      const getIdUser = await getUser(contextValue.authorization.split(" ")[1]);
      if (!getIdUser) throw new Error("id not provided");
      const existUser = await prisma.user.findFirst({
        where: {
          id: getIdUser.sub?.toString(),
        },
      });
      if (!existUser) throw new Error("user dosen't exist");
      const u = await prisma.user.update({
        where: {
          id: existUser.id,
        },
        data: {
          country: args.country,
          currency: args.currency,
        },
      });
      return u;
    },
    updateWork: async (parent: any, args: any, contextValue: any) => {
      const getIdUser = await getUser(contextValue.authorization.split(" ")[1]);
      if (!getIdUser) throw new Error("id not provided");
      const existUser = await prisma.user.findFirst({
        where: {
          id: getIdUser.sub?.toString(),
        },
      });
      if (!existUser) throw new Error("user dosen't exist");

      const formatDateStart = formatISO(args.startWork);
      const timeStart = new Date(formatDateStart).setHours(
        new Date(formatDateStart).getHours() + 1
      );
      const formattedStart = format(timeStart, "yyyy-MM-dd kk:mm:ss");

      const formatDateEnd = formatISO(args.endWork);
      const timeEnd = new Date(formatDateEnd).setHours(
        new Date(formatDateEnd).getHours() + 1
      );
      const formattedEnd = format(timeEnd, "yyyy-MM-dd kk:mm:ss");

      const updatedUser = await prisma.user.update({
        where: {
          id: existUser.id,
        },
        data: {
          startWork: formattedStart,
          endWork: formattedEnd,
          slotDuration: args.slotDuration,
        },
      });
      return {
        startWork: updatedUser.startWork,
        endWork: updatedUser.endWork,
        slotDuration: updatedUser.slotDuration,
      };
    },
  },
  /* Query: {
    profile: (parent: any, args: unknown, context: any) => {
      console.log('poias', context.req.user)
      return context.req.user
    },
  }, */
};
