import nodemailer from 'nodemailer'
import { Options } from 'nodemailer/lib/mailer'

import { Mail } from '../config/vars'

export const transport = nodemailer.createTransport({
  host: Mail.host,
  port: Mail.port,
  auth: {
    user: Mail.user,
    pass: Mail.password,
  },
})

export const sandMail = async (mailOptions: Options) => {
  return await transport.sendMail(mailOptions)
}
