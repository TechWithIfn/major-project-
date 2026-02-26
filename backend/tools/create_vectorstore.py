import json
import os
from pathlib import Path
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

def process_to_vectorstore(json_input_path: str, vectorstore_dir: str):
    """
    1. Loads extracted text from JSON.
    2. Chunks text using RecursiveCharacterTextSplitter.
    3. Generates embeddings using a local SentenceTransformer.
    4. Saves to an offline-ready ChromaDB.
    """
    input_path = Path(json_input_path)
    persist_directory = Path(vectorstore_dir)
    
    if not input_path.exists():
        print(f"Error: Input file {json_input_path} not found. Run ingest_pdfs.py first.")
        return

    # Load the JSON data
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 1. Recursive Chunking (500 chars with 50 char overlap)
    # This splitter is "Recursive" because it tries to split on paragraphs (\n\n), 
    # then sentences (\n), then spaces ( ) to keep semantic context together.
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        length_function=len,
        separators=["\n\n", "\n", " ", ""]
    )

    documents = []
    metadatas = []

    print("Chunking text...")
    for entry in data:
        # Split individual page content into smaller chunks
        chunks = text_splitter.split_text(entry['content'])
        
        for chunk in chunks:
            documents.append(chunk)
            # Carry over metadata (source and page) to every chunk
            metadatas.append({
                "source": entry['source'],
                "page": entry['page_number']
            })

    print(f"Total chunks created: {len(documents)}")

    # 2. Embedding Generation (all-MiniLM-L6-v2)
    # This model is perfect for offline use: fast, small ( ~80MB), and high quality.
    print("Initializing embedding model (all-MiniLM-L6-v2)...")
    model_name = "sentence-transformers/all-MiniLM-L6-v2"
    
    # cache_folder ensures the model is downloaded once and stored locally
    encode_kwargs = {'normalize_embeddings': True} # Better for cosine similarity
    embeddings = HuggingFaceEmbeddings(
        model_name=model_name,
        cache_folder="../models/embeddings",
        encode_kwargs=encode_kwargs
    )

    # 3. Save to Vectorstore (ChromaDB)
    # Chroma is a serverless vector DB that saves everything into a local folder.
    print(f"Creating vector store in {vectorstore_dir}...")
    vector_db = Chroma.from_texts(
        texts=documents,
        embedding=embeddings,
        metadatas=metadatas,
        persist_directory=str(persist_directory)
    )

    # In modern Chroma versions, it persists automatically on object destruction,
    # but some versions require a manual call if you're not using context managers.
    # vector_db.persist() # Optional for newer LangChain versions
    
    print("✅ Success! Vector store is ready for offline RAG.")

if __name__ == "__main__":
    INPUT_JSON = "../data/curriculum_data.json"
    VECTOR_DIR = "../vectorstore/ncert_db"
    
    process_to_vectorstore(INPUT_JSON, VECTOR_DIR)
