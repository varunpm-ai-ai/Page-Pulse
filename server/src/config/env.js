const toNumber = (value, fallback) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const env = {
  get host() {
    return process.env.HOST || "0.0.0.0"
  },
  get port() {
    return toNumber(process.env.PORT, 4000)
  },
  get clientOrigin() {
    return process.env.CLIENT_ORIGIN || "*"
  },
  get requestTimeoutMs() {
    return toNumber(process.env.REQUEST_TIMEOUT_MS, 15000)
  },
  get maxRequestsPerMinute() {
    return toNumber(process.env.RATE_LIMIT_MAX, 20)
  },
}
