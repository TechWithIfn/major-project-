import os
import sys
import subprocess
from pathlib import Path

def setup_environment():
    """Sets up the project structure, installs dependencies, and prepares models."""
    print("🛠️ Starting Shiksha Sahayak Project Setup...")

    # 1. Create necessary directories
    directories = [
        "data/ncert_pdfs",
        "vectorstore/faiss_index",
        "models/embeddings",
        "models/llm"
    ]
    for d in directories:
        Path(d).mkdir(parents=True, exist_ok=True)
        print(f"✅ Created directory: {d}")

    # 2. Install dependencies
    print("\n📦 Installing Python dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"])
        print("✅ Dependencies installed successfully.")
    except Exception as e:
        print(f"❌ Error installing dependencies: {e}")

    # 3. Inform about Large Models
    print("\n💡 SETUP TIP: Large Model Weights")
    print("To finish setup, you need the TinyLlama model (or similar).")
    print("Download 'tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf' and place it in 'models/llm/'.")
    print("Link: https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF")

    # 4. Check for PDFs
    pdfs = list(Path("data/ncert_pdfs").glob("*.pdf"))
    if not pdfs:
        print("\n⚠️ WARNING: No NCERT PDFs found in 'data/ncert_pdfs'.")
        print("Please add some PDF files and run 'python backend/ingest_pdfs.py' then 'python backend/create_faiss_index.py'")

    print("\n🚀 Setup Complete! You can now start the backend with 'python backend/app.py'")

if __name__ == "__main__":
    setup_environment()
