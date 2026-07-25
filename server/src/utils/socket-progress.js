import { ANALYSIS_SOCKET_EVENTS } from "../constants/analysis-events.js"

export function createSocketProgressEmitter(io) {
  return function emitProgress(socketId, payload) {
    if (!socketId) {
      return
    }

    io.to(socketId).emit(ANALYSIS_SOCKET_EVENTS.progress, payload)
  }
}

