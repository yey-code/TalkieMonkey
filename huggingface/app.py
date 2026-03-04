# TalkieMonkey — Hugging Face Space (Whisper Microservice)
#
# This is a standalone FastAPI service that runs openai/whisper-tiny.en
# on Hugging Face Spaces (free tier, 16GB RAM).
#
# Deploy this folder as a new HF Space:
#   - SDK: Docker (or Gradio)
#   - Hardware: CPU Basic (free) — whisper-tiny.en runs fine on CPU
#
# The Laravel backend will POST audio files here and receive transcribed text.

import io
import logging
import tempfile

import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline

# ── Setup ────────────────────────────────────────────────────────────────────

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("talkie-monkey-whisper")

app = FastAPI(
    title="TalkieMonkey Whisper Service",
    description="Transcribes children's speech using whisper-tiny.en",
    version="1.0.0",
)

# Allow the Laravel backend to call this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load Model (once at startup) ────────────────────────────────────────────

logger.info("Loading whisper-tiny.en model...")
transcriber = pipeline(
    task="automatic-speech-recognition",
    model="openai/whisper-tiny.en",
    device="cpu",
    torch_dtype=torch.float32,
)
logger.info("Model loaded successfully!")


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "model": "whisper-tiny.en"}


@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Accept an audio file (webm, wav, mp3, ogg, etc.) and return the
    transcribed text using whisper-tiny.en.

    The Laravel backend sends multipart/form-data with key 'file'.
    """
    if not file:
        raise HTTPException(status_code=400, detail="No audio file provided.")

    logger.info(f"Received file: {file.filename}, type: {file.content_type}")

    try:
        # Read the uploaded bytes
        audio_bytes = await file.read()

        if len(audio_bytes) == 0:
            raise HTTPException(status_code=400, detail="Audio file is empty.")

        # Write to a temp file (transformers pipeline needs a file path or numpy array)
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        # Run Whisper inference
        result = transcriber(tmp_path)
        text = result.get("text", "").strip()

        logger.info(f"Transcription result: {text}")

        return {"text": text}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Transcription failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


# ── Run (for local development) ─────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
