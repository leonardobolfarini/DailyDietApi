import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('Meals Routes', () => {
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

  it('should create a new meal', async () => {
    const user = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        avatarUrl: 'johndoe.png',
      })
      .expect(201)

    const cookies = user.get('Set-Cookie')!

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Healthy food',
        description: 'Healthy food',
        isInDiet: 'in',
        eated_at: '2025-02-09 12:00:00',
      })
      .expect(201)
  })

  it('should list all meals', async () => {
    const user = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        avatarUrl: 'johndoe.png',
      })
      .expect(201)

    const cookies = user.get('Set-Cookie')!

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Healthy food',
        description: 'Healthy food',
        isInDiet: 'in',
        eated_at: '2025-02-09 12:00:00',
      })
      .expect(201)

    const mealsList = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    expect(mealsList.body.listMeals).toEqual([
      expect.objectContaining({
        name: 'Healthy food',
        description: 'Healthy food',
        isInDiet: 'in',
        eated_at: '2025-02-09 12:00:00',
      }),
    ])
  })

  it('should delete a meal', async () => {
    const user = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        avatarUrl: 'johndoe.png',
      })
      .expect(201)

    const cookies = user.get('Set-Cookie')!

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Healthy food',
        description: 'Healthy food',
        isInDiet: 'in',
        eated_at: '2025-02-09 12:00:00',
      })
      .expect(201)

    const mealsList = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const mealId = mealsList.body.listMeals[0].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)

    const mealsListAfterDelete = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    expect(mealsListAfterDelete.body.listMeals).toEqual([])
  })

  it('should update a meal', async () => {
    const user = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        avatarUrl: 'johndoe.png',
      })
      .expect(201)

    const cookies = user.get('Set-Cookie')!

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Healthy food',
        description: 'Healthy food',
        isInDiet: 'in',
        eated_at: '2025-02-09 12:00:00',
      })
      .expect(201)

    const mealsList = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const mealId = mealsList.body.listMeals[0].id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({
        name: 'Junk food',
        description: 'Junk food',
        isInDiet: 'out',
        eated_at: '2025-02-09 12:00:00',
      })
      .expect(200)

    const mealsListAfterDelete = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    expect(mealsListAfterDelete.body.listMeals).toEqual([
      expect.objectContaining({
        name: 'Junk food',
        description: 'Junk food',
        isInDiet: 'out',
        eated_at: '2025-02-09 12:00:00',
      }),
    ])
  })

  it('should get only one meal', async () => {
    const user = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        avatarUrl: 'johndoe.png',
      })
      .expect(201)

    const cookies = user.get('Set-Cookie')!

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Healthy food',
        description: 'Healthy food',
        isInDiet: 'in',
        eated_at: '2025-02-09 12:00:00',
      })
      .expect(201)

    const mealsList = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const mealId = mealsList.body.listMeals[0].id

    const mealSelected = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(mealSelected.body).toEqual(
      expect.objectContaining({
        name: 'Healthy food',
        description: 'Healthy food',
        isInDiet: 'in',
        eated_at: '2025-02-09 12:00:00',
      }),
    )
  })
})
