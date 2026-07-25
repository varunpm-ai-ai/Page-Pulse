export const ANALYSIS_PROGRESS_STAGES = {
  received: "received",
  validating: "validating",
  fetching: "fetching",
  parsing: "parsing",
  complete: "complete",
}

export const ANALYSIS_SOCKET_EVENTS = {
  progress: "analysis:progress",
  error: "analysis:error",
}
