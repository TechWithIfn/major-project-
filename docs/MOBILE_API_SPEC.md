# Mobile API Specification: Shiksha Sahayak

This document outlines the API endpoints and communication workflow for connecting the Android application to the local Python backend.

---

## 1. Connection Workflow
The Android app communicates with the backend via **HTTP/REST**. Since the system is designed for **offline/on-device** execution:
- The backend runs on `localhost:5000` (or `0.0.0.0:5000` for LAN).
- Android uses **Retrofit** or **OkHttp** to make network requests.
- **On-Device execution**: If running on-device (via Termux or similar), the URL is `http://127.0.0.1:5000`.

---

## 2. API Endpoints

### 🩺 Health Check
Check if the AI Brain is initialized and ready.
- **URL**: `GET /health`
- **Response**:
```json
{
  "status": "online",
  "model": "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
  "device": "cpu",
  "timestamp": "2026-02-22T23:30:00.000000"
}
```

### 🎓 Ask Question (Primary RAG)
The main endpoint for student queries.
- **URL**: `POST /ask`
- **Request Body**:
```json
{
  "question": "What is Photosynthesis?",
  "voice": false,
  "stream": false
}
```
- **Response Body**:
```json
{
  "answer": "According to Science-Class7 (Page 12), Photosynthesis is the process by which green plants make their own food...",
  "sources": [
    {"source": "Science-Class7.pdf", "page": 12},
    {"source": "Biology-Class11.pdf", "page": 45}
  ],
  "latency_ms": 1240.5,
  "timestamp": "2026-02-22T23:30:05.123456",
  "model": "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
}
```

### 🎙️ Listen (Speech-to-Text)
Converts microphone input to text.
- **URL**: `GET /voice/listen`
- **Response**:
```json
{
  "text": "How do plants breathe?",
  "timestamp": "2026-02-22T23:31:00.000000"
}
```

---

## 3. Error Handling Strategy
The API uses standard HTTP status codes:
- **400 Bad Request**: Missing or empty question.
- **500 Internal Server Error**: Inference engine failure.
- **503 Service Unavailable**: AI Brain is still loading (indexing or model loading in progress).

**Android Tip**: Always implement a "Retry" or "Loading" indicator in the UI to handle the `503` status during initial startup.

---

## 4. Android Integration Example (Kotlin + Retrofit)

```kotlin
interface ShikshaApi {
    @POST("/ask")
    suspend fun askQuestion(@Body request: QueryRequest): Response<QueryResponse>
}

data class QueryRequest(val question: String, val voice: Boolean = false)

data class QueryResponse(
    val answer: String,
    val sources: List<Source>,
    val latency_ms: Double
)
```
