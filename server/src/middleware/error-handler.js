import { HttpError } from "../errors/http-error.js"

export function notFoundHandler(request, response) {
  response.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${request.method} ${request.originalUrl} not found.`,
    },
  })
}

export function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    return next(error)
  }

  if (error instanceof HttpError) {
    return response.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    })
  }

  const statusCode = error?.statusCode && Number.isInteger(error.statusCode) ? error.statusCode : 500
  const message = statusCode === 500 ? "Unexpected server error." : error?.message || "Request failed."

  return response.status(statusCode).json({
    success: false,
    error: {
      code: error?.code || "INTERNAL_SERVER_ERROR",
      message,
    },
  })
}

