import { add } from 'date-fns'
import jwt from 'jsonwebtoken'

import { accessSecret, expirationInterval } from '../config/vars'
import { generateToken } from '../middlewares/generateToken'
import { TOKEN_TYPE } from '@prisma/client'

export async function generateUserToken(
  user: string,
): Promise<{ token: string; expiresIn: string }> {
  return new Promise((resolve, reject) => {
    const payload = {
      sub: user,
    }
    const expiresIn = add(new Date(), { minutes: expirationInterval })
    jwt.sign(
      payload,
      accessSecret,
      {
        expiresIn: expiresIn.getTime(),
      },
      (error, token) => {
        if (error || !token) {
          reject('Unable to generate token')
        } else {
          resolve({ token, expiresIn: expiresIn.toISOString() })
        }
      },
    )
  })
}

export async function generateTokenResponse(user: string) {
  const tokenType = 'Bearer'
  const { token: accessToken, expiresIn } = await generateUserToken(user)
  const { token: refreshToken } = await generateToken(
    user,
    TOKEN_TYPE.REFRESH,
    {
      days: 2,
    },
  )
  return {
    tokenType,
    accessToken,
    refreshToken,
    expiresIn,
  }
}
