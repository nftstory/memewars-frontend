import type { Config } from 'drizzle-kit'

import * as dotenv from 'dotenv'

dotenv.config({ path: `.env${process.env.DEV ? '.development' : ''}` })

const DB_URL = process.env.DATABASE_URL

if (!DB_URL) {
    throw new Error('DATABASE_URL is not set')
}

export default {
    schema: './schema/*',
    out: './migrations',
    driver: 'pg',
    dbCredentials: { connectionString: DB_URL },
} satisfies Config