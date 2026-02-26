import os
from pathlib import Path
from typing import List, Dict, Optional
import time

# --- ML & RAG Imports (Delayed) ---
# Heavy imports moved inside class to speed up API boot
from langchain_core.documents import Document


# Internal Import (The Edge Engine we built)
from .edge_inference import EdgeLLMEngine

class ShikshaRAGPipeline:
    """
    End-to-end Offline RAG Pipeline for Shiksha Sahayak.
    Designed for reliability, speed, and grounding (hallucination reduction).
    """
    
    def __init__(self, config: Dict):
        self.config = config
        self.model_dir = Path(config.get("llm_dir", "models/llm"))
        self.index_path = Path(config.get("index_path", "vectorstore/faiss_index"))
        self.embedding_cache = Path(config.get("embedding_cache", "models/embeddings"))
        
        # 1. Initialize Embeddings (Offline)
        print("📥 Loading Embedding Model (Sentence-Transformers)...")
        from langchain_huggingface import HuggingFaceEmbeddings
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            cache_folder=str(self.embedding_cache),
            encode_kwargs={'normalize_embeddings': True}
        )

        
        # 2. Initialize Vector DB
        self.vector_db = self._load_vector_db()
        
        # 3. Initialize LLM Engine
        print(f"🧠 Loading Edge LLM ({config['llm_model']})...")
        self.llm = EdgeLLMEngine(
            model_path=str(self.model_dir / config['llm_model']),
            n_ctx=2048,
            use_gpu=config.get("use_gpu", False)
        )

    def _load_vector_db(self):
        from langchain_community.vectorstores import FAISS
        if not self.index_path.exists():
            print(f"⚠️ Warning: FAISS index not found at {self.index_path}. Search will be disabled.")
            return None
        
        print(f"✅ Loading FAISS database from {self.index_path}")
        return FAISS.load_local(
            str(self.index_path), 
            self.embeddings,
            allow_dangerous_deserialization=True
        )


    def retrieve(self, query: str, k: int = 4) -> List[Document]:
        """Step 2 & 3: Search and Retrieve relevant passages."""
        if not self.vector_db:
            return []
        
        # Filter logic can be added here (e.g., by class or subject metadata)
        return self.vector_db.similarity_search(query, k=k)

    def format_grounded_prompt(self, context_docs: List[Document], query: str) -> str:
        """Step 4: Construct a prompt that minimizes hallucinations."""
        
        # Building context with citations
        context_blocks = []
        for i, doc in enumerate(context_docs):
            source = doc.metadata.get("source", "NCERT Textbook")
            page = doc.metadata.get("page", "Unknown")
            context_blocks.append(f"--- SOURCE {i+1} (Book: {source}, Page: {page}) ---\n{doc.page_content}")
        
        joined_context = "\n\n".join(context_blocks)
        
        # THE "GROUNDING" INSTRUCTION
        # This is the primary method to minimize hallucinations:
        # 1. Explicitly forbid talking outside context.
        # 2. Require citations.
        # 3. Provide a fallback phrase.
        prompt = f"""<|system|>
You are 'Shiksha Sahayak', a professional AI tutor. Your goal is to help students understand NCERT curriculum based ONLY on the provided context.

### CONSTRAINTS:
1. Answer use ONLY the provided Sources. If the answer isn't there, say: "I'm sorry, that topic isn't in the provided NCERT chapters."
2. ALWAYS cite the source and page number in your response.
3. Be concise, encouraging, and accurate. Do not make up facts.

### NCERT CONTEXT:
{joined_context}
<|user|>
Student Question: {query}
<|assistant|>
"""
        return prompt

    def ask(self, query: str, stream: bool = False):
        """Step 5: Orchestrate RAG flow and generate grounded response."""
        start_time = time.time()
        
        # 1. Retrieve
        docs = self.retrieve(query)
        if not docs:
            return {"answer": "Error: Knowledge base unavailable.", "sources": []}
            
        # 2. Grounded Prompt
        full_prompt = self.format_grounded_prompt(docs, query)
        
        # 3. Generate
        print(f"⚡ Generating response for: {query[:50]}...")
        response = self.llm.generate(full_prompt, max_tokens=512, stream=stream)
        
        # 4. Return results with sources for transparency
        sources = [
            {"source": d.metadata.get("source"), "page": d.metadata.get("page")} 
            for d in docs
        ]
        
        latency = round(time.time() - start_time, 2)
        print(f"✅ Generated in {latency}s")
        
        if stream:
            return response, sources
        else:
            return {"answer": response, "sources": sources, "latency": latency}

# --- API Ready Structure Integration ---
# This part would be used inside main.py (FastAPI) or app.py (Flask)
if __name__ == "__main__":
    # Test configuration
    config = {
        "llm_model": "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
        "llm_dir": "models/llm",
        "index_path": "vectorstore/faiss_index",
        "embedding_cache": "models/embeddings"
    }
    
    pipeline = ShikshaRAGPipeline(config)
    
    # Test a query
    print("\n--- RAG PIPELINE TEST ---")
    query = "What are the fundamental rights in India?"
    result = pipeline.ask(query)
    
    print(f"\n🎓 SHIKSHA SAHAYAK:\n{result['answer']}")
    print(f"\n📚 SOURCES: {result['sources']}")
