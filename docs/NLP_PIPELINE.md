# ShikshaSahayak: NLP Pipeline Documentation

## 1. Overview
The NLP pipeline is responsible for transforming unstructured NCERT PDF textbooks into a clean, structured, and semantically chunked knowledge base ready for RAG (Retrieval-Augmented Generation).

---

## 2. Recommended Stack
- **Engine**: Python 3.10+
- **Extraction**: `PyMuPDF` (via `fitz`) - Offers superior speed and coordinate management compared to PyPDF2.
- **NLP Orchestration**: `LangChain` - Provides standardized document loading and splitting logic.
- **Normalization**: Standard `re` (Regex) module for domain-specific noise reduction.

---

## 3. The Implementation Pipeline

### **Phase 1: High-Fidelity Extraction**
We use `PyMuPDFLoader` which preserves the native structure of PDF lines. This prevents "word-merging" common in low-level extractors.

### **Phase 2: Data Cleaning & Normalization**
The pipeline applies a strict cleaning regimen to ensure the LLM isn't confused by metadata:
- **Noise Removal**: Eliminates recurring textbook markers like "Rationalised 2023-24" or standard page headers.
- **Whitespace Normalization**: Collapses multi-line breaks caused by PDF column layouts.
- **Hyphen Reconstruction**: Merges words that were split across lines (e.g., "envi- ronment" -> "environment").

### **Phase 3: Semantic Chunking**
To ensure the LLM has enough context without exceeding window limits:
- **Strategy**: `RecursiveCharacterTextSplitter`.
- **Chunk Size**: 1000 characters (optimized for ~3-4 paragraphs of NCERT text).
- **Chunk Overlap**: 200 characters (prevents splitting a sentence in the middle and losing meaning).
- **Separators**: Priority-based splitting on `\n\n` (paragraphs), then `\n` (lines), then `.` (sentences).

---

## 4. Output Data Structure
Processed data is stored in `data/processed/knowledge_base.json` with the following schema:
```json
[
  {
    "content": "Full text of the semantic chunk...",
    "metadata": {
      "source": "Science_Class10_Ch1.pdf",
      "page": 12,
      "total_pages": 45
    }
  }
]
```

---

## 5. Folder Structure for Data
```text
data/
├── ncert_pdfs/          # RAW: Original source textbooks (PDF)
└── processed/           # STAGED: Structured JSON chunks
    └── knowledge_base.json
```

---

## 6. How to Execute
Run the pipeline from the project root:
```bash
python backend/ingest_pdfs.py
```
This will crawl all PDFs in the `data/ncert_pdfs/` directory and reconstruct the knowledge base.
