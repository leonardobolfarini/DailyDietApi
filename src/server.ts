import fastify from 'fastify'
import { env } from './env'
import fastifyCookies from '@fastify/cookie'
import { usersRoute } from './routes/users'
import { mealsRoute } from './routes/meals'

const app = fastify()

app.register(fastifyCookies)
app.register(usersRoute, {
  prefix: '/users',
})
app.register(mealsRoute, {
  prefix: '/meals',
})

app.listen({
  port: env.PORT,
})
