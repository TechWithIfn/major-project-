import os
from pathlib import Path
from langchain_huggingface import HuggingFaceEmbeddings

def download_embeddings():
    """ Downloads the embedding model to the local cache for offline use. """
    model_name = "sentence-transformers/all-MiniLM-L6-v2"
    cache_dir = Path("models/embeddings")
    cache_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"📥 Downloading Embedding Model: {model_name}...")
    try:
        # Initializing the model will trigger the download and save it to the cache_folder
        embeddings = HuggingFaceEmbeddings(
            model_name=model_name,
            cache_folder=str(cache_dir)
        )
        print(f"✅ Embedding Model saved to: {cache_dir.absolute()}")
    except Exception as e:
        print(f"❌ Failed to download embedding model: {e}")

if __name__ == "__main__":
    download_embeddings()
