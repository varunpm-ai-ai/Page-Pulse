import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"

import { env } from "./config/env.js"
import { analysisRouter } from "./routes/analysis-routes.js"
import { healthRouter } from "./routes/health-routes.js"
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js"

export function createApp({ emitAnalysisProgress, emitAnalysisError } = {}) {
  const app = express()

  app.disable("x-powered-by")
  app.use(helmet())
  app.use(
    cors({
      origin: env.clientOrigin === "*" ? true : env.clientOrigin.split(",").map((origin) => origin.trim()),
    })
  )
  app.use(express.json({ limit: "1mb" }))
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: env.maxRequestsPerMinute,
      standardHeaders: true,
      legacyHeaders: false,
    })
  )

  app.locals.emitAnalysisProgress = emitAnalysisProgress
  app.locals.emitAnalysisError = emitAnalysisError

  app.use("/api", healthRouter)
  app.use("/api", analysisRouter)

  app.get("/", (request, response) => {
    response.status(200).json({
      success: true,
      service: "page-pulse-analysis-api",
      endpoints: ["/api/health", "/api/analyze"],
    })
  })

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

