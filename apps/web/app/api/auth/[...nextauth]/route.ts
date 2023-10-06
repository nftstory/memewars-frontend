import NextAuth, { getServerSession } from 'next-auth'
import { authOptions } from '@api/auth/options'
import * as crypto from 'crypto'
import { cookies } from 'next/headers'
import { headers } from 'next/headers'
import { db, users } from '@db/index'
import { bufferToBase64UrlString } from '@utils/base64-url'
import { eq } from 'drizzle-orm'
import { type NextRequest } from 'next/server'
import * as jose from 'jose'


type Base64URLString = string & { __brand: 'Base64URLString' }
interface RouteHandlerContext {
  params: { nextauth: string[] }
}

export async function POST(req: NextRequest, context: RouteHandlerContext) {
  const headersStore = headers()
  const searchParams = req.nextUrl.searchParams

  const hasXChallenge = !!headersStore.get('x-challenge')

  if (searchParams.get('nextauth') === 'csrf' && !hasXChallenge) {
    // - post request to this route should have an existing user 
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
    }

    req.headers.set('x-challenge', challenge)
  }

  return await NextAuth(req, context, authOptions)
}

export async function GET(req: NextRequest, context: RouteHandlerContext) {
  const cookieStore = cookies()
  const headersStore = headers()
  const { params } = context

  const hasXChallenge = !!headersStore.get('x-challenge')

  let challenge: Base64URLString | undefined
  if (params?.nextauth.includes('csrf') && hasXChallenge) {
    // - get request to this route is a potential new user 
    // - since they are new we cannot have a `currentChallenge` so we use a secure cookie instead

    const rawChallenge = crypto.randomBytes(32)
    challenge = bufferToBase64UrlString(rawChallenge)

    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!)

    const challengeJwt = await new jose.SignJWT({ challenge })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(process.env.NEXTAUTH_URL!)
      .setExpirationTime('1h')
      .sign(secret)

    cookieStore.set({
      name: 'next-auth.challenge',
      value: challengeJwt,
      domain: process.env.NEXTAUTH_URL!,
      httpOnly: true,
      maxAge: 60 * 60, // - 1 hour,
      secure: true
    })
  }

  const response = await NextAuth(req, context, authOptions)

  if ((response as Response)) {
    response.headers.set('x-challenge', challenge)
  }

  return response
}