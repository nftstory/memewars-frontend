import { z } from "zod";

export const usernameFormSchema = z.object({
	username: z.string().min(3).max(20),
});

export const csrfTokenSchema = z.object({ csrfToken: z.string() });
