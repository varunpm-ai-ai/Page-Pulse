import { randomUUID } from "node:crypto"

import { ANALYSIS_PROGRESS_STAGES } from "../constants/analysis-events.js"
import { analyzePage } from "../services/page-analysis-service.js"

export async function handleAnalyzeRequest(request, response, next) {
  const analysisId = randomUUID()
  const socketId = request.body?.socketId || request.get("x-socket-id") || null

  try {
    request.app.locals.emitAnalysisProgress?.(socketId, {
      analysisId,
      stage: ANALYSIS_PROGRESS_STAGES.received,
      progress: 5,
      message: "Request received.",
    })

    const report = await analyzePage({
      url: request.body?.url,
      socketId,
      emitProgress: request.app.locals.emitAnalysisProgress,
    })

    return response.status(200).json({
      success: true,
      analysisId,
      report,
    })
  } catch (error) {
    request.app.locals.emitAnalysisError?.(socketId, {
      analysisId,
      stage: "error",
      message: error.message,
      code: error.code,
    })
    return next(error)
  }
}

