# ShikshaSahayak: DevOps Environment Setup Plan

## 1. Overview
This plan establishes a high-performance, offline-ready development environment for the ShikshaSahayak project. It covers the Python AI stack, Android mobile layer, and local model infrastructure.

---

## 2. Core Software Requirements

| Tool | Recommended Version | Purpose |
| :--- | :--- | :--- |
| **Python** | 3.10.x - 3.11.x | AI Backend & RAG Pipeline |
| **Node.js** | 18.x or 20.x (LTS) | Next.js Frontend Development |
| **JDK** | 17 (Azul Zulu or Oracle) | Android Build System |
| **Android Studio** | Hedgehog (2023.1.1) or later | Mobile UI & Kotlin Logic |
| **Git** | 2.40+ | Version Control & LFS Management |
| **C++ Build Tools** | MSVC 2022 / GCC | Compiling FAISS/GPT4All bindings |

---

## 3. Python Environment Setup
We use `venv` for isolation and `pip` for dependency management.

### **Initialization Steps:**
1.  **Create Virtual Environment**:
    ```powershell
    python -m venv .venv
    ```
2.  **Activate Environment**:
    - Windows: `.venv\Scripts\activate`
    - Unix/macOS: `source .venv/bin/activate`
3.  **Install Base Requirements**:
    ```powershell
    pip install --upgrade pip
    pip install -r backend/requirements.txt
    ```

---

## 4. Android Development Setup
The Android app is designed for modern hardware and uses the following configuration:

1.  **Environment Variables**:
    - Set `JAVA_HOME` to your JDK 17 path.
    - Set `ANDROID_HOME` to your SDK location.
2.  **SDK Components**:
    - Android SDK 34 (UpsideDownCake)
    - Android SDK Build-Tools 34.0.0
    - Android Emulator (with GPU acceleration enabled for local LLM testing)
3.  **Local Networking**:
    - Use `10.0.2.2` to access the local Python FastAPI server from the Android Emulator.

---

## 5. Offline Model & Data Preparation
Since the system is offline-first, assets must be pre-indexed.

### **A. Embedding Models**
- We use `sentence-transformers/all-MiniLM-L6-v2`.
- **First-run cache**: Run `python backend/create_faiss_index.py` while online once to download the weights. They will be cached in `models/embeddings/`.

### **B. Large Language Model (LLM)**
- **Model**: TinyLlama-1.1B-Chat-v1.0-GGUF (Q4_K_M quantization).
- **Target Dir**: `models/llm/`
- **Verification**: Ensure the file name matches the one in `backend/main.py`.

---

## 6. Dependency Management Workflow
To maintain reproducibility across the team:

- **New Backend Dependency**: 
  1. Add to `backend/requirements.txt`
  2. Run `pip install -r backend/requirements.txt`
  3. Commit `requirements.txt`.
- **New Frontend Dependency**:
  1. Use `pnpm add <package>`
  2. Commit `pnpm-lock.yaml`.
- **New Mobile Dependency**:
  1. Add to `android-app/app/build.gradle`
  2. Sync Gradle in Android Studio.

---

## 7. IDE Recommendations
- **VS Code**: Recommended for `backend/` and `app/` (Next.js).
  - *Extensions*: Python (Pylance), Tailwind CSS IntelliSense, Prettier.
- **Android Studio**: Mandatory for `android-app/`.
  - *Plugins*: Kotlin, Android SDK, Layout Inspector.

---

## 8. Offline Testing Strategy
1.  **Localhost Bridge**: Verify that `backend/main.py` responds on `http://localhost:5000/health`.
2.  **Mock Environment**: Use the built-in `generateMockResponse` in `llm-handler.ts` when the LLM weights or Python backend are unavailable.
3.  **Snapshot Testing**: Use the pre-built indices in `vectorstore/` for consistent RAG results without re-ingesting text.
