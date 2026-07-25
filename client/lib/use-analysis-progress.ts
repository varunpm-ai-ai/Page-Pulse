"use client"

import { useEffect, useMemo, useState } from "react"
import { io, type Socket } from "socket.io-client"

import { BACKEND_URL, HAS_BACKEND_URL } from "@/lib/backend"

type AnalysisProgressPayload = {
  analysisId?: string
  stage?: string
  progress?: number
  message?: string
  report?: unknown
}

type AnalysisErrorPayload = {
  analysisId?: string
  stage?: string
  message?: string
  code?: string
}

let socketInstance: Socket | null = null

function getSocket() {
  if (typeof window === "undefined") {
    return null
  }

  if (!HAS_BACKEND_URL) {
    return null
  }

  if (!socketInstance) {
    socketInstance = io(BACKEND_URL, {
      autoConnect: false,
      transports: ["websocket", "polling"],
    })
  }

  return socketInstance
}

export function useAnalysisProgress() {
  const socket = useMemo(() => getSocket(), [])
  const [socketId, setSocketId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState("")
  const [stage, setStage] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!socket) {
      return
    }

    if (!socket.connected) {
      socket.connect()
    }

    const handleConnect = () => setSocketId(socket.id ?? null)
    const handleProgress = (payload: AnalysisProgressPayload) => {
      if (typeof payload.progress === "number") {
        setProgress(payload.progress)
      }
      if (payload.stage) {
        setStage(payload.stage)
      }
      if (payload.message) {
        setMessage(payload.message)
      }
    }
    const handleError = (payload: AnalysisErrorPayload) => {
      if (payload.message) {
        setMessage(payload.message)
      }
      if (payload.stage) {
        setStage(payload.stage)
      }
      setVisible(false)
    }

    handleConnect()
    socket.on("connect", handleConnect)
    socket.on("analysis:progress", handleProgress)
    socket.on("analysis:error", handleError)

    return () => {
      socket.off("connect", handleConnect)
      socket.off("analysis:progress", handleProgress)
      socket.off("analysis:error", handleError)
    }
  }, [socket])

  const start = () => {
    setVisible(true)
    setProgress(10)
    setStage("received")
    setMessage("Request received.")
  }

  const finish = (nextMessage = "Analysis complete.") => {
    setProgress(100)
    setMessage(nextMessage)
    window.setTimeout(() => {
      setVisible(false)
      setProgress(0)
      setStage(null)
      setMessage("")
    }, 450)
  }

  const fail = (nextMessage: string) => {
    setProgress(0)
    setStage("error")
    setMessage(nextMessage)
    window.setTimeout(() => {
      setVisible(false)
      setStage(null)
      setMessage("")
    }, 1000)
  }

  return {
    socketId,
    progress,
    message,
    stage,
    visible,
    start,
    finish,
    fail,
  }
}
