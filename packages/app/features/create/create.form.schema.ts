import z from 'zod'

export const createMemeSchema = z.object({
	image: z.string().url()
})

export type CreateMemeForm = z.infer<typeof createMemeSchema>