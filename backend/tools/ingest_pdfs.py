import os
import re
import json
from pathlib import Path
from typing import List, Dict
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

class NCERTNLPProcessor:
    """Advanced NLP pipeline for NCERT textbook processing."""
    
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", ".", " ", ""]
        )

    def clean_text(self, text: str) -> str:
        """Normalizes and cleans extracted text from PDFs."""
        # 1. Remove multiple newlines and extra spaces
        text = re.sub(r'\n+', '\n', text)
        text = re.sub(r' +', ' ', text)
        
        # 2. Remove typical NCERT header/footer patterns (e.g., "Rationalised 2023-24", Page numbers)
        text = re.sub(r'Rationalised 20\d{2}-\d{2}', '', text)
        text = re.sub(r'Page \d+', '', text)
        
        # 3. Fix hyphenated words broken across lines (e.g., "re- \n source" -> "resource")
        text = re.sub(r'(\w+)-\n\s*(\w+)', r'\1\2', text)
        
        return text.strip()

    def process_pdf(self, file_path: Path) -> List[Dict]:
        """Extracts, cleans, and chunks a single PDF file."""
        print(f"📄 Processing: {file_path.name}")
        
        try:
            loader = PyMuPDFLoader(str(file_path))
            pages = loader.load()
            
            all_chunks = []
            for page in pages:
                cleaned_content = self.clean_text(page.page_content)
                
                # Split page content into semantic chunks
                chunks = self.text_splitter.create_documents(
                    [cleaned_content], 
                    metadatas=[{
                        "source": file_path.name,
                        "page": page.metadata.get("page", 0) + 1,
                        "total_pages": len(pages)
                    }]
                )
                
                for chunk in chunks:
                    all_chunks.append({
                        "content": chunk.page_content,
                        "metadata": chunk.metadata
                    })
            
            return all_chunks
            
        except Exception as e:
            print(f"❌ Error processing {file_path.name}: {e}")
            return []

def run_pipeline(source_dir: str, output_file: str):
    """Orchestrates the NLP pipeline across all PDFs in a directory."""
    processor = NCERTNLPProcessor()
    source_path = Path(source_dir)
    output_path = Path(output_file)
    
    if not source_path.exists():
        print(f"Error: {source_dir} not found.")
        return

    pdf_files = list(source_path.glob("*.pdf"))
    if not pdf_files:
        print(f"No PDFs found in {source_dir}.")
        return

    master_knowledge_base = []
    
    print(f"🚀 Starting NLP Pipeline for {len(pdf_files)} textbooks...")
    
    for pdf in pdf_files:
        chunks = processor.process_pdf(pdf)
        master_knowledge_base.extend(chunks)
        print(f"✅ Generated {len(chunks)} chunks from {pdf.name}")

    # Save to structured JSON
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(master_knowledge_base, f, indent=4, ensure_ascii=False)
    
    print("\n✨ Pipeline Complete!")
    print(f"📊 Total Semantic Chunks: {len(master_knowledge_base)}")
    print(f"💾 Saved Knowledge Base to: {output_file}")

if __name__ == "__main__":
    # Standard project paths
    INPUT_DIR = "data/ncert_pdfs"
    OUTPUT_KB = "data/processed/knowledge_base.json"
    
    run_pipeline(INPUT_DIR, OUTPUT_KB)
