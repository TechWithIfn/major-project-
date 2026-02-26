# Edge AI Implementation Guide: Offline LLM for Shiksha Sahayak

As an Edge AI engineer, I have implemented a robust on-device inference layer. Below are the recommendations, workflows, and integration details for the offline AI tutor.

---

## 1. Model Selection Recommendations
For mobile and offline hardware, we prioritize **Small Language Models (SLMs)** with high reasoning capabilities but low RAM footprint.

| Model | Parameters | Size (4-bit GGUF) | RAM Recommended | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Llama 3.2 1B** | 1B | **~0.8 GB** | 1.5 - 2 GB | Low-end mobile phones, ultra-fast. |
| **Phi-3.5 Mini** | 3.8B | **~2.4 GB** | 4 GB | **Engine Choice**: Best for complex Science/Math. |
| **Qwen 2.5 1.5B** | 1.5B | **~1.1 GB** | 2 GB | Strong multilingual (Hindi/English) support. |
| **Gemma 2 2B** | 2B | **~1.6 GB** | 3 GB | Google-optimized, great for creative explanations. |

---

## 2. Quantization Workflow (GGUF)
Quantization is essential for mobile to reduce bit-precision (from FP16 to 4-bit) without significant intelligence loss.

### Workflow using `llama.cpp`:
1. **Model Preparation**: Download the original HuggingFace model (SafeTensors).
2. **Setup Tooling**:
   ```powershell
   git clone https://github.com/ggerganov/llama.cpp
   python -m pip install -r llama.cpp/requirements.txt
   ```
3. **Conversion**: Convert to the unified GGUF format.
   ```powershell
   python llama.cpp/convert_hf_to_gguf.py models/Phi-3.5-mini-instruct --outfile models/phi3.gguf
   ```
4. **Quantization**: Compress to 4-bit (Medium).
   ```powershell
   ./llama.cpp/quantize models/phi3.gguf models/phi3-q4_k_m.gguf Q4_K_M
   ```

---

## 3. Local Inference Setup Instructions (Windows/Mobile)
We use `llama-cpp-python` as the core integration layer because it supports hardware acceleration (AVX2 for CPU, CUDA for NVIDIA, and Metal for Mac).

### Installation:
```powershell
# For Windows (Recommended - frictionless):
pip install gpt4all

# For Advanced/Mobile Acceleration (Requires C++ Compiler):
# pip install llama-cpp-python
```

> **Note for Windows Users**: If you see `CMAKE_C_COMPILER not set` errors, it means you lack Visual Studio Build Tools. **Skip llama-cpp-python** and use **GPT4All**; it is already optimized and works out-of-the-box.

### Folder Structure:
- `models/llm/` : Place your `.gguf` model files here.
- `backend/edge_inference.py` : The implementation module.

---

## 4. Python Integration Example
The system is integrated via the `EdgeLLMEngine` class.

```python
from edge_inference import EdgeLLMEngine

# 1. Initialize with specific mobile constraints
engine = EdgeLLMEngine(
    model_path="models/llm/phi3-q4_k_m.gguf",
    n_ctx=2048,      # Context window
    n_threads=4      # Number of CPU threads to use
)

# 2. Optimized Inference Loop
prompt = "Explain why the sky is blue using NCERT Science Class 6 concepts."
response = engine.generate(prompt, max_tokens=300)

print(f"AI Response: {response}")
```

---

## 5. Performance Optimization Tips
1. **Prompt Caching**: Enable `n_batch` and `n_ctx` reuse in `llama-cpp` to avoid re-processing the RAG context every time.
2. **Context Compression**: Summarize or limit the textbook passages to < 1000 tokens to keep RAM usage under 3GB.
3. **Threading**: Match `n_threads` to the number of physical cores on the mobile device (not logical threads) for best speed.
