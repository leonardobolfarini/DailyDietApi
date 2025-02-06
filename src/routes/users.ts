import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'

export async function usersRoute(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      avatarUrl: z.string().nullish(),
    })

    const createUserParsed = createUserBodySchema.parse(request.body)
    const cookies = randomUUID()

    await knex('users').insert({
      id: cookies,
      name: createUserParsed.name,
      avatarUrl: createUserParsed.avatarUrl,
    })

    reply
      .setCookie('userId', cookies, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })
      .status(201)
      .send()
  })
}
