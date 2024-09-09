import nodemailer from "nodemailer";
import { Options } from "nodemailer/lib/mailer";

import { Mail } from "../config/vars";
console.log("Mail", Mail);

export const transport = nodemailer.createTransport({
  host: Mail.host,
  port: Mail.port,
  auth: {
    user: Mail.user,
    pass: Mail.password,
  },
});

export const sandMail = async (mailOptions: Options) => {
  const res = await transport.sendMail(mailOptions);
  return res;
};
