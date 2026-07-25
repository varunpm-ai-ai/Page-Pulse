export const BACKEND_URL = process.env.NEXT_PUBLIC_ANALYSIS_API_URL?.trim() || ""

export const HAS_BACKEND_URL = BACKEND_URL.length > 0
