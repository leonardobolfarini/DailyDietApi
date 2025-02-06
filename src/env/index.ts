import 'dotenv/config'
import { z } from 'zod'

const envVariablesSchema = z.object({
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3333),
})

const _env = envVariablesSchema.safeParse(process.env)
if (_env.success === false) {
  console.error('Invalid environment variables!', _env.error.format())

  throw new Error('Invalid environment variables!')
}

export const env = _env.data
