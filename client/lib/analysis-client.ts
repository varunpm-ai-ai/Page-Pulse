import axios from "axios"

import { BACKEND_URL } from "@/lib/backend"

export const analysisClient = axios.create({
  baseURL: BACKEND_URL || undefined,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
  validateStatus: () => true,
})
