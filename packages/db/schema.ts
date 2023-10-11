import { pgTable, serial, text, integer, timestamp, primaryKey, uuid, boolean, json } from "drizzle-orm/pg-core"
import type { AdapterAccount } from "@auth/core/adapters"
import { relations } from "drizzle-orm"
import type { Base64URLString } from "@forum/passkeys"
import type { Address } from 'abitype'

type AccountType = AdapterAccount["type"] | 'credentials'

/**
 * - Tables
 */
export const accounts = pgTable("accounts", {
    type: text("type").$type<AccountType>().notNull(),
    provider: text("provider"),
    providerAccountId: text("provider_account_id"),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
    userId: uuid("user_id")
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
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
})

export const users = pgTable("user", {
    id: uuid('id').primaryKey().defaultRandom(),
    username: text("username"),
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
    credentialBackedUp: boolean("credential_backed_up"),
    transports: json("transports").$type<AuthenticatorTransport[]>().default([]),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
})

export const memewar = pgTable('memewar', {
    id: serial('id').primaryKey(),
    address: text('address').$type<Address & { __brand: 'Address' }>(),
    collectionName: text('collection_name'),
    tokenId: integer('token_id'),
    mintCount: integer('mint_count'),
    startedAt: timestamp('started_at').defaultNow(),
    creatorUserId: uuid('creator_user_id').references(() => users.id, { onDelete: 'cascade' })
})

/**
 * old definition:
 * 
 * create table public.memewar (
    id bigint not null,
    address text null,
    collection_name text null,
    token_id bigint null,
    uri text null,
    started_at timestamp with time zone null,
    mint_count bigint null,
    creator_name text null,
    constraint memewar_pkey primary key (id)
  ) tablespace pg_default;
 */


/**
 * Relations
 */
export const usersRelations = relations(users, ({ many, one }) => ({
    memewars: many(memewar),
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

export const memewarRelations = relations(memewar, ({ one }) => ({
    user: one(users, {
        fields: [memewar.creatorUserId],
        references: [users.id]
    })
}))