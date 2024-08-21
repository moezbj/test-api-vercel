import { NextFunction, Request, Response } from 'express';
import passport from 'passport';

import { User } from '@prisma/client';

export interface AuthorizeOptions {
  redirect?: boolean;
  allowInactive?: boolean;
}

function handleJWT(req: Request, _res: Response, next: NextFunction) {
  return async (_err: string, user: User) => {
    try {
      req.logIn(user, { session: false }, async () => {
        req.user = user;

        next();
      });
    } catch (e) {
      next();
    }
  };
}

export default function authorize(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  return passport.authenticate(
    'jwt',
    { session: false },
    handleJWT(req, res, next),
  )(req, res, next);
}
