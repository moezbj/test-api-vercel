import bcrypt from 'bcryptjs';

import {
  Prisma,
  PrismaClient,
} from '@prisma/client';

export function hash(str: string, sync?: boolean) {
  const rounds = process.env.NODE_ENV === 'development' ? 1 : 10;

  if (sync) {
    return bcrypt.hashSync(str, rounds);
  }

  return bcrypt.hash(str, rounds);
}

async function hashField<
  D extends Record<string, any>,
  K extends {
    [K in keyof D]: D[K] extends
      | string
      | Prisma.StringFieldUpdateOperationsInput
      ? K
      : never;
  }[keyof D],
>(data: D, key: K) {
  const value = data[key];
  if (value) {
    if (typeof value === 'string') {
      (data as any)[key] = await hash(value);
    } else if (value.set) {
      data[key].set = await hash(value.set);
    }
  }
}

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['warn', 'error']
      : ['warn', 'error'],
  datasources: process.env.JEST_WORKER_ID
    ? {
        db: {
          url: new URL(
            `test${process.env.JEST_WORKER_ID}`,
            process.env.DATABASE_URL as string,
          ).href,
        },
      }
    : undefined,
  errorFormat: 'pretty',
});

export default prisma.$extends({
  query: {
    user: {
      async $allOperations({ operation, args, query }) {
        if (
          operation === 'create' ||
          operation === 'update' ||
          operation === 'updateMany'
        ) {
          await hashField(args.data, 'password');
        }

        if (operation === 'createMany') {
          if (Array.isArray(args.data)) {
            await Promise.all(args.data.map((d) => hashField(d, 'password')));
          } else {
            await hashField(args.data, 'password');
          }
        }

        return query(args);
      },
    },
    token: {
      async create({ args, query }) {
        await hashField(args.data, 'token');

        return query(args);
      },
      async createMany({ args, query }) {
        if (Array.isArray(args.data)) {
          await Promise.all(args.data.map((d) => hashField(d, 'token')));
        } else {
          await hashField(args.data, 'token');
        }

        return query(args);
      },
    },
  },
}) as unknown as typeof prisma;
