import { pgTable, serial, text, integer, timestamp, primaryKey } from "drizzle-orm/pg-core"
import type { AdapterAccount } from "@auth/core/adapters"

export const account = pgTable("account", {
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider"),
    providerAccountId: text("provider_account_id"),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at").notNull(),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
},
    (account) => ({
        compoundKey: primaryKey(account.provider, account.providerAccountId)
    }))

export const session = pgTable("session", {
    id: serial('id').primaryKey(),
    sessionToken: text("session_token"),
    expires: timestamp('created_at').defaultNow(),
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
})

export const user = pgTable("user", {
    id: serial('id').primaryKey(),
    name: text("name"),
    email: text("email"),
    emailVerified: timestamp('created_at').defaultNow(),
    image: text("image"),
    // TODO: define these relations
    // accounts: text('account[]_undefined'),
    // sessions: text('session[]_undefined'),
    // authenticators: text('authenticator[]_undefined'),
    currentChallenge: text("current_challenge"),
})

export const verificationToken = pgTable("verification_token", {
    identifier: text("identifier"),
    token: text("token"),
    expires: timestamp('created_at').defaultNow(),
},
    (vt) => ({
        compoundKey: primaryKey(vt.identifier, vt.token)
    })
)

export const authenticator = pgTable("authenticator", {
    id: serial('id').primaryKey(),
    credentialID: text('credential_id'),
    credentialPublicKey: text('credential_public_key'),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credential_device_type"),
    credentialBackedUp: integer("credential_backed_up"),
    transports: text("transports"),
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
})