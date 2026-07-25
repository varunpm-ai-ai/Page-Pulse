# Page Pulse Analysis API

Express + Socket.IO backend for Page Pulse.

## Endpoints

- `GET /api/health`
- `POST /api/analyze`

## Request

`POST /api/analyze`

```json
{
  "url": "https://example.com",
  "socketId": "optional-socket-id"
}
```

## Success Response

```json
{
  "success": true,
  "analysisId": "uuid",
  "report": {
    "requestedUrl": "https://example.com/",
    "finalUrl": "https://example.com/",
    "status": 200,
    "responseTimeMs": 123,
    "pageTitle": "Example",
    "metaDescription": "Description",
    "h1Count": 1,
    "imagesMissingAltText": 0,
    "approximateWordCount": 120
  }
}
```

## Error Response

```json
{
  "success": false,
  "error": {
    "code": "INVALID_URL",
    "message": "Enter a valid public website URL."
  }
}
```

## Socket Events

- `analysis:progress`
- `analysis:error`

If the frontend sends a `socketId` with the analysis request, the backend emits staged progress updates to that socket.

## Run

```bash
npm install
npm run dev
```

## Test

```bash
npm test
```

## Docker

```bash
docker build -t page-pulse-server .
docker run --env-file .env -p 4000:4000 page-pulse-server
```

