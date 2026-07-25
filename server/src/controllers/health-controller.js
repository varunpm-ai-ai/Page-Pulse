export function handleHealthCheck(request, response) {
  response.status(200).json({
    success: true,
    service: "page-pulse-analysis-api",
    status: "ok",
  })
}

