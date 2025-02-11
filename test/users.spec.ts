import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('Users routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should create a user an add a cookie', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        avatarUrl: 'johndoe.png',
      })
      .expect(201)
  })

  it('should return a user summary about him/her meals', async () => {
    const user = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        avatarUrl: 'johndoe.png',
      })
      .expect(201)

    const cookies = user.get('Set-Cookie')!

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Healthy food',
      description: 'Healthy food',
      isInDiet: 'in',
      eated_at: '2025-02-09 12:00:00',
    })

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Junk food',
      description: 'Junk food',
      isInDiet: 'out',
      eated_at: '2025-02-09 13:00:00',
    })

    await request(app.server)
      .get('/users/summary')
      .set('Cookie', cookies)
      .expect({
        bestOnDietSequence: 1,
        quantityOfInDiet: [
          {
            total: 1,
          },
        ],
        quantityOfOutDiet: [
          {
            total: 1,
          },
        ],
        totalMeals: 2,
      })
  })
})
