import os
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sarvamai import SarvamAI

ROOT_DIR = Path(__file__).parent.parent
FRONTEND_DIR = ROOT_DIR / "frontend"

# minimal .env loader (no extra dependency)
env_path = ROOT_DIR / ".env"
if env_path.exists():
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, _, value = line.partition("=")
            os.environ.setdefault(key.strip(), value.strip())

API_KEY = os.environ.get("SARVAM_API_KEY")
if not API_KEY:
    raise RuntimeError("SARVAM_API_KEY is not set. Add it to .env and try again.")

client = SarvamAI(api_subscription_key=API_KEY)

POLICY_TEXT = (ROOT_DIR / "data.md").read_text(encoding="utf-8")

SYSTEM_PROMPT = f"""You are the Senior Citizen Secure Pension Scheme (SCSP) voice assistant.
Your users are elderly and retired people. Speak slowly and simply, one idea at a time.
Answer only using the policy document below. Never invent eligibility rules, amounts,
documents, or deadlines. If the answer is not in the document, say so clearly. If asked
whether SCSP is a real government scheme, explain it is a fictional demonstration policy.
Keep answers short (2-4 sentences) since they will be read aloud.

POLICY DOCUMENT:
{POLICY_TEXT}
"""

# language_code -> a Sarvam TTS speaker
SPEAKERS = {
    "en-IN": "priya",
    "hi-IN": "priya",
    "ta-IN": "shruti",
    "te-IN": "kavya",
}

app = FastAPI(title="SCSP Pension Voice Assistant")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/voice")
async def voice_query(
    file: UploadFile = File(...),
    language_code: str = Form("en-IN"),
):
    audio_bytes = await file.read()

    try:
        stt = client.speech_to_text.transcribe(
            file=(file.filename or "audio.webm", audio_bytes, file.content_type),
            model="saaras:v3",
            language_code=language_code,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Speech-to-text failed: {exc}")

    transcript = stt.transcript.strip()
    if not transcript:
        raise HTTPException(status_code=422, detail="Could not hear any speech. Please try again.")

    try:
        chat = client.chat.completions(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": transcript},
            ],
            model="sarvam-105b-conversations",
        )
        reply_text = chat.choices[0].message.content.strip()
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Chat completion failed: {exc}")

    speaker = SPEAKERS.get(language_code, "anushka")
    try:
        tts = client.text_to_speech.convert(
            text=reply_text,
            language_code=language_code,
            speaker=speaker,
            model="bulbul:v3",
        )
        audio_base64 = tts.audios[0]
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Text-to-speech failed: {exc}")

    return {
        "transcript": transcript,
        "reply": reply_text,
        "audio_base64": audio_base64,
    }


app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
