import { NextResponse } from "next/server"

import type {
  BackendAnalysisError,
  BackendAnalysisSuccess,
} from "@/lib/analysis-types"
import { analyzeHtml } from "@/lib/page-analysis"

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

function normalizeUrl(rawUrl: string) {
  const trimmed = rawUrl.trim()
  if (!trimmed) {
    throw new Error("Please enter a website URL.")
  }

  return new URL(trimmed.startsWith("http://") || trimmed.startsWith("https://") ? trimmed : `https://${trimmed}`)
}

function toSuccessResponse(
  requestedUrl: string,
  finalUrl: string,
  analysis: ReturnType<typeof analyzeHtml>,
): BackendAnalysisSuccess {
  return {
    success: true,
    analysisId: crypto.randomUUID(),
    report: {
      requestedUrl,
      finalUrl,
      status: analysis.status,
      responseTimeMs: analysis.responseTimeMs,
      pageTitle: analysis.pageTitle,
      metaDescription: analysis.metaDescription,
      h1Count: analysis.h1Count,
      imagesMissingAltText: analysis.imagesMissingAltText,
      approximateWordCount: analysis.approximateWordCount,
    },
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: string }
    const targetUrl = normalizeUrl(body.url ?? "")
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    const startedAt = Date.now()

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "user-agent": USER_AGENT,
        accept: "text/html,application/xhtml+xml",
        "accept-language": "en-US,en;q=0.9",
      },
    })

    clearTimeout(timeout)
    const html = await response.text()
    const result = analyzeHtml(
      targetUrl.toString(),
      html,
      response.status,
      Date.now() - startedAt
    )

    return NextResponse.json(
      toSuccessResponse(targetUrl.toString(), response.url || targetUrl.toString(), result)
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to analyze that URL."
    const status = message === "Please enter a website URL." ? 400 : 502

    const payload: BackendAnalysisError = {
      success: false,
      error: {
        message,
      },
    }

    return NextResponse.json(payload, { status })
  }
}
