import bcrypt from 'bcryptjs'
import { add, Duration } from 'date-fns'
import { v4 } from 'uuid'

import prisma from '../config/prisma'
import { Token, TOKEN_TYPE } from '@prisma/client'

export async function generateToken(
  user: string,
  type: TOKEN_TYPE,
  duration: Duration,
) {
  const token = v4()
  const expires = add(new Date(), duration)
  await prisma.token.create({
    data: { token, user, expires, type: type },
  })

  return { token, expires }
}

export async function isTokenValid({
  token,
  user,
  type,
  deleteToken = true,
}: {
  token: string;
  user: string;
  type: TOKEN_TYPE;
  deleteToken?: boolean;
}) {
  async function isValid(document: any, token: string, deleteToken: boolean) {
  
    const isHashed = document.token.startsWith('$2b$') || document.token.startsWith('$2a$') || document.token.startsWith('$2y$');

    let isMatch = false;
    if (isHashed) {
      isMatch = await bcrypt.compare(token, document.token);
    } else {
      isMatch = token === document.token;
    }
    
    if (!isMatch) return undefined;

    if (deleteToken) {
      // 🚨 THE FIX: 
      // Change 'delete' to 'deleteMany'. 
      // deleteMany will NOT crash if the token was already deleted by a concurrent request!
      await prisma.token.deleteMany({ where: { id: document.id } });
    }
    
    return document;
  }

  // 🚨 IMPORTANT PRISMA CHECK: 
  // If your Prisma schema uses 'userId' instead of 'user', change this to:
  // where: { userId: user, type }
  const documents = await prisma.token.findMany({
    where: { user, type }, 
  });

  if (documents.length === 0) {
    throw new Error('Invalid token: No tokens found in DB for this user/type');
  }

  const validData = await Promise.all(
    documents.map((document) => isValid(document, token, deleteToken)),
  );

  const doc = validData.find(Boolean);

  if (!doc) throw new Error('Invalid token: None of the found tokens matched the comparison');

  return doc;
}