import NextAuth, { getServerSession } from 'next-auth'
import { authOptions } from '@api/auth/options'
import * as crypto from 'crypto'
import { serialize } from 'cookie'
import { db, users } from '@db/index'
import { bufferToBase64UrlString } from '@utils/base64-url'
import { eq } from 'drizzle-orm'

import * as jose from 'jose'

import type { NextApiRequest, NextApiResponse } from 'next'

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.nextauth?.includes('csrf') && req.rawHeaders.includes('x-challenge')) {
    const session = await getServerSession()

    const rawChallenge = crypto.randomBytes(32)
    const challenge = bufferToBase64UrlString(rawChallenge)

    if (session) {
      const updatedUser = await db
        .update(users)
        .set({ currentChallenge: challenge })
        // @ts-expect-error: id should exist on session?
        .where(eq(users.id, session.user.id))
        .returning()
      if (!updatedUser) throw new Error('Failed to update user')
    } else {
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!)

      const challengeJwt = await new jose.SignJWT({ challenge })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setIssuer(process.env.NEXTAUTH_URL!)
        .setExpirationTime('1h')
        .sign(secret)

      res.setHeader(
        'Set-Cookie',
        serialize('challenge', challengeJwt, {
          path: '/',
          httpOnly: true,
          maxAge: 60 * 60, // - 1 hour
        }),
      )
    }

    res.setHeader('X-Challenge', challenge)
  }

  return await NextAuth(req, res, authOptions)
}
