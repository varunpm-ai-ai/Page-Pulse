import { Router } from "express"

import { handleHealthCheck } from "../controllers/health-controller.js"

export const healthRouter = Router()

healthRouter.get("/health", handleHealthCheck)

