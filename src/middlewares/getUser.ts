import jwt from 'jsonwebtoken'
import { accessSecret } from '../config/vars'

export const getUser = (token: string) => {
  try {
    if (token) {
      return jwt.verify(token, accessSecret)
    }
    return null
  } catch (err) {
    return null
  }
}
