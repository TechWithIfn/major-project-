# ShikshaSahayak: Edge AI & On-Device inference Design

## 1. Model Selection (SLM - Small Language Models)
For offline mobile execution (< 2GB RAM required), we recommend **4-bit quantized (GGUF)** models.

| Model | Parameters | VRAM/RAM Req. | Speed (Tokens/sec) | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **TinyLlama-1.1B** | 1.1 Billion | **~800 MB** | **50+ t/s** | Lower-end devices, ultra-fast responses. |
| **Microsoft Phi-3 Mini**| 3.8 Billion | ~2.2 GB | 20-30 t/s | **Primary Choice**: High reasoning for NCERT Science/Math. |
| **Google Gemma-2B** | 2 Billion | ~1.5 GB | 30-40 t/s | Creative explanation and literature. |

**Current Implementation**: TinyLlama-1.1B (GGUF) for maximum compatibility.

---

## 2. Quantization Workflow (GGUF)
Quantization reduces model weights from 16-bit to 4-bit, reducing size by ~70% with minimal accuracy loss.
1.  **Original**: `model.fp16.bin` (6GB+)
2.  **Tool**: `llama.cpp` using `quantize` utility.
3.  **Output**: `model.Q4_K_M.gguf` (~1.1GB for Phi-3, ~600MB for TinyLlama).
4.  **Efficiency**: Q4_K_M (Medium) is the "sweet spot" for mobile AI performance.

---

## 3. Local Inference Frameworks
- **GPT4All (Desktop/Backend Dev)**: Lightweight local model runner.
- **MLC-LLM (Production Mobile)**: Compiles models into native Vulkan/NPU code for Android.
- **Mediapipe LLM Inference**: Google's specialized API for Gemma/Phi-3 on Android.

---

## 4. Python Integration (Brain Module)
The [`backend/ncert_rag_system.py`](command:view_file?path=c:\Users\Irfan\Downloads\shiksha-sahayak-offline-ai\backend\ncert_rag_system.py) implements this using GPT4All.

```python
from gpt4all import GPT4All

# 1. Initialize the locally stored model
model = GPT4All(
    model_name="tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
    model_path="models/llm/",
    device='cpu' # Can be set to 'gpu' or 'npu' if supported
)

# 2. Inference Loop
with model.chat_session():
    response = model.generate("Explain gravity to a Class 8 student.", max_tokens=200)
    print(response)
```

---

## 5. Performance Optimization for Edge
- **Prompt Caching**: Reuses common prompt prefixes (Instruction) to save compute.
- **Token Streaming**: Displays text as it's generated so the user doesn't feel the "processing" delay.
- **Context Limiting**: We limit retrieval to Top-3 chunks (~1000 tokens) to keep the KV-cache small and fast.
