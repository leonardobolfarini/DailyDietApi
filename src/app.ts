import fastifyCookies from '@fastify/cookie'
import { usersRoute } from './routes/users'
import { mealsRoute } from './routes/meals'
import fastify from 'fastify'

export const app = fastify()

app.register(fastifyCookies)
app.register(usersRoute, {
  prefix: '/users',
})
app.register(mealsRoute, {
  prefix: '/meals',
})
