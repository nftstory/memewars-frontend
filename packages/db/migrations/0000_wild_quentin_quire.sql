CREATE TABLE IF NOT EXISTS "accounts" (
	"type" text NOT NULL,
	"provider" text,
	"provider_account_id" text,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	"user_id" uuid NOT NULL,
	CONSTRAINT accounts_provider_provider_account_id PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "authenticators" (
	"id" serial PRIMARY KEY NOT NULL,
	"credential_id" text,
	"credential_public_key" text,
	"counter" integer NOT NULL,
	"credential_device_type" text,
	"credential_backed_up" boolean,
	"transports" json DEFAULT '[]'::json,
	"user_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "memewar" (
	"id" serial PRIMARY KEY NOT NULL,
	"address" text,
	"collection_name" text,
	"token_id" integer,
	"mint_count" integer,
	"started_at" timestamp DEFAULT now(),
	"creator_user_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_token" text,
	"created_at" timestamp DEFAULT now(),
	"user_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text,
	"image" text,
	"current_challenge" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification_tokens" (
	"identifier" text,
	"token" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT verification_tokens_identifier_token PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "authenticators" ADD CONSTRAINT "authenticators_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "memewar" ADD CONSTRAINT "memewar_creator_user_id_user_id_fk" FOREIGN KEY ("creator_user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
