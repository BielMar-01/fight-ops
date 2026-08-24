import Fastify from 'fastify'

import { configureApp, fastifyOptions } from './application.js'

const app = Fastify(fastifyOptions)

configureApp(app)

export default app