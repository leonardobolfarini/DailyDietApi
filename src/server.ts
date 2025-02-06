import fastify from 'fastify'
import { env } from './env'
import fastifyCookies from '@fastify/cookie'
import { usersRoute } from './routes/users'

const app = fastify()

app.register(fastifyCookies)
app.register(usersRoute, {
  prefix: '/users',
})

app.listen({
  port: env.PORT,
})
