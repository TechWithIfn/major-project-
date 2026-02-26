import json
import os
from pathlib import Path
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document

def create_faiss_index(json_input: str, output_dir: str, model_cache: str):
    """
    1. Loads extracted text from JSON.
    2. Converts to LangChain Documents.
    3. Generates embeddings using all-MiniLM-L6-v2.
    4. Saves to FAISS vectorstore.
    """
    input_path = Path(json_input)
    output_path = Path(output_dir)
    
    if not input_path.exists():
        print(f"❌ Error: {json_input} not found. Please run ingest_pdfs.py first.")
        return

    # Load JSON
    print(f"📂 Loading data from {json_input}...")
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Convert to Document objects
    documents = [
        Document(
            page_content=item['content'],
            metadata=item['metadata']
        ) for item in data
    ]
    print(f"📄 Loaded {len(documents)} document chunks.")

    # Initialize Embeddings
    print("🤖 Initializing Embedding Model (all-MiniLM-L6-v2)...")
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        cache_folder=model_cache,
        encode_kwargs={'normalize_embeddings': True}
    )

    # Create and Save FAISS Index
    print(f"🏗️ Building FAISS index and saving to {output_dir}...")
    vector_db = FAISS.from_documents(documents, embeddings)
    vector_db.save_local(output_dir)
    
    print("✅ Success! FAISS vector store is ready.")

if __name__ == "__main__":
    # Settings
    INPUT_JSON = "data/curriculum_data.json"
    OUTPUT_FAISS = "vectorstore/faiss_index"
    MODEL_CACHE = "models/embeddings"

    create_faiss_index(INPUT_JSON, OUTPUT_FAISS, MODEL_CACHE)
