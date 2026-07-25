import validator from "validator"
import { HttpError } from "../errors/http-error.js"

export function normalizeTargetUrl(rawUrl) {
  if (typeof rawUrl !== "string") {
    throw new HttpError(400, "A URL must be provided.", "INVALID_URL")
  }

  const trimmed = rawUrl.trim()
  if (!trimmed) {
    throw new HttpError(400, "A URL must be provided.", "INVALID_URL")
  }

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  if (!validator.isURL(candidate, {
    protocols: ["http", "https"],
    require_protocol: true,
    require_valid_protocol: true,
    require_host: true,
    require_tld: true,
    allow_underscores: false,
    allow_trailing_dot: false,
  })) {
    throw new HttpError(400, "Enter a valid public website URL.", "INVALID_URL")
  }

  return new URL(candidate)
}

