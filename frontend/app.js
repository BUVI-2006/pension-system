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

const TRANSLATIONS = {
  "en-IN": {
    subtitle: "Your Pension, Explained Out Loud",
    description:
      "This is a voice helper for the Senior Citizen Pension Scheme. Tap the microphone, ask your question the way you would ask a person, and listen to the answer — no forms, no reading required.",
    step1: "Tap & Speak",
    step2: "We Understand",
    step3: "Hear the Answer",
    statusIdle: "Tap the microphone and ask about your pension.",
    statusListening: "Listening... tap again to stop.",
    statusThinking: "Thinking...",
    statusSpeaking: "Speaking...",
    statusDone: "Tap the microphone to ask another question.",
    statusMicError: "Microphone access is needed to speak.",
    statusGenericError: "Could not process that. Please try again.",
    repeat: "Repeat Answer",
    you: "You",
    assistant: "Assistant",
    disclaimer: "Fictional demo pension scheme — for demonstration only.",
  },
  "hi-IN": {
    subtitle: "आपकी पेंशन, आवाज़ में समझाई गई",
    description:
      "यह वरिष्ठ नागरिक पेंशन योजना के लिए एक आवाज़ सहायक है। माइक्रोफ़ोन दबाएँ, अपना सवाल वैसे ही पूछें जैसे किसी व्यक्ति से पूछते हैं, और जवाब सुनें — कोई फ़ॉर्म भरने या पढ़ने की ज़रूरत नहीं।",
    step1: "दबाएँ और बोलें",
    step2: "हम समझते हैं",
    step3: "जवाब सुनें",
    statusIdle: "माइक्रोफ़ोन दबाएँ और अपनी पेंशन के बारे में पूछें।",
    statusListening: "सुन रहे हैं... रोकने के लिए फिर दबाएँ।",
    statusThinking: "सोच रहे हैं...",
    statusSpeaking: "बोल रहे हैं...",
    statusDone: "दूसरा सवाल पूछने के लिए माइक्रोफ़ोन दबाएँ।",
    statusMicError: "बोलने के लिए माइक्रोफ़ोन की अनुमति चाहिए।",
    statusGenericError: "यह प्रोसेस नहीं हो सका। कृपया फिर से प्रयास करें।",
    repeat: "जवाब दोबारा सुनें",
    you: "आप",
    assistant: "सहायक",
    disclaimer: "यह एक काल्पनिक प्रदर्शन पेंशन योजना है — केवल प्रदर्शन के लिए।",
  },
  "ta-IN": {
    subtitle: "உங்கள் ஓய்வூதியம், குரலில் விளக்கப்படுகிறது",
    description:
      "இது மூத்த குடிமக்கள் ஓய்வூதியத் திட்டத்திற்கான குரல் உதவியாளர். மைக்ரோஃபோனைத் தட்டவும், ஒரு நபரிடம் கேட்பது போல் உங்கள் கேள்வியைக் கேளுங்கள், பதிலைக் கேளுங்கள் — படிவங்கள் நிரப்ப வேண்டாம், படிக்க வேண்டாம்.",
    step1: "தட்டி பேசுங்கள்",
    step2: "நாங்கள் புரிந்துகொள்கிறோம்",
    step3: "பதிலைக் கேளுங்கள்",
    statusIdle: "மைக்ரோஃபோனைத் தட்டி உங்கள் ஓய்வூதியம் பற்றி கேளுங்கள்.",
    statusListening: "கேட்கிறோம்... நிறுத்த மீண்டும் தட்டவும்.",
    statusThinking: "யோசிக்கிறோம்...",
    statusSpeaking: "பேசுகிறோம்...",
    statusDone: "மேலும் ஒரு கேள்வி கேட்க மைக்ரோஃபோனைத் தட்டவும்.",
    statusMicError: "பேச மைக்ரோஃபோன் அனுமதி தேவை.",
    statusGenericError: "செயல்படுத்த முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
    repeat: "பதிலை மீண்டும் கேளுங்கள்",
    you: "நீங்கள்",
    assistant: "உதவியாளர்",
    disclaimer: "இது ஒரு கற்பனையான டெமோ ஓய்வூதியத் திட்டம் — டெமோவிற்காக மட்டும்.",
  },
  "te-IN": {
    subtitle: "మీ పెన్షన్, స్వరంలో వివరించబడింది",
    description:
      "ఇది సీనియర్ సిటిజన్ పెన్షన్ పథకం కోసం వాయిస్ సహాయకుడు. మైక్రోఫోన్‌ను నొక్కండి, ఒక వ్యక్తిని అడిగినట్లే మీ ప్రశ్న అడగండి, సమాధానం వినండి — ఫారాలు నింపాల్సిన అవసరం లేదు, చదవాల్సిన అవసరం లేదు.",
    step1: "నొక్కి మాట్లాడండి",
    step2: "మేము అర్థం చేసుకుంటాము",
    step3: "సమాధానం వినండి",
    statusIdle: "మైక్రోఫోన్‌ను నొక్కి మీ పెన్షన్ గురించి అడగండి.",
    statusListening: "వింటున్నాము... ఆపడానికి మళ్ళీ నొక్కండి.",
    statusThinking: "ఆలోచిస్తున్నాము...",
    statusSpeaking: "మాట్లాడుతున్నాము...",
    statusDone: "మరో ప్రశ్న అడగడానికి మైక్రోఫోన్‌ను నొక్కండి.",
    statusMicError: "మాట్లాడటానికి మైక్రోఫోన్ అనుమతి అవసరం.",
    statusGenericError: "ప్రాసెస్ చేయలేకపోయాము. దయచేసి మళ్ళీ ప్రయత్నించండి.",
    repeat: "సమాధానం మళ్ళీ వినండి",
    you: "మీరు",
    assistant: "సహాయకుడు",
    disclaimer: "ఇది ఒక కల్పిత డెమో పెన్షన్ పథకం — ప్రదర్శన కోసం మాత్రమే.",
  },
};

