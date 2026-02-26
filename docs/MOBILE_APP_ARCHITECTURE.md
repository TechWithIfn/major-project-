# Mobile Application Architecture: Shiksha Sahayak

As a Senior Mobile Developer, I recommend building the Shiksha Sahayak interface using **Android Native (Kotlin) with Jetpack Compose**. For an on-device AI tutor, native performance is critical to ensure fluid animations and low-latency interaction.

---

## 1. High-Level Architecture
We use the **MVVM (Model-View-ViewModel)** pattern to ensure a clean separation between the UI and the AI logic.

- **UI**: Jetpack Compose (Declarative, reactive UI)
- **Local Storage**: ROOM Database (Offline chat history & bookmarks)
- **Networking**: Retrofit + OKHttp (Local communication with Python API)
- **Concurrency**: Kotlin Coroutines (Asynchronous AI requests)

---

## 2. Screen Layout Plan (UI/UX)
- **Chat Screen**: Scrollable list of message bubbles. AI responses are formatted with Markdown (for NCERT citations).
- **History Screen**: A list of past chat sessions indexed by timestamp and first query.
- **Bookmarks Screen**: A categorized list of "starred" answers for quick revision.
- **Settings**: Toggle between different SLM models and voice options.

---

## 3. Implementation: Offline Storage (Room)
We define two primary entities: `ChatMessage` and `BookmarkedAnswer`.

```kotlin
// Database Entity for History
@Entity(tableName = "chat_history")
data class ChatMessage(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val text: String,
    val isFromUser: Boolean,
    val timestamp: Long = System.currentTimeMillis()
)

// DAO for Offline Access
@Dao
interface ChatDao {
    @Query("SELECT * FROM chat_history ORDER BY timestamp ASC")
    fun getAllMessages(): Flow<List<ChatMessage>>

    @Insert
    suspend fun insertMessage(message: ChatMessage)
}
```

---

## 4. Implementation: Local API Integration
Since the backend runs on the same device (e.g., via Termux or a JNI worker), we connect to `127.0.0.1`.

```kotlin
interface ShikshaApiService {
    @POST("ask")
    suspend fun askTutor(@Body request: QueryRequest): QueryResponse
}

// Retrofit Setup
val retrofit = Retrofit.Builder()
    .baseUrl("http://127.0.0.1:5000/")
    .addConverterFactory(GsonConverterFactory.create())
    .build()
```

---

## 5. Mobile Workflow (Offline Lifecycle)
1. **Startup**: Mobile app checks connectivity to the local AI service.
2. **Input**: User types or uses the Mic. Mic audio is sent to `/voice/listen`.
3. **Inference**: Text is sent to `/ask`. The `RAGPipeline` retrieves textbook context.
4. **Persistence**: Every AI response is automatically saved to the `chat_history` table for offline viewing.
5. **Formatting**: AI responses containing `[Source: X, Page: Y]` are parsed and displayed as interactive links leading to the PDF viewer.
