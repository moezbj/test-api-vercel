import nodemailer from "nodemailer";
import { Options } from "nodemailer/lib/mailer";
import { Mail } from "../config/vars";

export const transport = nodemailer.createTransport({
  host: Mail.host,
  port: Mail.port,
  secure: true, // 🚨 CRITICAL: Must be true for port 465 (false for 587)
  auth: {
    user: Mail.user,
    pass: Mail.password,
  },
});

export const sandMail = async (mailOptions: Options) => {
  
  try {
    const res = await transport.sendMail(mailOptions);
    return res;
  } catch (error: any) {
    // 🚨 This will print the exact Gmail rejection reason to your console
    throw error; 
  }
};