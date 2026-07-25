import { describe, expect, it, vi } from "vitest"

import { HttpError } from "../src/errors/http-error.js"
import { analyzePage } from "../src/services/page-analysis-service.js"

describe("analyzePage", () => {
  it("parses a successful html response", async () => {
    const report = await analyzePage({
      url: "https://example.com",
      emitProgress: () => {},
      fetchPage: vi.fn(async () => ({
        status: 200,
        headers: {
          "content-type": "text/html; charset=utf-8",
        },
        data: `
          <html>
            <head>
              <title>Example Page</title>
              <meta name="description" content="Sample description">
            </head>
            <body>
              <h1>Heading</h1>
              <img src="/a.jpg" alt="Photo">
              <img src="/b.jpg">
              <p>Hello world from Page Pulse.</p>
            </body>
          </html>
        `,
        request: {
          res: { responseUrl: "https://example.com/final" },
        },
      })),
    })

    expect(report).toMatchObject({
      requestedUrl: "https://example.com/",
      finalUrl: "https://example.com/final",
      status: 200,
      pageTitle: "Example Page",
      metaDescription: "Sample description",
      h1Count: 1,
      imagesMissingAltText: 1,
      approximateWordCount: 6,
    })
    expect(report.responseTimeMs).toBeGreaterThan(0)
  })

  it("throws a validation error for a bad url", async () => {
    await expect(analyzePage({ url: "not-a-url" })).rejects.toBeInstanceOf(HttpError)
  })

  it("rejects non-html responses", async () => {
    await expect(
      analyzePage({
        url: "https://example.com",
        fetchPage: vi.fn(async () => ({
          status: 200,
          headers: {
            "content-type": "application/json",
          },
          data: "{}",
        })),
      })
    ).rejects.toMatchObject({
      statusCode: 415,
      code: "NON_HTML_RESPONSE",
    })
  })

  it("maps request timeouts to gateway timeout", async () => {
    await expect(
      analyzePage({
        url: "https://example.com",
        fetchPage: vi.fn(async () => {
          const error = new Error("timeout")
          error.code = "ECONNABORTED"
          throw error
        }),
      })
    ).rejects.toMatchObject({
      statusCode: 504,
      code: "REQUEST_TIMEOUT",
    })
  })
})
