import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"

import { ResultDashboard } from "@/components/result-dashboard"

describe("ResultDashboard", () => {
  it("renders an empty state when no result is selected", () => {
    render(
      <ResultDashboard
        entry={null}
        emptyTitle="Latest scan"
        emptyDescription="Pick a scan"
      />
    )

    expect(screen.getByText("Latest scan")).toBeInTheDocument()
    expect(screen.getByText("Pick a scan")).toBeInTheDocument()
  })

  it("renders analysis details", () => {
    render(
      <ResultDashboard
        entry={{
          id: "1",
          url: "https://example.com/",
          status: 200,
          responseTimeMs: 250,
          pageTitle: "Example Page",
          metaDescription: "Example meta description",
          h1Count: 1,
          imagesMissingAltText: 0,
          approximateWordCount: 220,
          createdAt: new Date().toISOString(),
        }}
        emptyTitle="Latest scan"
        emptyDescription="Pick a scan"
      />
    )

    expect(
      screen.getAllByText("Example Page", { selector: '[data-slot="card-title"]' })[0]
    ).toBeInTheDocument()
    expect(screen.getByText(/http 200/i)).toBeInTheDocument()
    expect(
      screen.getByText("250 ms", { selector: '[data-slot="badge"]' })
    ).toBeInTheDocument()
    expect(screen.getAllByText("Example meta description")[0]).toBeInTheDocument()
    expect(screen.getAllByText("1")[0]).toBeInTheDocument()
  })
})
