import { pgTable, serial, text, integer, timestamp, primaryKey } from "drizzle-orm/pg-core"
import type { AdapterAccount } from "@auth/core/adapters"
import { relations } from "drizzle-orm"
import type { Base64URLString } from "@utils/zod"

/**
 * - Tables
 */
export const accounts = pgTable("accounts", {
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
        .references(() => users.id, { onDelete: "cascade" }),
},
    (account) => ({
        compoundKey: primaryKey(account.provider, account.providerAccountId)
    }))

export const sessions = pgTable("sessions", {
    id: serial('id').primaryKey(),
    sessionToken: text("session_token"),
    expires: timestamp('created_at').defaultNow(),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
})

export const users = pgTable("user", {
    id: serial('id').primaryKey(),
    name: text("name"),
    email: text("email"),
    emailVerified: timestamp('created_at').defaultNow(),
    image: text("image"),
    currentChallenge: text("current_challenge").$type<Base64URLString>(),
})

export const verificationTokens = pgTable("verification_tokens", {
    identifier: text("identifier"),
    token: text("token"),
    expires: timestamp('created_at').defaultNow(),
},
    (vt) => ({
        compoundKey: primaryKey(vt.identifier, vt.token)
    })
)

export const authenticators = pgTable("authenticators", {
    id: serial('id').primaryKey(),
    credentialID: text('credential_id').$type<Base64URLString>(),
    credentialPublicKey: text('credential_public_key').$type<Base64URLString>(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credential_device_type"),
    credentialBackedUp: integer("credential_backed_up"),
    transports: text("transports"),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
})


/**
 * Relations
 */
export const usersRelations = relations(users, ({ many, one }) => ({
    authenticators: many(authenticators),
    sessions: many(sessions),
    accounts: one(accounts, {
        fields: [users.id],
        references: [accounts.userId]
    })
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id]
    })
}))

export const authenticatorsRelations = relations(authenticators, ({ one }) => ({
    user: one(users, {
        fields: [authenticators.userId],
        references: [users.id]
    })
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
    user: one(users, {
        fields: [accounts.userId],
        references: [users.id]
    })
}))