let lastStatusKey = "statusIdle";

function t(key) {
  return (TRANSLATIONS[currentLang] || TRANSLATIONS["en-IN"])[key];
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    const value = t(key);
    if (value) el.textContent = value;
  });
  setStatus(t(lastStatusKey), currentMode);
}

let currentMode = null;

function setStatus(text, mode, statusKey) {
  statusEl.textContent = text;
  if (statusKey) lastStatusKey = statusKey;
  currentMode = mode || null;
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
  applyTranslations();
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
  setStatus(t("statusListening"), "listening", "statusListening");
}

function stopRecording() {
  if (mediaRecorder && recording) {
    mediaRecorder.stop();
    recording = false;
  }
}

async function handleRecordingStop() {
  setStatus(t("statusThinking"), "thinking", "statusThinking");
  const blob = new Blob(chunks, { type: "audio/webm" });
  const formData = new FormData();
  formData.append("file", blob, "speech.webm");
  formData.append("language_code", currentLang);

  try {
    const res = await fetch("/api/voice", { method: "POST", body: formData });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || t("statusGenericError"));
    }
    const data = await res.json();

    userLine.hidden = false;
    userLine.textContent = t("you") + ": " + data.transcript;
    assistantLine.hidden = false;
    assistantLine.textContent = t("assistant") + ": " + data.reply;

    playAudio(data.audio_base64);
    repeatBtn.hidden = false;
    setStatus(t("statusSpeaking"), null, "statusSpeaking");
    player.onended = () => setStatus(t("statusDone"), null, "statusDone");
  } catch (e) {
    setStatus(e.message || t("statusGenericError"), null, "statusGenericError");
  }
}

function playAudio(base64Audio) {
  player.src = "data:audio/wav;base64," + base64Audio;
  player.hidden = false;
  player.play();
}

micBtn.addEventListener("click", () => {
  if (!recording) {
    startRecording().catch(() => setStatus(t("statusMicError"), null, "statusMicError"));
  } else {
    stopRecording();
  }
});

repeatBtn.addEventListener("click", () => {
  player.currentTime = 0;
  player.play();
});
