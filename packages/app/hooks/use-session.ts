import { type useSession as useNextAuthSession, SessionContextValue } from 'next-auth/react'

export const useSession: typeof useNextAuthSession = <T extends boolean>() => ({} as SessionContextValue<T>) 