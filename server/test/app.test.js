import { describe, expect, it } from "vitest"
import request from "supertest"

import { createApp } from "../src/app.js"

describe("app", () => {
  it("returns health ok", async () => {
    const app = createApp()

    const response = await request(app).get("/api/health")

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      success: true,
      service: "page-pulse-analysis-api",
      status: "ok",
    })
  })

  it("returns not found for unknown routes", async () => {
    const app = createApp()

    const response = await request(app).get("/api/unknown")

    expect(response.status).toBe(404)
    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: "NOT_FOUND",
      },
    })
  })
})

