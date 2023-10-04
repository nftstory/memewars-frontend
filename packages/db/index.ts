import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

export * from './schema'

const connectionString = process.env.SUPABASE_CONNECTION_STRING

let client: ReturnType<typeof postgres>
export let db: ReturnType<typeof drizzle<typeof schema>>

// - use an if instead of a throwing guard so we can still export the schema from this file
if (connectionString) {
    client = postgres(connectionString)
    db = drizzle<typeof schema>(client)
}