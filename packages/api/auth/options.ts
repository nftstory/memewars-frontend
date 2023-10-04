import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@db/schema"

export const authOptions = {
    adapter: DrizzleAdapter(db),
    providers: [
        // TODO: set up credentials provider
    ]
}