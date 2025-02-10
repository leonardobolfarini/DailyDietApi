/* eslint-disable camelcase */
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

  app.get(
    '/',
    { preHandler: [checkUserIsRegistered] },
    async (request, reply) => {
      const { userId } = request.cookies

      const listMeals = await knex('meals')
        .where('session_id', userId)
        .select('*')

      reply.send({
        listMeals,
      })
    },
  )

  app.delete(
    '/:mealId',
    { preHandler: [checkUserIsRegistered] },
    async (request, reply) => {
      const deleteMealSchema = z.object({
        mealId: z.string().uuid(),
      })

      const { mealId } = deleteMealSchema.parse(request.params)
      const { userId } = request.cookies

      const isMealExists = await knex('meals')
        .where({
          id: mealId,
          session_id: userId,
        })
        .select()
        .first()

      if (!isMealExists) {
        reply.status(404).send('Meal not found.')
      }

      await knex('meals')
        .where({
          id: mealId,
          session_id: userId,
        })
        .first()
        .delete()

      reply.status(200).send()
    },
  )

  app.put(
    '/:mealId',
    { preHandler: [checkUserIsRegistered] },
    async (request, reply) => {
      const updateMealParamsSchema = z.object({
        mealId: z.string().uuid(),
      })

      const updateMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isInDiet: z.enum(['in', 'out']),
        eated_at: z.string(),
      })

      const { mealId } = updateMealParamsSchema.parse(request.params)
      const { name, description, eated_at, isInDiet } =
        updateMealBodySchema.parse(request.body)
      const { userId } = request.cookies

      const isMealExists = await knex('meals')
        .where({
          id: mealId,
          session_id: userId,
        })
        .select()
        .first()

      if (!isMealExists) {
        reply.status(404).send('Meal not found.')
      }

      await knex('meals')
        .where({
          id: mealId,
          session_id: userId,
        })
        .first()
        .update({
          name,
          description,
          eated_at,
          isInDiet,
        })

      reply.status(200).send()
    },
  )

  app.get(
    '/:mealId',
    { preHandler: [checkUserIsRegistered] },
    async (request, reply) => {
      const mealParamsSchema = z.object({
        mealId: z.string().uuid(),
      })

      const { mealId } = mealParamsSchema.parse(request.params)

      if (!mealId) {
        reply.status(404).send({
          error: 'Meal not found',
        })
      }
      const { userId } = request.cookies

      const meal = await knex('meals')
        .where({
          id: mealId,
          session_id: userId,
        })
        .select()
        .first()

      if (!meal) {
        reply.status(404).send('Meal not found.')
      }

      reply.status(200).send(meal)
    },
  )
}
