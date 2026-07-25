import axios from "axios"
import * as cheerio from "cheerio"
import { performance } from "node:perf_hooks"

import { env } from "../config/env.js"
import { ANALYSIS_PROGRESS_STAGES } from "../constants/analysis-events.js"
import { HttpError } from "../errors/http-error.js"
import { normalizeTargetUrl } from "../utils/url.js"

function decodeText(value) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
}

function cleanVisibleText(text) {
  return text.replace(/\s+/g, " ").trim()
}

function isHtmlResponse(contentType = "") {
  return /text\/html|application\/xhtml\+xml/i.test(contentType)
}

function getFinalUrl(response, fallbackUrl) {
  return (
    response?.request?.res?.responseUrl ||
    response?.request?._redirectable?._currentUrl ||
    fallbackUrl
  )
}

function extractMetaDescription($) {
  const metaDescription =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    ""

  return decodeText(cleanVisibleText(metaDescription)) || "No meta description found."
}

function countImagesMissingAltText($) {
  return $("img").toArray().filter((element) => {
    const alt = $(element).attr("alt")
    return typeof alt !== "string" || cleanVisibleText(alt).length === 0
  }).length
}

export async function analyzePage({
  url,
  socketId,
  emitProgress,
  requestTimeoutMs = env.requestTimeoutMs,
  fetchPage = axios.get,
} = {}) {
  const targetUrl = normalizeTargetUrl(url)
  emitProgress?.(socketId, {
    stage: ANALYSIS_PROGRESS_STAGES.validating,
    progress: 15,
    message: "URL validated.",
  })

  const startedAt = performance.now()
  emitProgress?.(socketId, {
    stage: ANALYSIS_PROGRESS_STAGES.fetching,
    progress: 35,
    message: "Fetching page.",
  })

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs)

  try {
    const response = await fetchPage(targetUrl.toString(), {
      responseType: "text",
      timeout: requestTimeoutMs,
      signal: controller.signal,
      maxRedirects: 5,
      validateStatus: () => true,
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      },
    })

    const contentType = String(response.headers?.["content-type"] || "")

    if (!isHtmlResponse(contentType)) {
      throw new HttpError(
        415,
        "The target URL did not return an HTML document.",
        "NON_HTML_RESPONSE",
        { contentType }
      )
    }

    emitProgress?.(socketId, {
      stage: ANALYSIS_PROGRESS_STAGES.parsing,
      progress: 75,
      message: "Parsing HTML.",
    })

    const $ = cheerio.load(response.data || "")
    const pageTitle = decodeText(cleanVisibleText($("title").first().text())) || "Untitled page"
    const metaDescription = extractMetaDescription($)
    const h1Count = $("h1").length
    const imagesMissingAltText = countImagesMissingAltText($)
    const bodyText = cleanVisibleText($("body").text())
    const approximateWordCount = bodyText ? bodyText.split(" ").length : 0

    const report = {
      requestedUrl: targetUrl.toString(),
      finalUrl: getFinalUrl(response, targetUrl.toString()),
      status: response.status,
      responseTimeMs: Math.max(1, Math.round(performance.now() - startedAt)),
      pageTitle,
      metaDescription,
      h1Count,
      imagesMissingAltText,
      approximateWordCount,
    }

    emitProgress?.(socketId, {
      stage: ANALYSIS_PROGRESS_STAGES.complete,
      progress: 100,
      message: "Analysis complete.",
      report,
    })

    return report
  } catch (error) {
    const isTimeout = error?.code === "ECONNABORTED" || error?.name === "AbortError"

    if (isTimeout) {
      throw new HttpError(504, "The request timed out while fetching the page.", "REQUEST_TIMEOUT")
    }

    if (error instanceof HttpError) {
      throw error
    }

    throw new HttpError(
      502,
      "The page could not be fetched.",
      "FETCH_FAILED",
      { cause: error?.message || "Unknown fetch error" }
    )
  } finally {
    clearTimeout(timeoutId)
  }
}
