import pyttsx3
import threading
import json
import os
from pathlib import Path

# Advanced Offline STT: Vosk (High accuracy, no internet required)
try:
    from vosk import Model, KaldiRecognizer
    import pyaudio
except ImportError:
    print("⚠️ Vosk or PyAudio not found. Offline STT will be disabled.")
    Model = None

class ShikshaSpeech:
    """
    Advanced Speech Engine for Shiksha Sahayak.
    Supports: Offline STT (Vosk), Offline TTS (pyttsx3), 
    and Bilingual (Hindi/English) interaction.
    """
    
    def __init__(self, stt_model_path: str = "models/speech/vosk-model-small-en-in-0.4"):
        # 1. Initialize TTS (Text-to-Speech)
        self.tts_engine = pyttsx3.init()
        self.tts_engine.setProperty('rate', 160)
        self.tts_engine.setProperty('volume', 1.0)
        
        # 2. Initialize STT (Speech-to-Text) with Vosk
        self.stt_enabled = False
        if Model:
            try:
                model_path = Path(stt_model_path)
                if model_path.exists():
                    self.model = Model(str(model_path))
                    self.recognizer = KaldiRecognizer(self.model, 16000)
                    self.mic = pyaudio.PyAudio()
                    self.stt_enabled = True
                    print(f"✅ Offline STT Loaded: {model_path.name}")
                else:
                    print(f"⚠️ STT Model not found at {model_path}. Please download from alphacephei.com/vosk/models")
            except Exception as e:
                print(f"❌ STT Initialization Error: {e}")

    def speak(self, text: str):
        """Converts text to speech using the system's offline voice engine."""
        print(f"🔊 AI Spoke: {text}")
        
        # Detect language for better voice selection (Simplified)
        # 0: English, 1: Hindi (varies by system)
        voices = self.tts_engine.getProperty('voices')
        
        # Logic to switch voice if Hindi is detected (Unicode range for Devanagari)
        is_hindi = any('\u0900' <= char <= '\u097F' for char in text)
        if is_hindi:
            for voice in voices:
                if "hindi" in voice.name.lower():
                    self.tts_engine.setProperty('voice', voice.id)
                    break
        else:
            # Default to English if no Devanagari found
            for voice in voices:
                if "english" in voice.name.lower() or "zira" in voice.name.lower() or "david" in voice.name.lower():
                    self.tts_engine.setProperty('voice', voice.id)
                    break
        
        def _run_tts():
            try:
                self.tts_engine.say(text)
                self.tts_engine.runAndWait()
            except Exception as e:
                print(f"❌ TTS Error: {e}")

        threading.Thread(target=_run_tts, daemon=True).start()

    def listen(self) -> str:
        """Continuously listens and returns the recognized text string."""
        if not self.stt_enabled:
            return "STT Engine not available."

        print("🎤 Listening (Offline)...")
        stream = self.mic.open(format=pyaudio.paInt16, channels=1, rate=16000, input=True, frames_per_buffer=8000)
        stream.start_stream()

        try:
            while True:
                data = stream.read(4000, exception_on_overflow=False)
                if self.recognizer.AcceptWaveform(data):
                    result = json.loads(self.recognizer.Result())
                    text = result.get("text", "")
                    if text:
                        print(f"🗣️ Recognized: {text}")
                        return text
        except Exception as e:
            print(f"❌ Listening Error: {e}")
            return ""
        finally:
            stream.stop_stream()
            stream.close()

def get_speech_recommendations():
    """Returns documentation for hardware/software optimized for offline speech."""
    return """
# Offline Speech Engineering Recommendations

1. **STT Engine: Vosk**
   - **Why**: Superior to pocketsphinx, supports multi-language (Hindi/English), very fast on CPUs.
   - **Model**: Use `vosk-model-small-en-in` for Indian-accented English.
   - **Hindi**: Download `vosk-model-hi-0.22` for native Hindi support.

2. **TTS Engine: pyttsx3 (SAPI5 on Windows)**
   - **Why**: Uses native OS APIs, works 100% offline, zero latency.
   - **Optimization**: Install 'Hindi' language pack in Windows Settings -> Time & Language -> Speech.

3. **Hybrid Workflow**:
   - Detect script (Devanagari vs Latin) using regex.
   - Switch Vosk models if simultaneous bilingualism is needed.
    """

if __name__ == "__main__":
    # Integration Example
    engine = ShikshaSpeech()
    engine.speak("Namaste! Welcome to Shiksha Sahayak offline mode.")
    # text = engine.listen()
    # print(f"Output: {text}")
