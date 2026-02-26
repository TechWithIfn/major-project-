import os
import sys
from pathlib import Path
from typing import Optional, List, Iterator

# Use llama-cpp-python for high-performance GGUF inference
# Highly optimized for mobile/CPU/Windows/Mac
try:
    from llama_cpp import Llama
except ImportError:
    Llama = None

try:
    from gpt4all import GPT4All
except ImportError:
    GPT4All = None

class EdgeLLMEngine:
    """
    Optimized Inference Engine for On-Device SLMs.
    Uses llama-cpp-python for high-performance control, 
    with a robust fallback to GPT4All for Windows compatibility.
    """
    
    def __init__(
        self, 
        model_path: str, 
        n_ctx: int = 2048, 
        n_threads: int = 4,
        use_gpu: bool = False
    ):
        self.model_path = Path(model_path)
        self.n_ctx = n_ctx
        self.n_threads = n_threads
        self.engine_type = None
        self.model = None

        if not self.model_path.exists():
            print(f"❌ Error: Model file not found at {self.model_path}")
            return

        # Try llama-cpp-python first (Preferred for Edge tuning)
        if Llama:
            try:
                print(f"⚙️ Initializing Llama-CPP Engine: {self.model_path.name}")
                self.model = Llama(
                    model_path=str(self.model_path),
                    n_ctx=n_ctx,
                    n_threads=n_threads,
                    n_gpu_layers=-1 if use_gpu else 0,
                    verbose=False
                )
                self.engine_type = "llama-cpp"
                return
            except Exception as e:
                print(f"⚠️ Llama-CPP failed to init: {e}. Falling back...")

        # Fallback to GPT4All (Robust on Windows/Mobile)
        if GPT4All:
            print(f"⚙️ Initializing GPT4All Engine: {self.model_path.name}")
            self.model = GPT4All(
                model_name=self.model_path.name,
                model_path=str(self.model_path.parent),
                allow_download=False,
                device='gpu' if use_gpu else 'cpu'
            )
            self.engine_type = "gpt4all"
        else:
            print("❌ Error: No inference engine (llama-cpp or gpt4all) available.")

    def generate(
        self, 
        prompt: str, 
        max_tokens: int = 512, 
        temperature: float = 0.7,
        stream: bool = False
    ) -> Optional[str | Iterator]:
        if not self.model:
            return "Engine not initialized."

        if self.engine_type == "llama-cpp":
            output = self.model(
                prompt,
                max_tokens=max_tokens,
                temperature=temperature,
                stop=["###", "Student Question:"],
                stream=stream
            )
            return output if stream else output["choices"][0]["text"].strip()
            
        elif self.engine_type == "gpt4all":
            # GPT4All generate method
            return self.model.generate(
                prompt, 
                max_tokens=max_tokens, 
                temp=temperature,
                streaming=stream
            )

def get_quantization_workflow():
    """Returns documentation for the quantization workflow."""
    return """
# Edge AI Quantization Workflow (GGUF)

1. **Install llama.cpp**:
   ```bash
   git clone https://github.com/ggerganov/llama.cpp
   cd llama.cpp
   make
   ```

2. **Download Model (FP16/BF16)**:
   Use `huggingface-cli` to download the Safetensors version of a model (e.g., Phi-3-mini).

3. **Convert to GGUF (FP16)**:
   ```bash
   python convert.py models/phi3-mini --outfile models/phi3.gguf
   ```

4. **Quantize (4-bit - Recommended for Mobile)**:
   ```bash
   ./quantize models/phi3.gguf models/phi3-q4_k_m.gguf Q4_K_M
   ```
   *Q4_K_M is the optimal balance of speed (RAM) and accuracy.*
    """

if __name__ == "__main__":
    # Integration Example
    print("--- Edge AI Integration Example ---")
    
    # Recommendations for mobile hardware
    recommendations = [
        {"name": "Phi-3-Mini-Instruct", "size": "2.3GB (Q4)", "best_for": "High reasoning"},
        {"name": "Llama-3.2-1B-Instruct", "size": "0.7GB (Q4)", "best_for": "Low RAM devices"},
        {"name": "Gemma-2-2B-Instruct", "size": "1.6GB (Q4)", "best_for": "Creative tutoring"}
    ]
    
    print("\nRecommended Models for Shiksha Sahayak Offline:")
    for rec in recommendations:
        print(f" - {rec['name']}: {rec['size']} -> {rec['best_for']}")

    print("\nCheck backend/edge_inference.py for implementation details.")
