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
  token: string
  user: string
  type: TOKEN_TYPE
  deleteToken?: boolean
}) {
  async function isValid(document: Token, token: string, deleteToken: boolean) {
    if (!(await bcrypt.compare(token, document.token))) return undefined
    if (deleteToken) {
      await prisma.token.delete({ where: { id: document.id } })
    }
    return document
  }

  const documents = await prisma.token.findMany({
    where: { user, type },
  })

  const validData = await Promise.all(
    documents.map((document) => isValid(document, token, deleteToken)),
  )

  const doc = validData.find(Boolean)

  if (!doc) throw new Error('Invalid token')

  return doc
}
