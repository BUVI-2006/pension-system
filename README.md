# SCSP Pension Voice Assistant (Demo)

A voice-first demo that lets elderly/retired users ask about a fictional
pension scheme — **Senior Citizen Secure Pension Scheme (SCSP)** — and hear
spoken answers grounded in [`data.md`](data.md).

> This is a fictional policy for demonstration purposes only, not a real
> government scheme.

## How it works

```
Browser mic → record audio
   → POST /api/voice (backend)
   → Sarvam Speech-to-Text   (saaras:v3)
   → Sarvam Chat Completion  (sarvam-105b-conversations, grounded in data.md)
   → Sarvam Text-to-Speech   (bulbul:v3)
   → JSON { transcript, reply, audio } back to browser
   → browser plays the spoken answer
```

The backend (`backend/main.py`, FastAPI) is the only thing that talks to
Sarvam — the API key never reaches the browser. It also serves the static
frontend, so there's just one server to run.

## Setup

1. Put your Sarvam API key in `.env` at the project root:
   ```
   SARVAM_API_KEY=your_key_here
   ```
   `.env` is git-ignored. Never commit it or paste it in chat/screenshots.

2. Install backend dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. Run the server:
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```

4. Open http://localhost:8000 in a browser, allow microphone access, and tap
   the mic button.

## Files

- `data.md` — the fictional policy the assistant answers from.
- `backend/main.py` — FastAPI app: STT → chat → TTS pipeline.
- `frontend/` — large-button, high-contrast UI for elderly users, with an
  English/Hindi/Tamil/Telugu language selector and a visible transcript.

## Notes

- If a real Sarvam API key was ever shared in plaintext (chat, a doc, a
  screenshot), rotate it in the Sarvam dashboard and put the new one in
  `.env` — treat any previously shared key as compromised.
- This demo calls the Sarvam speech/chat APIs directly rather than the
  separate hosted Voice Agents product, so no MCP server needs to run at
  request time. The Sarvam MCP server (`uvx sarvam-mcp`) is only useful if
  you want an AI coding assistant like Claude Code to call Sarvam tools
  while you develop — it's not part of this app's runtime.
