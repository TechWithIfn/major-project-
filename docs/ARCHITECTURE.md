# ShikshaSahayak: Technical Architecture Design
## Offline Retrieval-Augmented AI Tutor for NCERT Curriculum

### 1. Executive Summary
ShikshaSahayak is designed to be a fully autonomous, offline educational assistant for Android devices. It leverages cutting-edge Edge AI techniques to provide a Retrieval-Augmented Generation (RAG) experience without requiring internet connectivity. The architecture prioritizes privacy, zero-latency interaction, and accessibility in resource-constrained environments.

---

### 2. High-Level Architecture
The system follows a **Three-Tier Edge Architecture**:

#### A. Presentation Layer (Mobile UI)
*   **Framework**: Native Android (Kotlin + Jetpack Compose) or Flutter.
*   **Features**:
    *   Conversational AI Interface (Chat-based).
    *   Interactive NCERT Book Viewer.
    *   Voice Assistant Mode (Hands-free).
    *   Curriculum Progress Dashboard.

#### B. AI Intelligence Layer (Local Inference)
*   **LLM Engine**: **MLC-LLM** or **Mediapipe LLM API**. Optimized for mobile NPU/GPU using Vulkan/Metal. Recommended models: Phi-3 Mini (3.8B), Gemma-2B, or Llama-3-8B (4-bit quantized).
*   **RAG Pipeline**:
    *   **Retriever**: Local Vector Search Engine (FAISS or SQLite-VSS).
    *   **Embedder**: Sentence-Transformers (e.g., all-MiniLM-L6-v2) running via **ONNX Runtime Mobile**.
*   **Speech Suite**:
    *   **STT**: OpenAI Whisper (Small/Base model) via TensorFlow Lite.
    *   **TTS**: Android Native Text-to-Speech or Meta's XTTS (Offline).

#### C. Data Layer (On-Device Storage)
*   **Vector Store**: Pre-indexed FAISS blobs or a local SQLite database with vector extensions.
*   **Content Store**: Compressed JSON/Markdown files of the NCERT curriculum.
*   **Model Store**: Secure storage for `.gguf` or `.bin` model weights.

---

### 3. Data Flow (Offline RAG Loop)
1.  **Input Capture**: User types a query or speaks (STT converts audio to text).
2.  **Semantic Querying**:
    *   The `Embedding Engine` converts the text query into a 384-dimensional vector.
    *   The `Vector Retriever` performs a similarity search against the local `NCERT Index`.
3.  **Prompt Augmentation**:
    *   Top-K relevant snippets (e.g., from "Class 10 Physics - Chapter 2") are retrieved.
    *   A prompt is constructed: `[System Instructions] + [Retrieved Context] + [User Query]`.
4.  **Local Inference**:
    *   The LLM processes the prompt on the device's GPU/NPU.
    *   A streaming response is generated to ensure low perceived latency.
5.  **Output & Feedback**:
    *   The text response is displayed and optionally spoken (TTS).
    *   The response includes citations (e.g., "See Science Bk, Pg 42").

---

### 4. Communication & Integration Model
Since the backend is Python-based (for AI development) and the frontend is Android (for performance), we use a **Local Bridge Pattern**:

*   **Option 1: ChaquoPy (Recommended for fast dev)**
    *   Runs the Python AI backend directly within the Android process.
    *   Communication via direct Java-to-Python method calls (JNI wrapper).
*   **Option 2: Localhost Flask/FastAPI Service**
    *   The Python backend runs as a background service on `localhost:5000`.
    *   The Android app communicates via RETROFIT (REST API).
*   **Option 3: Pure Native (Best for production)**
    *   Convert Python logic to C++ (Mediapipe/Llama.cpp) and call via JNI.

---

### 5. Modular Folder Structure
```text
shiksha-sahayak-offline-ai/
├── android-app/                # Native Android Project (Kotlin)
│   ├── app/src/main/kotlin/    # UI & Voice Logic
│   ├── app/src/main/assets/    # Bundled Models & NCERT Index
│   └── app/src/main/jni/       # C++ Bindings for LLM Inference
├── backend/                    # AI Research & Pipeline (Python)
│   ├── ingestion/              # PDF to Vector conversion scripts
│   ├── rag/                    # RAG Logic (Retriever, Prompting)
│   ├── speech/                 # STT/TTS local wrappers
│   └── app.py                  # Flask/FastAPI entry point (for Bridge)
├── data/                       # NCERT Dataset
│   ├── raw_pdfs/               # Source Material
│   └── processed_json/         # Cleaned text for RAG
├── models/                     # Model Weights (Git LFS)
│   ├── embeddings/             # all-MiniLM-L6-v2 (ONNX/TFLite)
│   └── llm/                    # Phi-3 / Llama-3 (GGUF/MLC)
├── vectorstore/                # Production FAISS/SQLite Index
└── docs/                       # Technical Documentation
```

---

### 6. Performance Optimization Strategies
*   **Model Quantization**: Use 4-bit (Q4_K_M) quantization to reduce RAM usage to < 2GB.
*   **KV Cache Management**: Limit context window (e.g., 2048 tokens) to maintain speed.
*   **Lazy Loading**: Initialize AI models only when the chat starts to save battery.
*   **Binned Search**: Use HNSW or IVF indexes in FAISS for O(log n) retrieval.

---

### 7. Future Scalability
*   **Edge-Cloud Hybrid**: Optional sync when internet is available for fetching new curriculum updates.
*   **Multi-Modal**: Support for image-based queries (e.g., student takes a picture of a diagram).
*   **Multi-Language**: Fine-tuned SLMs for Hindi and regional languages.
