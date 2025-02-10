import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { checkUserIsRegistered } from '../middlewares/check-user-is-registered'

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

  app.get(
    '/summary',
    { preHandler: [checkUserIsRegistered] },
    async (request, reply) => {
      const { userId } = request.cookies

      const quantityMealsRegistered = await knex('meals')
        .where('session_id', userId)
        .orderBy('eated_at', 'desc')

      const quantityOfInDiet = await knex('meals')
        .where({
          session_id: userId,
          isInDiet: 'in',
        })
        .count('id', { as: 'total' })

      const quantityOfOutDiet = await knex('meals')
        .where({
          session_id: userId,
          isInDiet: 'out',
        })
        .count('id', { as: 'total' })

      const { bestOnDietSequence } = quantityMealsRegistered.reduce(
        (acc, meal) => {
          if (meal.isInDiet === 'in') {
            acc.currentSequence += 1
          } else {
            acc.currentSequence = 0
          }

          if (acc.currentSequence > acc.bestOnDietSequence) {
            acc.bestOnDietSequence = acc.currentSequence
          }

          return acc
        },
        { bestOnDietSequence: 0, currentSequence: 0 },
      )

      reply.status(200).send({
        totalMeals: quantityMealsRegistered.length,
        quantityOfInDiet,
        quantityOfOutDiet,
        bestOnDietSequence,
      })
    },
  )
}
