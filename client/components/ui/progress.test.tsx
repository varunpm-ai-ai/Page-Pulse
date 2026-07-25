import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"

import { Progress } from "@/components/ui/progress"

describe("Progress", () => {
  it("renders the progress track and indicator", () => {
    const { container } = render(<Progress value={42} />)

    expect(container.querySelector('[data-slot="progress"]')).toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="progress-indicator"]')
    ).toBeInTheDocument()
  })
})
