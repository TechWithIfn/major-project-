try:
    import fastapi
    import uvicorn
    import langchain
    from langchain_huggingface import HuggingFaceEmbeddings
    from core.rag_pipeline import ShikshaRAGPipeline
    print("✅ All imports successful!")
except ImportError as e:
    print(f"❌ Import failed: {e}")
except Exception as e:
    print(f"❌ Error during import: {e}")
