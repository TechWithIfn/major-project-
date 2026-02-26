# ShikshaSahayak: Embedding & Vector Storage Design

## 1. Model Recommendation (Offline-First)
For edge devices (Android/Mobile/Laptop), we prioritize models with high **Performance-per-MB**.

| Model | Size | Dimensions | Latency (CPU) | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **all-MiniLM-L6-v2** | **80 MB** | **384** | **~5ms** | **Primary Choice**: Balanced and extremely fast. |
| **all-mpnet-base-v2** | 420 MB | 768 | ~25ms | Higher accuracy, but may be too slow for mobile. |
| **paraphrase-multilingual-MiniLM-L12-v2** | 120 MB | 384 | ~10ms | Best for Hindi/Regional language support. |

**Current Implementation**: We are using `all-MiniLM-L6-v2` via the `langchain-huggingface` connector.

---

## 2. Infrastructure: Vector Database
We use **FAISS (Facebook AI Similarity Search)**.
- **Why?**: It is an "In-Memory" vector store that can be serialized to a flat file. It requires zero server setup and has a C++ core for ultra-fast similarity calculations.
- **Storage Type**: We use the `IndexFlatL2` (Exact Search) for small curriculum datasets (<10,000 chunks) and can upgrade to `HNSW` (Approximate Search) if the data grows to millions of chunks.

---

## 3. Python Implementation Workflow

### **A. Serialization (Indexing)**
This happens during the deployment phase.
1.  Load cleaned JSON chunks.
2.  Batch process text through the MiniLM Transformer.
3.  Store the resulting vectors in a FAISS index.
4.  Save the index and metadata to the `vectorstore/` directory.

### **B. Retrieval (Similarity Search)**
This happens in real-time on the student's device.
1.  **Vectorization**: The student's query (e.g., "What is a cell?") is converted into a 384-d vector.
2.  **L2 Distance Search**: FAISS calculates the distance between the query vector and all textbook vectors.
3.  **Top-K Selection**: The top 3-5 most relevant passages are returned based on the lowest distance score.

---

## 4. Implementation Steps (Independent Test Script)
You can test the semantic search independently using `backend/test_vector_search.py`.

```python
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# 1. Load the existing local index
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vector_db = FAISS.load_local("vectorstore/faiss_index", embeddings, allow_dangerous_deserialization=True)

# 2. Perform a similarity search
query = "Explain the process of photosynthesis"
results = vector_db.similarity_search(query, k=3)

# 3. Output results
for doc in results:
    print(f"Source: {doc.metadata['source']} | Page: {doc.metadata['page']}")
    print(f"Content: {doc.page_content[:150]}...\n")
```

---

## 5. Offline Optimization
- **Quantization**: We use FP16 embeddings to reduce the index size.
- **Normalization**: We normalize embeddings during indexing (L2-norm) so that we can use simple Inner Product search, which is even faster on low-end CPUs.
