import os
import sys
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

def test_search():
    index_path = "vectorstore/faiss_index"
    
    if not os.path.exists(index_path):
        print(f"❌ Error: Vector index not found at {index_path}. Please run indexing scripts first.")
        return

    print("🤖 Initializing ML Search Engine...")
    try:
        # Load the same embedding model used during ingestion
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            cache_folder="models/embeddings"
        )
        
        # Load the FAISS index locally (Offline mode)
        vector_db = FAISS.load_local(
            index_path, 
            embeddings, 
            allow_dangerous_deserialization=True
        )
        
        print("✅ Ready! Type a query to test semantic search (or 'exit' to quit).")
        
        while True:
            query = input("\n🔍 Search Query: ")
            if query.lower() == 'exit':
                break
            
            # Implementation of similarity search
            results = vector_db.similarity_search_with_score(query, k=3)
            
            print(f"\nFound {len(results)} relevant passages:")
            print("-" * 50)
            for i, (doc, score) in enumerate(results):
                print(f"Result {i+1} [Score: {score:.4f}]")
                print(f"📄 Source: {doc.metadata.get('source')} | Page: {doc.metadata.get('page')}")
                print(f"📝 Content: {doc.page_content[:200]}...")
                print("-" * 50)

    except Exception as e:
        print(f"❌ ML Search Error: {e}")

if __name__ == "__main__":
    test_search()
