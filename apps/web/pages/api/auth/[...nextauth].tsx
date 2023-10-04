import NextAuth from "next-auth"
import { authOptions } from '@api/auth/options'

export default NextAuth(authOptions)
