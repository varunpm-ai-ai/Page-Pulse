export type BackendAnalysisReport = {
  requestedUrl: string
  finalUrl: string
  status: number
  responseTimeMs: number
  pageTitle: string
  metaDescription: string
  h1Count: number
  imagesMissingAltText: number
  approximateWordCount: number
}

export type BackendAnalysisSuccess = {
  success: true
  analysisId: string
  report: BackendAnalysisReport
}

export type BackendAnalysisError = {
  success: false
  error?: {
    code?: string
    message?: string
  }
}

