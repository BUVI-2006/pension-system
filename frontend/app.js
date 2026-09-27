const micBtn = document.getElementById("micBtn");
const statusEl = document.getElementById("status");
const statusDot = document.getElementById("statusDot");
const repeatBtn = document.getElementById("repeatBtn");
const player = document.getElementById("player");
const userLine = document.getElementById("userLine");
const assistantLine = document.getElementById("assistantLine");
const langRow = document.getElementById("langRow");

let mediaRecorder = null;
let chunks = [];
let recording = false;
let currentLang = "en-IN";

const DOT_COLORS = {
  idle: "#34d399",
  listening: "#ff5d6c",
  thinking: "#ff7a59",
};

function setStatus(text, mode) {
  statusEl.textContent = text;
  micBtn.classList.remove("listening", "thinking");
  statusDot.style.background = DOT_COLORS[mode || "idle"];
  if (mode) micBtn.classList.add(mode);
}

langRow.addEventListener("click", (e) => {
  const btn = e.target.closest(".lang-pill");
  if (!btn) return;
  document.querySelectorAll(".lang-pill").forEach((p) => p.classList.remove("active"));
  btn.classList.add("active");
  currentLang = btn.dataset.lang;
});

async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  chunks = [];
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
  mediaRecorder.onstop = () => {
    stream.getTracks().forEach((t) => t.stop());
    handleRecordingStop();
  };
  mediaRecorder.start();
  recording = true;
  setStatus("Listening... tap again to stop.", "listening");
}

function stopRecording() {
  if (mediaRecorder && recording) {
    mediaRecorder.stop();
    recording = false;
  }
}

async function handleRecordingStop() {
  setStatus("Thinking...", "thinking");
  const blob = new Blob(chunks, { type: "audio/webm" });
  const formData = new FormData();
  formData.append("file", blob, "speech.webm");
  formData.append("language_code", currentLang);

  try {
    const res = await fetch("/api/voice", { method: "POST", body: formData });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Something went wrong.");
    }
    const data = await res.json();

    userLine.hidden = false;
    userLine.textContent = "You: " + data.transcript;
    assistantLine.hidden = false;
    assistantLine.textContent = "Assistant: " + data.reply;

    playAudio(data.audio_base64);
    repeatBtn.hidden = false;
    setStatus("Speaking...", null);
    player.onended = () => setStatus("Tap the microphone to ask another question.", null);
  } catch (e) {
    setStatus(e.message || "Could not process that. Please try again.", null);
  }
}

function playAudio(base64Audio) {
  player.src = "data:audio/wav;base64," + base64Audio;
  player.hidden = false;
  player.play();
}

micBtn.addEventListener("click", () => {
  if (!recording) {
    startRecording().catch(() => setStatus("Microphone access is needed to speak.", null));
  } else {
    stopRecording();
  }
});

repeatBtn.addEventListener("click", () => {
  player.currentTime = 0;
  player.play();
});
