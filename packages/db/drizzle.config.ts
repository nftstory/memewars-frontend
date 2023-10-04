import type { Config } from 'drizzle-kit'

import * as dotenv from 'dotenv'

dotenv.config({ path: `.env${process.env.DEV ? '.development' : ''}` })

const CONNECTION_STRING = process.env.SUPABASE_CONNECTION_STRING

if (!CONNECTION_STRING) {
    throw new Error('SUPABASE_CONNECTION_STRING is not set')
}

export default {
    schema: './schema.ts',
    out: './migrations',
    driver: 'pg',
    dbCredentials: { connectionString: CONNECTION_STRING },
} satisfies Config