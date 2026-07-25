"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

import { appendAuditEntry, type PageAudit } from "@/lib/audit-history";
import { ResultDashboard } from "@/components/result-dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { analysisClient } from "@/lib/analysis-client";
import type {
  BackendAnalysisReport,
  BackendAnalysisError,
  BackendAnalysisSuccess,
} from "@/lib/analysis-types";
import { useAnalysisProgress } from "@/lib/use-analysis-progress";

function normalizeInput(rawValue: string) {
  const value = rawValue.trim();
  if (!value) {
    return "";
  }

  return value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;
}

export function InspectWorkspace() {
  const [history, setHistory] = useState<PageAudit[]>([]);
  const [url, setUrl] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [latestResult, setLatestResult] = useState<PageAudit | null>(null);
  const progressState = useAnalysisProgress();
  useEffect(() => {
    const storedHistory = readAuditHistory();
    setHistory(storedHistory);
    setLatestResult(storedHistory[0] ?? null);
  }, []);

  const recentItems = Array.isArray(history) ? history.slice(0, 3) : [];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const nextUrl = normalizeInput(url);
    if (!nextUrl) {
      setError("Enter a website URL first.");
      return;
    }

    progressState.start();
    setPending(true);

    try {
      const response = await analysisClient.post<
        BackendAnalysisSuccess | BackendAnalysisError | BackendAnalysisReport
      >("/api/analyze", {
        url: nextUrl,
        socketId: progressState.socketId,
      });

      const payload = response.data;

      if (response.status < 200 || response.status >= 300) {
        if (isBackendError(payload)) {
          throw new Error(
            payload.error?.message ?? "Unable to analyze that URL.",
          );
        }

        throw new Error("Unable to analyze that URL.");
      }

      if (isBackendSuccess(payload)) {
        const mapped: PageAudit = {
          id: payload.analysisId,
          url: payload.report.requestedUrl,
          status: payload.report.status,
          responseTimeMs: payload.report.responseTimeMs,
          pageTitle: payload.report.pageTitle,
          metaDescription: payload.report.metaDescription,
          h1Count: payload.report.h1Count,
          imagesMissingAltText: payload.report.imagesMissingAltText,
          approximateWordCount: payload.report.approximateWordCount,
          createdAt: new Date().toISOString(),
        };

        const updated = appendAuditEntry(mapped);

        setHistory(updated);
        setLatestResult(mapped);
        setUrl(payload.report.requestedUrl);
      } else if (isBackendReport(payload)) {
        const requestedUrl =
          typeof payload.requestedUrl === "string" ? payload.requestedUrl : nextUrl;
        const mapped: PageAudit = {
          id: crypto.randomUUID(),
          url: requestedUrl,
          status: payload.status,
          responseTimeMs: payload.responseTimeMs,
          pageTitle: payload.pageTitle,
          metaDescription: payload.metaDescription,
          h1Count: payload.h1Count,
          imagesMissingAltText: payload.imagesMissingAltText,
          approximateWordCount: payload.approximateWordCount,
          createdAt: new Date().toISOString(),
        };

        const updated = appendAuditEntry(mapped);

        setHistory(updated);
        setLatestResult(mapped);
        setUrl(mapped.url);
      } else {
        throw new Error("Unexpected response from the server.");
      }

      progressState.finish();
    } catch (analysisError) {
      const message =
        analysisError instanceof Error
          ? analysisError.message
          : "Unable to analyze that URL.";

      setError(message);
      progressState.fail(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Card className="border-border/60 bg-background/80 shadow-sm">
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Inspect URL</Badge>
            <Badge variant="secondary">Saved to history</Badge>
          </div>
          <CardTitle className="text-2xl">Analyze any public webpage</CardTitle>
          <CardDescription className="max-w-2xl">
            Paste a URL, inspect the page, and keep the result in your history.
            The content below updates without leaving this shell.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 lg:flex-row"
          >
            <Input
              type="text"
              inputMode="url"
              placeholder="Enter website URL"
              aria-label="Website URL"
              autoComplete="off"
              spellCheck={false}
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className="h-12 flex-1 rounded-xl border-border/70 bg-background px-4 text-sm shadow-sm"
            />
            <Button
              type="submit"
              className="h-12 rounded-xl px-6"
              disabled={pending}
            >
              <Search data-icon="inline-start" />
              {pending ? "Analyzing..." : "Analyse"}
            </Button>
          </form>

          {progressState.visible ? (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>{progressState.message || "Analyzing..."}</span>
                <span>
                  {Math.min(100, Math.max(0, progressState.progress))}%
                </span>
              </div>
              <Progress value={progressState.progress} />
            </div>
          ) : null}

          {error ? (
            <p className="mt-3 text-sm text-destructive">{error}</p>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <ResultDashboard
          entry={latestResult}
          emptyTitle="Latest scan"
          emptyDescription="Your most recent result will appear here after the first analysis."
        />

        <Card className="border-border/60 bg-background/80 shadow-sm">
          <CardHeader className="gap-2">
            <CardTitle className="text-base">Your history</CardTitle>
            <CardDescription>
              The latest scans stay visible here for quick access.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentItems.length ? (
              recentItems.map((item, index) => (
                <Link
                  key={`${item.id}-${item.createdAt}-${index}`}
                  href="/history"
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-3 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.pageTitle}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.url}
                    </p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
                No history yet. Scan a page and it will appear here.
              </div>
            )}

            <Link
              href="/history"
              className="inline-flex w-full items-center justify-center rounded-xl border border-border/70 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Open full history
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default InspectWorkspace;

function isBackendSuccess(
  value: unknown,
): value is BackendAnalysisSuccess {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    (value as BackendAnalysisSuccess).success === true &&
    "report" in value
  );
}

function isBackendError(value: unknown): value is BackendAnalysisError {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    (value as BackendAnalysisError).success === false
  );
}

function isBackendReport(
  value: unknown,
): value is BackendAnalysisReport & Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as BackendAnalysisReport).status === "number" &&
    typeof (value as BackendAnalysisReport).responseTimeMs === "number" &&
    typeof (value as BackendAnalysisReport).pageTitle === "string" &&
    typeof (value as BackendAnalysisReport).metaDescription === "string" &&
    typeof (value as BackendAnalysisReport).h1Count === "number" &&
    typeof (value as BackendAnalysisReport).imagesMissingAltText === "number" &&
    typeof (value as BackendAnalysisReport).approximateWordCount === "number"
  )
}

function readAuditHistory(): PageAudit[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem("page-pulse:audit-history");
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is PageAudit => {
      return (
        typeof item === "object" &&
        item !== null &&
        typeof (item as PageAudit).id === "string" &&
        typeof (item as PageAudit).url === "string" &&
        typeof (item as PageAudit).createdAt === "string"
      );
    });
  } catch {
    return [];
  }
}
