import { beforeEach, describe, expect, it, vi } from "vitest"
import request from "supertest"

vi.mock("../src/services/page-analysis-service.js", () => ({
  analyzePage: vi.fn(),
}))

import { createApp } from "../src/app.js"
import { analyzePage } from "../src/services/page-analysis-service.js"

describe("analysis route", () => {
  beforeEach(() => {
    vi.mocked(analyzePage).mockReset()
  })

  it("returns a report payload", async () => {
    vi.mocked(analyzePage).mockResolvedValue({
      requestedUrl: "https://example.com/",
      finalUrl: "https://example.com/",
      status: 200,
      responseTimeMs: 123,
      pageTitle: "Example",
      metaDescription: "Description",
      h1Count: 1,
      imagesMissingAltText: 0,
      approximateWordCount: 120,
    })

    const app = createApp()
    const response = await request(app)
      .post("/api/analyze")
      .send({ url: "example.com" })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.report).toMatchObject({
      status: 200,
      pageTitle: "Example",
    })
  })
})

