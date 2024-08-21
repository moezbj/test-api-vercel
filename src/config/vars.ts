import { config } from 'dotenv';

config();

export const isDev = process.env.NODE_ENV === 'development';
export const port = process.env.PORT;
export const databaseUri = process.env.DATABASE_URL as string;

export const clientUrl = process.env.CLIENT_URL as string;
export const clientFront = process.env.CLIENT_FRONT as string;
export const accessSecret = process.env.ACCESS_SECRET as string;
export const expirationInterval = Number(process.env.JWT_EXPIRATION_MINUTES);
export const mailExpiration = Number(process.env.MAIL_EXPIRATION_DAYS);

export const Mail = {
    host: process.env.MAIL_HOST as string,
    port: Number(process.env.MAIL_PORT),
    user: process.env.MAIL_AUTH_USER as string,
    password: process.env.MAIL_AUTH_USER_PASSWORD as string,
    brevoApiKey:process.env.MAIL_BREVO_APIKEY
  };