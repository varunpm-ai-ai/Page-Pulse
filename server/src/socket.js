import { Server } from "socket.io"

import { ANALYSIS_SOCKET_EVENTS } from "./constants/analysis-events.js"
import { createSocketProgressEmitter } from "./utils/socket-progress.js"

export function createSocketServer(server, options = {}) {
  const io = new Server(server, {
    cors: options.cors || {
      origin: true,
      methods: ["GET", "POST"],
    },
  })

  io.on("connection", (socket) => {
    socket.on("analysis:subscribe", ({ analysisId } = {}) => {
      if (analysisId) {
        socket.join(analysisId)
      }
    })

    socket.on("disconnect", () => {
      // No-op for now; progress and results are emitted server-side.
    })
  })

  return {
    io,
    emitAnalysisProgress: createSocketProgressEmitter(io),
    emitAnalysisError(socketId, payload) {
      if (!socketId) {
        return
      }

      io.to(socketId).emit(ANALYSIS_SOCKET_EVENTS.error, payload)
    },
  }
}

