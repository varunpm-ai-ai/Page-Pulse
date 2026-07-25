"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { PageAudit } from "@/lib/audit-history"

type ResultDashboardProps = {
  entry: PageAudit | null
  emptyTitle: string
  emptyDescription: string
}

function statusVariant(status: number) {
  if (status >= 200 && status < 300) {
    return "secondary" as const
  }

  if (status >= 300 && status < 400) {
    return "outline" as const
  }

  return "destructive" as const
}

function metricCard({
  label,
  value,
  description,
}: {
  label: string
  value: string
  description?: string
}) {
  return (
    <Card size="sm" className="border-border/60 bg-background/80 shadow-sm">
      <CardHeader className="space-y-1">
        <CardDescription className="text-xs uppercase tracking-[0.18em]">
          {label}
        </CardDescription>
        <CardTitle className="text-lg">{value}</CardTitle>
      </CardHeader>
      {description ? (
        <CardContent>
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </CardContent>
      ) : null}
    </Card>
  )
}

export function ResultDashboard({
  entry,
  emptyTitle,
  emptyDescription,
}: ResultDashboardProps) {
  if (!entry) {
    return (
      <Card className="border-border/60 bg-background/80 shadow-sm">
        <CardHeader>
          <CardTitle>{emptyTitle}</CardTitle>
          <CardDescription>{emptyDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 px-4 py-8 text-sm text-muted-foreground">
            Run a scan or pick a previous entry to see the details here.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-border/60 bg-background/80 shadow-sm">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusVariant(entry.status)}>
              HTTP {entry.status}
            </Badge>
            <Badge variant="outline">{entry.responseTimeMs} ms</Badge>
          </div>
          <CardTitle className="text-xl">{entry.pageTitle}</CardTitle>
          <CardDescription className="break-all text-sm">
            {entry.url}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {entry.metaDescription}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metricCard({
          label: "HTTP status",
          value: String(entry.status),
          description:
            entry.status >= 200 && entry.status < 300
              ? "The request completed successfully."
              : "Review the response code before relying on this page.",
        })}
        {metricCard({
          label: "Response time",
          value: `${entry.responseTimeMs ?? 0} ms`,
          description: "Measured from request start to full response read.",
        })}
        {metricCard({
          label: "Page title",
          value: entry.pageTitle || "Untitled Page",
        })}
        {metricCard({
          label: "Meta description",
          value: entry.metaDescription || "No meta description found.",
        })}
        {metricCard({
          label: "H1 count",
          value: String(entry.h1Count ?? 0),
          description:
            entry.h1Count === 1
              ? "Good heading structure for a single primary topic."
              : "Check heading hierarchy if the page is intentionally simple.",
        })}
        {metricCard({
          label: "Missing alt text",
          value: String(entry.imagesMissingAltText ?? 0),
          description:
            entry.imagesMissingAltText === 0
              ? "All detected images exposed alt text."
              : "Some images may need descriptive alt attributes.",
        })}
        {metricCard({
          label: "Approx. word count",
          value: (entry.approximateWordCount ?? 0).toLocaleString(),
          description: "Estimated from visible text after stripping markup.",
        })}
      </div>

      <Separator className="bg-border/60" />
    </div>
  )
}

export default ResultDashboard

