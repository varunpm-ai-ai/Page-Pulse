# 🌐 Page Pulse

> **Real-time Website Performance & SEO Inspector**

Page Pulse is a modern web application that analyzes web pages on demand. It fetches any public URL, inspects its core SEO and metadata attributes, measures HTTP response metrics, and streams real-time status updates via WebSockets.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://page-pulse-puce-gamma.vercel.app/)
[![Backend API](https://img.shields.io/badge/Backend_API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://page-pulse-2x86.onrender.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js_16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Backend-Node.js_%26_Express-green?style=for-the-badge&logo=express)](https://expressjs.com/)

---

## 🚀 Live Links

- **Frontend (Vercel)**: [https://page-pulse-puce-gamma.vercel.app/](https://page-pulse-puce-gamma.vercel.app/)
- **Backend API (Render)**: [https://page-pulse-2x86.onrender.com](https://page-pulse-2x86.onrender.com)

---

## ✨ Features

- ⚡ **HTTP Response Metrics**: Measures exact response time (ms) and captures HTTP status codes.
- 🔍 **SEO & Metadata Extraction**: Automatically extracts Page Title, Meta Description, and H1 heading counts.
- 🖼️ **Accessibility Check**: Scans for images missing `alt` attribute text.
- 📊 **Content Statistics**: Computes approximate page word count.
- 📡 **Real-time WebSocket Updates**: Streams progress steps live to the client using **Socket.IO**.
- 📜 **Analysis History**: Stores and displays past inspection reports.
- 🔒 **Secure & Rate-Limited**: Backend protected with `helmet`, input validation, and `express-rate-limit`.

---

## 🛠️ Tech Stack

### Frontend (`/client`)
- **Framework**: Next.js 16 (App Router, React 19, TypeScript)
- **Styling**: Tailwind CSS & Shadcn UI
- **Real-Time Client**: `socket.io-client`
- **Testing**: Vitest & Testing Library
- **Deployment**: Vercel

### Backend (`/server`)
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Real-Time Engine**: Socket.IO
- **Scraper / Parser**: Cheerio & Axios
- **Security & Utilities**: Helmet, CORS, Express Rate Limit, Validator
- **Deployment**: Render (Docker containerized)

---

## 📁 Repository Structure

```
Page-Pulse/
├── client/                 # Next.js Frontend Application
│   ├── app/                # Next.js App Router (Pages & API Routes)
│   ├── components/         # UI Components & Dashboard Layouts
│   ├── hooks/              # Custom React Hooks
│   ├── lib/                # API helpers & analysis types
│   └── package.json
│
├── server/                 # Express + Socket.IO Backend Server
│   ├── src/
│   │   ├── config/         # Environment variables & setup
│   │   ├── controllers/    # Request controllers
│   │   ├── middleware/     # Rate limit & Error handlers
│   │   ├── routes/         # Express API Routes
│   │   ├── services/       # Web scraper & Page Analyzer
│   │   └── socket.js       # Socket.IO event handler
│   ├── Dockerfile          # Docker configuration for Render
│   └── package.json
└── README.md
```

---

## 📡 API Reference

### `POST /api/analyze`

Accepts a URL and performs a complete page analysis.

#### Request Body
```json
{
  "url": "https://example.com",
  "socketId": "optional-socket-id-for-live-progress"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "analysisId": "e3b0c442-98fc-4c14-961b-90f769069d67",
  "report": {
    "requestedUrl": "https://example.com/",
    "finalUrl": "https://example.com/",
    "status": 200,
    "responseTimeMs": 142,
    "pageTitle": "Example Domain",
    "metaDescription": "",
    "h1Count": 1,
    "imagesMissingAltText": 0,
    "approximateWordCount": 120
  }
}
```

#### Error Response (`400 / 502`)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_URL",
    "message": "Please enter a valid public website URL."
  }
}
```

### `GET /api/health`

Returns service health status.

---

## 💻 Getting Started Locally

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher

### 1. Clone the Repository
```bash
git clone https://github.com/varunpm-ai-ai/Page-Pulse.git
cd Page-Pulse
```

### 2. Set Up & Run the Backend
```bash
cd server
npm install
npm run dev
```
The backend server will start on `http://localhost:5000`.

### 3. Set Up & Run the Frontend
In a new terminal window:
```bash
cd client
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Variables

### Client (`/client/.env.local`)
```env
NEXT_PUBLIC_ANALYSIS_API_URL=http://localhost:5000
```

### Server (`/server/.env`)
```env
PORT=5000
HOST=127.0.0.1
CLIENT_ORIGIN=http://localhost:3000
```

---

## 🐳 Running with Docker

You can build and run the backend using Docker:

```bash
cd server
docker build -t page-pulse-server .
docker run -p 5000:4000 --env-file .env page-pulse-server
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
