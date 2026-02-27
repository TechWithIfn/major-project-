import os

# --- Memory-safe defaults for local/low-RAM environments ---
# Must be set before importing ML/Numpy-backed libraries.
os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")
os.environ.setdefault("NUMEXPR_NUM_THREADS", "1")
os.environ.setdefault("KMP_DUPLICATE_LIB_OK", "TRUE")

import uvicorn
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# Core AI Pipeline
from core.rag_pipeline import ShikshaRAGPipeline
from core.speech_engine import ShikshaSpeech

import logging
from datetime import datetime
import time

app = FastAPI(title="Shiksha Sahayak - AI Tutor API")

# Setup CORS for web access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("ShikshaAPI")

# Configuration
config = {
    "index_path": os.path.join(os.path.dirname(__file__), "vectorstore/faiss_index"),
    "embedding_cache": os.path.join(os.path.dirname(__file__), "models/embeddings"),
    "llm_model": "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
    "llm_dir": os.path.join(os.path.dirname(__file__), "models/llm"),
    "use_gpu": False,
    "n_ctx": int(os.getenv("SHIKSHA_LLM_CTX", "1024")),
    "n_threads": int(os.getenv("SHIKSHA_LLM_THREADS", "2")),
    "retrieval_k": int(os.getenv("SHIKSHA_RETRIEVAL_K", "3"))
}

# Lazy initialization of engines
rag_pipeline = None
speech_engine = None

def get_engines():
    global rag_pipeline, speech_engine
    if rag_pipeline is None:
        try:
            logger.info("🚀 Initializing Shiksha Sahayak AI Engines...")
            rag_pipeline = ShikshaRAGPipeline(config)
            speech_engine = ShikshaSpeech()
            logger.info("✅ Engines Initialized Successfully")
        except Exception as e:
            logger.error(f"❌ Initialization Error: {e}")
    return rag_pipeline, speech_engine

class QueryRequest(BaseModel):
    question: str
    voice: bool = False
    stream: bool = False

class QueryResponse(BaseModel):
    answer: str
    sources: List[dict] = []
    latency_ms: float
    timestamp: str
    model: str

@app.get("/health")
async def health():
    return {
        "status": "online", 
        "model": config["llm_model"],
        "device": "cpu", # Change if GPU is enabled
        "timestamp": datetime.now().isoformat()
    }

@app.post("/ask", response_model=QueryResponse)
async def ask_question(request: QueryRequest = Body(...)):
    start_time = time.time()
    pipeline, speech = get_engines()
    
    if not pipeline:
        logger.error("Attempted to access unitialized pipeline")
        raise HTTPException(
            status_code=503, 
            detail="AI Brain is still initializing or failed to load. Check server logs."
        )
    
    if not request.question or len(request.question.strip()) < 2:
        raise HTTPException(status_code=400, detail="Question is too short or empty.")

    try:
        logger.info(f"📩 Processing Question: {request.question[:50]}...")
        
        # Generate grounded result
        result = pipeline.ask(request.question)
        
        # Optional Voice Response
        if request.voice and speech:
            speech.speak(result["answer"])
            
        latency = (time.time() - start_time) * 1000 # convert to ms
        
        return QueryResponse(
            answer=result["answer"],
            sources=result["sources"],
            latency_ms=round(latency, 2),
            timestamp=datetime.now().isoformat(),
            model=config["llm_model"]
        )
    except Exception as e:
        logger.error(f"❌ Inference Error: {e}")
        raise HTTPException(status_code=500, detail=f"Inference Engine Error: {str(e)}")

@app.get("/voice/listen")
async def listen_voice():
    _, speech = get_engines()
    if not speech:
        raise HTTPException(status_code=500, detail="Speech Engine not ready")
    
    try:
        text = speech.listen()
        return {"text": text, "timestamp": datetime.now().isoformat()}
    except Exception as e:
        logger.error(f"❌ Microphone Error: {e}")
        return {"error": "Failed to access microphone", "detail": str(e)}

if __name__ == "__main__":
    logger.info("📖 Shiksha Sahayak Backend Starting on Port 5000")
    uvicorn.run(app, host="0.0.0.0", port=5000)
