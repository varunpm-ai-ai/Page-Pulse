import * as React from "react"

export type PageAudit = {
  id: string
  url: string
  status: number
  responseTimeMs: number
  pageTitle: string
  metaDescription: string
  h1Count: number
  imagesMissingAltText: number
  approximateWordCount: number
  createdAt: string
}


const STORAGE_KEY = "page-pulse-audit-history"
const HISTORY_CHANGE_EVENT = "page-pulse-audit-history-change"
const MAX_ENTRIES = 50
const EMPTY_HISTORY: PageAudit[] = []
let cachedHistory: PageAudit[] = EMPTY_HISTORY

function canUseStorage() {
  return typeof window !== "undefined"
}

export function readAuditHistory(): PageAudit[] {
    if (!canUseStorage()) {
        return cachedHistory
    }

    try {
        const raw = localStorage.getItem(STORAGE_KEY)

        if (!raw) {
            cachedHistory = EMPTY_HISTORY
            return cachedHistory
        }

        cachedHistory = JSON.parse(raw)

        return cachedHistory
    }
    catch {
        return cachedHistory
    }
}

export function writeAuditHistory(entries: PageAudit[]) {

    cachedHistory = entries.slice(0, MAX_ENTRIES)

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(cachedHistory)
    )

    window.dispatchEvent(
        new Event(HISTORY_CHANGE_EVENT)
    )
}

export function appendAuditEntry(entry: PageAudit) {
  const current = readAuditHistory()
  const next = [entry, ...current.filter((item) => item.id !== entry.id)].slice(0, MAX_ENTRIES)
  writeAuditHistory(next)
  return next
}

export function clearAuditHistory() {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event(HISTORY_CHANGE_EVENT))
}

function subscribe(callback: () => void) {
  if (!canUseStorage()) {
    return () => {}
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      callback()
    }
  }

  window.addEventListener("storage", onStorage)
  window.addEventListener(HISTORY_CHANGE_EVENT, callback)

  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener(HISTORY_CHANGE_EVENT, callback)
  }
}

export function useAuditHistory() {
  return React.useSyncExternalStore(subscribe, readAuditHistory, () => EMPTY_HISTORY)
}
