import type { PageAudit } from "@/lib/audit-history"

const DEFAULT_TITLE = "Untitled page"

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
}

function stripTags(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function extractMatch(html: string, regex: RegExp) {
  const match = html.match(regex)
  return match?.[1]?.trim() ?? ""
}

export function analyzeHtml(
  url: string,
  html: string,
  status: number,
  responseTimeMs: number
): PageAudit {
  const title = decodeEntities(
    extractMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i)
  ) || DEFAULT_TITLE

  const metaDescription =
    decodeEntities(
      extractMatch(
        html,
        /<meta[^>]+(?:name|property)=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i
      )
    ) || "No meta description found."

  const h1Count = (html.match(/<h1\b[^>]*>/gi) ?? []).length

  const imageTags = html.match(/<img\b[^>]*>/gi) ?? []
  const imagesMissingAltText = imageTags.filter((tag) => {
    const altMatch = tag.match(/\balt=(["'])(.*?)\1/i)
    if (!altMatch) {
      return true
    }

    return altMatch[2].trim().length === 0
  }).length

  const plainText = stripTags(html)
  const approximateWordCount = plainText ? plainText.split(/\s+/).length : 0

  return {
    id: crypto.randomUUID(),
    url,
    status,
    responseTimeMs,
    pageTitle: title,
    metaDescription,
    h1Count,
    imagesMissingAltText,
    approximateWordCount,
    createdAt: new Date().toISOString(),
  }
}

