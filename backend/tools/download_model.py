import os
import requests
from pathlib import Path

def download_file(url, target_path):
    print(f"📥 Downloading {url} to {target_path}...")
    response = requests.get(url, stream=True)
    response.raise_for_status()
    
    with open(target_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    print("✅ Download complete!")

if __name__ == "__main__":
    # Settings for a tiny model that fits in almost any RAM
    MODEL_URL = "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
    MODEL_DIR = Path("models/llm")
    MODEL_PATH = MODEL_DIR / "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"

    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    if not MODEL_PATH.exists():
        try:
            download_file(MODEL_URL, MODEL_PATH)
        except Exception as e:
            print(f"❌ Failed to download model: {e}")
            print("Please download it manually from HuggingFace and place it in models/llm/")
    else:
        print(f"⭐ Model already exists at {MODEL_PATH}")
