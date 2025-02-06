import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { checkUserIsRegistered } from '../middlewares/check-user-is-registered'

export async function mealsRoute(app: FastifyInstance) {
  app.post(
    '/',
    { preHandler: [checkUserIsRegistered] },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string().nullish(),
        isInDiet: z.enum(['in', 'out']),
        eated_at: z.string(),
      })

      const createMealParsed = createMealBodySchema.parse(request.body)
      const cookies = request.cookies.userId

      await knex('meals').insert({
        id: randomUUID(),
        session_id: cookies,
        name: createMealParsed.name,
        description: createMealParsed.description,
        isInDiet: createMealParsed.isInDiet,
        eated_at: createMealParsed.eated_at,
      })

      reply.status(201).send()
    },
  )

  app.get('/', async (_, reply) => {
    const listMeals = await knex('meals').select()

    reply.send(listMeals)
  })
}
