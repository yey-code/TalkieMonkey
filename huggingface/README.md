---
title: TalkieMonkey Whisper
emoji: 🐵
colorFrom: green
colorTo: yellow
sdk: docker
app_port: 7860
pinned: false
---

# TalkieMonkey — Whisper Microservice (Hugging Face Space)

This is the AI transcription microservice for TalkieMonkey. It runs
`openai/whisper-tiny.en` via a FastAPI endpoint on Hugging Face Spaces.

## How to Deploy

1. Go to [huggingface.co/spaces](https://huggingface.co/spaces) and create a new Space.
2. Choose **Docker** as the SDK (or **Gradio** — but Docker gives us more control).
3. Upload the files from this folder (`app.py`, `requirements.txt`, `Dockerfile`).
4. The Space will build automatically and give you a public URL like:
   `https://<your-username>-talkie-monkey-whisper.hf.space`
5. Copy that URL and set it as `HUGGINGFACE_SPACE_URL` in your Laravel `.env`.

## Endpoints

| Method | Path          | Description                                    |
|--------|---------------|------------------------------------------------|
| GET    | `/`           | Health check — returns `{"status": "ok"}`      |
| POST   | `/transcribe` | Accepts `multipart/form-data` with key `file` and returns `{"text": "..."}` |

## Local Development

```bash
pip install -r requirements.txt
python app.py
# → Running on http://0.0.0.0:7860
```

## Hardware

`whisper-tiny.en` is ~39M parameters and runs comfortably on the free CPU
tier (16 GB RAM). No GPU required.
