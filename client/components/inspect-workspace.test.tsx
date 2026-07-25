import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { AnchorHTMLAttributes, ReactNode } from "react"
import type { PageAudit } from "@/lib/audit-history"

const mocks = vi.hoisted(() => ({
  appendAuditEntry: vi.fn(),
  historyState: { entries: [] as PageAudit[] },
  post: vi.fn(),
}))

vi.mock("@/lib/audit-history", () => ({
  appendAuditEntry: mocks.appendAuditEntry,
  useAuditHistory: () => mocks.historyState.entries,
}))

vi.mock("@/lib/analysis-client", () => ({
  analysisClient: {
    post: mocks.post,
  },
}))

vi.mock("@/lib/use-analysis-progress", async () => {
  const React = await import("react")

  return {
    useAnalysisProgress: () => {
      const [visible, setVisible] = React.useState(false)
      const [progress, setProgress] = React.useState(0)
      const [message, setMessage] = React.useState("")

      return {
        socketId: "socket-123",
        progress,
        message,
        stage: visible ? "running" : null,
        visible,
        start: () => {
          setVisible(true)
          setProgress(15)
          setMessage("Request received.")
        },
        finish: () => {
          setProgress(100)
          setMessage("Analysis complete.")
          window.setTimeout(() => {
            setVisible(false)
            setProgress(0)
            setMessage("")
          }, 450)
        },
        fail: () => {
          setVisible(false)
          setProgress(0)
          setMessage("")
        },
      }
    },
  }
})

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

import { InspectWorkspace } from "@/components/inspect-workspace"

describe("InspectWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.historyState.entries = []
    vi.useRealTimers()
  })

  it("shows progress while analyzing and renders the report after success", async () => {
    mocks.post.mockResolvedValue({
      data: {
        success: true,
        analysisId: "analysis-1",
        report: {
          requestedUrl: "https://example.com/",
          finalUrl: "https://example.com/",
          status: 200,
          responseTimeMs: 321,
          pageTitle: "Example Page",
          metaDescription: "Sample description",
          h1Count: 1,
          imagesMissingAltText: 2,
          approximateWordCount: 120,
        },
      },
    })

    const user = userEvent.setup()
    render(<InspectWorkspace />)

    await user.type(screen.getByLabelText(/website url/i), "example.com")
    await user.click(screen.getByRole("button", { name: /analyse/i }))

    await waitFor(() => {
      expect(mocks.post).toHaveBeenCalledTimes(1)
      expect(mocks.appendAuditEntry).toHaveBeenCalledTimes(1)
    })

    expect(mocks.appendAuditEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "analysis-1",
        url: "https://example.com/",
        pageTitle: "Example Page",
        status: 200,
      })
    )
    expect(mocks.post).toHaveBeenCalledWith("/api/analyze", {
      url: "https://example.com",
      socketId: "socket-123",
    })
  })

  it("shows a friendly error when the backend rejects the url", async () => {
    mocks.post.mockRejectedValue(new Error("Enter a valid public website URL."))

    const user = userEvent.setup()
    render(<InspectWorkspace />)

    await user.type(screen.getByLabelText(/website url/i), "bad-url")
    await user.click(screen.getByRole("button", { name: /analyse/i }))

    await waitFor(() => {
      expect(
        screen.getByText("Enter a valid public website URL.")
      ).toBeInTheDocument()
    })
  })
})
