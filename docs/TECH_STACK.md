# ShikshaSahayak Tech Stack - Deep Dive

### 1. Mobile Frontend (The Interaction Layer)
*   **Jetpack Compose (Android)**: For a modern, reactive UI.
*   **Markwon**: For rendering NCERT markdown content with formatting.
*   **Lottie**: For educational micro-animations.
*   **DataStore**: For local preference storage (class, subject, theme).

### 2. AI Backend on Edge (The Intelligence Layer)
*   **Inference Engine**:
    *   **MLC-LLM**: High-performance, universal LLM deployment on mobile GPUs. Supports Llama-3, Phi-3, and Mistral.
    *   **GGUF / Llama.cpp**: Solid alternative for CPU-heavy devices.
*   **Vector Search**:
    *   **FAISS (Mobile Core)**: C++ library for efficient similarity search.
    *   **Faiss-Android**: JNI wrapper for Kotlin integration.
*   **Embeddings**:
    *   **HuggingFace Tokenizers**: For pre-processing text.
    *   **ONNX Runtime Mobile**: To run transformer models like `all-MiniLM-L6-v2` on the device's NPU.

### 3. Speech Processing (The Accessibility Layer)
*   **Whisper TFLite**: Quantized version of OpenAI's Whisper for ultra-fast, offline speech-to-text.
*   **Mozilla TTS / Piper**: For high-quality, neural text-to-speech that sounds human (unlike default system TTS).

### 4. Data Pipeline (The Curriculum Layer)
*   **LangChain (Python-based Ingestion)**: Used during development to parse NCERT PDFs, chunk text, and generate the initial FAISS index.
*   **PyMuPDF**: For clean extraction of text and tables from NCERT textbooks.
*   **Zstandard**: For aggressive compression of the local curriculum database to keep the app size < 500MB (excluding LLM weights).

### 5. Development & DevOps
*   **ADB (Android Debug Bridge)**: For deploying and profiling on real edge devices.
*   **MLC-Chat CLI**: For testing quantized model performance before integration.
*   **Git LFS**: For managing large model weight files (`.gguf`, `.bin`).
