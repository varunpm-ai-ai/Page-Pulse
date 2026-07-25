import { createServer } from "node:http"

import dotenv from "dotenv"

import { env } from "./config/env.js"
import { createApp } from "./app.js"
import { createSocketServer } from "./socket.js"

dotenv.config()

export function createServerInstance() {
  const app = createApp()
  const server = createServer(app)
  const socket = createSocketServer(server)

  app.locals.emitAnalysisProgress = socket.emitAnalysisProgress
  app.locals.emitAnalysisError = socket.emitAnalysisError

  return { app, server, io: socket.io }
}

export function startServer() {
  const { server } = createServerInstance()

  server.listen(env.port, env.host, () => {
    console.log(`Server running at http://${env.host}:${env.port}`)
  })

  return server
}

