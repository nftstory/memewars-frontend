import React from 'react'
import type { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

export const SessionProvider = ({ children }: React.ComponentProps<typeof NextAuthSessionProvider>) => <>{children}</>
