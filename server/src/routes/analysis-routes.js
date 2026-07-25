import { Router } from "express"

import { asyncHandler } from "../middleware/async-handler.js"
import { handleAnalyzeRequest } from "../controllers/analysis-controller.js"

export const analysisRouter = Router()

analysisRouter.post("/analyze", asyncHandler(handleAnalyzeRequest))

