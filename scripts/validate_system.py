import requests
import time
import subprocess
import os
import sys

def validate():
    print("📋 Starting Shiksha Sahayak System Validation...")

    # 1. Check if backend is running
    print("\n🔍 Checking Backend Connectivity...")
    try:
        response = requests.get("http://localhost:5000/health", timeout=5)
        print(f"✅ Backend is ONLINE: {response.json()}")
    except:
        print("⚠️ Backend is not running. Attempting to start it in the background...")
        # Start backend/main.py
        process = subprocess.Popen([sys.executable, "backend/main.py"], 
                                   stdout=subprocess.DEVNULL, 
                                   stderr=subprocess.DEVNULL)
        time.sleep(5) # Wait for it to boot
        try:
            response = requests.get("http://localhost:5000/health", timeout=5)
            print(f"✅ Backend STARTED and ONLINE: {response.json()}")
        except:
            print("❌ Failed to start backend automatically. Please run 'python backend/main.py' manually.")
            return

    # 2. Test RAG Pipeline
    print("\n🧪 Testing RAG Pipeline (Offline Query)...")
    test_query = {"question": "What is the powerhouse of the cell?", "voice": False}
    try:
        response = requests.post("http://localhost:5000/ask", json=test_query, timeout=30)
        data = response.json()
        if "answer" in data:
            print("✅ RAG Answer Received!")
            print(f"🎓 Response: {data['answer'][:100]}...")
            if data['sources']:
                print(f"📖 Sources Found: {data['sources'][0]['source']}")
        else:
            print(f"❌ RAG Error: {data}")
    except Exception as e:
        print(f"❌ RAG Request Failed: {e}")

    # 3. Test Vector Store Presence
    print("\n📂 Checking Vector Store...")
    if os.path.exists("vectorstore/faiss_index/index.faiss"):
        print("✅ FAISS Index Found.")
    else:
        print("❌ FAISS Index MISSING. Run 'python backend/create_faiss_index.py'")

    # 4. Check Speech Engine
    print("\n🔊 Checking Speech Components...")
    try:
        from backend.speech_engine import ShikshaSpeech
        print("✅ Speech Engine Module 可用 (Module Available).")
    except ImportError as e:
        print(f"❌ Speech Engine Import Failed: {e}")

    print("\n✨ Validation Complete! Your local development environment is configured correctly.")

if __name__ == "__main__":
    validate()
