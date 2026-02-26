# Shiksha Sahayak - Getting Started

This project is now configured with an offline RAG pipeline and a mobile-ready backend.

## 🚀 How to Run

### 1. Start the Backend
```bash
python backend/app.py
```
This will start the AI brain on `http://localhost:5000`.

### 2. Add Content
- Place your NCERT PDF textbooks in `data/ncert_pdfs/`.
- Run the ingestion script:
```bash
python backend/ingest_pdfs.py
```
- Re-build the search index:
```bash
python backend/create_faiss_index.py
```

### 3. Voice Interaction
The backend now includes a speech engine. You can test it by sending a POST request to `/ask` with `{"question": "Who is the powerhouse of the cell?", "voice": true}`. The assistant will speak the answer aloud.

### 4. Mobile App
The Android app code is located in `android-app/`. 
- Open the project in **Android Studio**.
- Ensure the backend is reachable from your mobile device or emulator (usually via `10.0.2.2:5000` for emulators).
- Build and run the app to see the chat interface.

## 📁 Key Features Added
- **Offline RAG**: Uses FAISS and TinyLlama for local inference.
- **Speech Engine**: Built-in TTS and STT for accessibility.
- **Automated Setup**: The `setup_project.py` script handles all dependencies.
- **Sample Data**: A small dataset is included in `data/curriculum_data.json` for immediate testing.

## 🛑 Note on LLM Weights
Due to size constraints, the LLM weights are not bundled. 
Please download [TinyLlama-1.1B-Chat-v1.0-GGUF](https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF) and place the `.gguf` file in `models/llm/`.
