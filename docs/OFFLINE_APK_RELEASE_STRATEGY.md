# Software Release Strategy: Offline Android Deployment for Shiksha Sahayak

As a Software Release Engineer, I have designed this strategy for packaging the entire RAG pipeline and Python backend into a single, standalone Android APK.

---

## 1. Packaging Strategy: The "Single-Blob" APK
To bundle a Python runtime with large binary models, we use a hybrid approach.

### A. Python Runtime (Chaquopy)
Utilize **Chaquopy** to embed the Python 3.10 interpreter directly into the Android app. 
- **Dependencies**: All Python libraries (`fastapi`, `llama-cpp-python`, `vosk`, etc.) are bundled during the Gradle build process.
- **Workflow**: The Python backend runs as a background service within the app's process.

### B. Asset Bundling & Extraction
Large binary files cannot be read directly from the compressed APK assets folder.
- **Bundle**: Place `models/llm/*.gguf`, `vectorstore/faiss_index/`, and `models/speech/` in the Android `src/main/assets/` directory.
- **Extract**: On the first launch, the app extracts these binaries to `context.getFilesDir()`. This is only done once.
- **Pathing**: The Python backend is then pointed to the internal storage path for model loading.

---

## 2. Performance Optimization Recommendations
Running a 1B+ parameter LLM and a vector database on a phone is compute-intensive.

### A. Memory Management
- **Mmap Loading**: Ensure the GGUF loader uses `mmap=True` so the whole model file isn't loaded into the limited Android RAM at once.
- **Process Prioritization**: Run the Python worker with `Process.THREAD_PRIORITY_BACKGROUND` to keep the UI smooth.

### B. Hardware Acceleration
- **FP16/INT4**: Ensure all models are 4-bit quantized (already implemented in ours).
- **Vulkan/NPU**: If available, compile `llama-cpp-python` with Vulkan support for Android to offload work to the phone's GPU.

---

## 3. Testing Workflow
Before release, the system must undergo three phases of offline validation:

1. **Cold Boot Test**: Verify that the first-run extraction of 1GB+ models doesn't crash the app (use a Progress Notification).
2. **Offline Loop**: Simulate "Airplane Mode" and perform a full "Voice Query -> Search -> Result -> TTS" loop.
3. **Thermal/Battery Profile**: Monitor device temperature during 10 consecutive queries to ensure the model isn't causing hardware throttling.

---

## 4. Academic Evaluation Checklist
For your academic evaluation, ensure you provide the following documentation artifacts:

- [ ] **Data Lineage**: Proof that the vector database was built from official NCERT PDFs.
- [ ] **Groundedness Audit**: Comparison of AI responses vs. Textbook page content to demonstrate zero hallucinations.
- [ ] **Latency Report**: Average "Time-to-First-Token" on a mid-range Android device.
- [ ] **Privacy Analysis**: Verification that 0.0 bytes of data leave the device during a student's chat session.

---

## 🚀 Deployment Command (Conceptual)
To build the final release APK:
```bash
# In the android-app directory
./gradlew assembleRelease
```
*The resulting APK will be ~1.2 GB (bundled with TinyLlama and Vector Index).*
