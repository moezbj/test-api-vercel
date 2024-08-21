import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';

import prisma from './prisma';
import { User } from '@prisma/client';

import { accessSecret } from './vars';

const jwtOptions = {
  secretOrKey: accessSecret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
};

const jwt = async (
  payload: { sub: string },
  done: (e: Error | null, user: User | boolean) => void,
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (user) return done(null, user);
    return done(null, false);
  } catch (error: any) {
    return done(error, false);
  }
};

export default {
  jwt: new JwtStrategy(jwtOptions, jwt),
};
