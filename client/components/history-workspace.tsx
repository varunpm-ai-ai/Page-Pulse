"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3 } from "lucide-react";

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
import { Separator } from "@/components/ui/separator";
import { type PageAudit, readAuditHistory } from "@/lib/audit-history";

function formatDate(value?: string) {
  if (!value) {
    return "Unknown"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Unknown"
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

function statusLabel(status: number) {
  if (status >= 200 && status < 300) {
    return "Success";
  }

  if (status >= 300 && status < 400) {
    return "Redirect";
  }

  return "Error";
}

export function HistoryWorkspace() {
  const [history, setHistory] = useState<PageAudit[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    const loadHistory = () => {
      setHistory(readAuditHistory());
    };

    loadHistory();

    window.addEventListener("page-pulse-audit-history-change", loadHistory);

    return () => {
      window.removeEventListener(
        "page-pulse-audit-history-change",
        loadHistory,
      );
    };
  }, []);

  const selectedEntry = useMemo<PageAudit | null>(() => {
    if (!history.length) {
      return null;
    }

    return history.find((entry) => entry.id === selectedId) ?? history[0];
  }, [history, selectedId]);

  return (
    <div className="flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Card className="border-border/60 bg-background/80 shadow-sm">
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">History</Badge>
            <Badge variant="secondary">{history.length} scans saved</Badge>
          </div>
          <CardTitle className="text-2xl">Your history</CardTitle>
          <CardDescription className="max-w-2xl">
            Select any scan to open the dashboard on the right. The layout stays
            inside the same shell so the page feels like one workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock3 className="size-4" />
            <span>Most recent scans are listed first.</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(320px,360px)_minmax(0,1fr)]">
        <Card className="border-border/60 bg-background/80 shadow-sm">
          <CardHeader className="gap-2">
            <CardTitle className="text-base">Recent scans</CardTitle>
            <CardDescription>Click a row to load its metrics.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[70dvh] space-y-3 overflow-y-auto pr-1">
              {history.length ? (
                history.map((entry) => {
                  const active = selectedEntry?.id === entry.id;

                  return (
                    <Button
                      key={entry.id}
                      type="button"
                      variant={active ? "secondary" : "outline"}
                      onClick={() => setSelectedId(entry.id)}
                      className="h-auto w-full items-start justify-between rounded-xl px-4 py-4 text-left"
                    >
                      <span className="flex min-w-0 flex-1 flex-col items-start gap-2">
                        <span className="truncate text-sm font-medium">
                          {entry.pageTitle}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {entry.url}
                        </span>
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDate(entry.createdAt)}</span>
                          <Separator orientation="vertical" className="h-3" />
                          <span>{statusLabel(entry.status)}</span>
                        </span>
                      </span>
                      <Badge
                        variant={
                          entry.status >= 400 ? "destructive" : "outline"
                        }
                      >
                        {entry.status}
                      </Badge>
                    </Button>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 px-4 py-8 text-sm text-muted-foreground">
                  No saved scans yet. Go to inspect URL and analyze a page
                  first.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <ResultDashboard
          entry={selectedEntry}
          emptyTitle="Select a scan"
          emptyDescription="Pick any item from the history list to open its dashboard."
        />
      </div>
    </div>
  );
}

export default HistoryWorkspace;
