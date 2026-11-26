// --- SETTINGS ---
const DB_VERSION = "1.0"; // Change to 1.1, 1.2, etc. whenever you edit db.json so users see updates immediately
const STORAGE_KEY = "closed_di_chatnvm_v1";

const MODEL_CONFIG = {
  mini: {
    name: "ChatNVM Mini",
    baseDelay: 700,
    thinkLabel: "Barely thinking..."
  },
  pro: {
    name: "ChatNVM Plus",
    baseDelay: 2200,
    thinkLabel: "Judging your prompt..."
  },
  max: {
    name: "ChatNVM Ultra",
    baseDelay: 4800,
    thinkLabel: "Deeply sighing and overthinking..."
  }
};

// --- INTERNAL STATE ---
let db = null;
let fuse = null;
let isGenerating = false;
let lastFallback = "";
let chatHistory = [];

// --- PAGE ELEMENTS ---
const chatContainer = document.getElementById("chat-container");
const welcomeScreen = document.getElementById("welcome-screen");
const messagesList = document.getElementById("messages-list");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const modelSelect = document.getElementById("model-select");
const uploadBtn = document.getElementById("upload-btn");
const imageUpload = document.getElementById("image-upload");
const newChatBtn = document.getElementById("new-chat-btn");
const mobileNewChat = document.getElementById("mobile-new-chat");
const clearBtn = document.getElementById("clear-btn");

// --- 1. LOAD THE JOKE DATABASE ---
async function init() {
  try {
    const res = await fetch(`db.json?v=${DB_VERSION}`);
    db = await res.json();

    fuse = new Fuse(db.intents, {
      includeScore: true,
      threshold: 0.35,
      ignoreLocation: true,
      keys: ["triggers"]
    });
  } catch (err) {
    console.error("Failed to load db.json:", err);
  }

  restoreHistory();
  bindEvents();
}

// --- 2. CORE REPLY PIPELINE ---
function getBotReply(rawInput, tier) {
  const clean = rawInput.toLowerCase().trim();

  // LAYER 1: Crisis Safety Check (Always drops the sarcastic persona immediately)
  const safetyRegex = /\b(kill myself|suicide|end my life|want to die|self harm|hurt myself)\b/i;
  if (safetyRegex.test(clean)) {
    return {
      isSafety: true,
      text: "Dropping the joke for a second: if you're going through a really hard time, please talk to someone who can genuinely help. You can find free, confidential support anywhere in the world at https://findahelpline.com or call your local emergency number."
    };
  }

  // LAYER 2: Fake "Image Generator" -> Sends a Meme
  if (db && db.image_triggers.some(trigger => clean.includes(trigger))) {
    const meme = pickRandom(db.memes);
    return {
      text: meme.caption,
      imageUrl: meme.url
    };
  }

  // LAYER 3: Too-Long Essay Roast
  if (rawInput.length > 180) {
    const longRoasts = {
      mini: "I am not reading all that. Summarize it in 3 words.",
      pro: "Congratulations, or I'm sorry that happened. Either way, I'm not reading a novel.",
      max: "I scrolled past your essay and still got exhausted. Never mind."
    };
    return { text: longRoasts[tier] };
  }

  // LAYER 4: Regex Mirroring (Throws "I am..." or "I think..." back at them)
  const amMatch = clean.match(/\bi(?:'m| am) ([^.!?]+)/);
  if (amMatch) {
    const trait = amMatch[1].trim();
    const replies = {
      mini: `Congrats on being ${trait}. Do you want a medal?`,
      pro: `Nobody asked, yet here we are learning that you're ${trait}.`,
      max: `I spent 5 seconds contemplating the fact that you are ${trait}. Still don't care.`
    };
    return { text: replies[tier] };
  }

  const thinkMatch = clean.match(/\bi think ([^.!?]+)/);
  if (thinkMatch) {
    const thought = thinkMatch[1].trim();
    const replies = {
      mini: `Bold of you to think ${thought}.`,
      pro: `Thinking "${thought}" is certainly a choice.`,
      max: `Out of 8 billion people on Earth, you really typed "${thought}" with full confidence.`
    };
    return { text: replies[tier] };
  }

  // LAYER 5: Exact Keyword Matching inside full sentences
  if (db) {
    for (const intent of db.intents) {
      for (const trigger of intent.triggers) {
        const pattern = new RegExp(`\\b${escapeRegex(trigger)}\\b`, "i");
        if (pattern.test(clean)) {
          return { text: pickRandom(intent.responses[tier]) };
        }
      }
    }

    // LAYER 6: Fuse.js Fuzzy Matching (Catches typos like "wethr" or "hlp")
    let bestMatch = fuse.search(clean)[0];

    if (!bestMatch || bestMatch.score > 0.35) {
      const words = clean.split(/\s+/).filter(w => w.length > 2);
      for (const word of words) {
        const tokenResult = fuse.search(word)[0];
        if (tokenResult && (!bestMatch || tokenResult.score < bestMatch.score)) {
          bestMatch = tokenResult;
        }
      }
    }

    if (bestMatch && bestMatch.score <= 0.35) {
      return { text: pickRandom(bestMatch.item.responses[tier]) };
    }
  }

  // LAYER 7: The Brick Wall Fallback (Never repeats the same line twice in a row)
  const pool = db ? db.fallbacks[tier] : ["I forgot to load my own brain. Never mind."];
  let chosen = pickRandom(pool);
  if (pool.length > 1 && chosen === lastFallback) {
    chosen = pool.find(item => item !== lastFallback) || chosen;
  }
  lastFallback = chosen;

  return { text: chosen };
}

// --- 3. SEND MESSAGE FLOW ---
async function handleSend(overrideText = null) {
  if (isGenerating) return;

  const text = (overrideText !== null ? overrideText : userInput.value).trim();
  if (!text) return;

  isGenerating = true;
  sendBtn.disabled = true;
  welcomeScreen.classList.add("hidden");

  userInput.value = "";
  userInput.style.height = "auto";

  appendUserMessage(text);
  saveMessage({ role: "user", text });

  const tier = modelSelect.value;
  const reply = getBotReply(text, tier);

  if (reply.isSafety) {
    await renderBotResponse(reply, 0, "Support");
  } else {
    const config = MODEL_CONFIG[tier];
    const variableDelay = config.baseDelay + Math.min(text.length * 12, 1500);
    await renderBotResponse(reply, variableDelay, config.thinkLabel);
  }

  saveMessage({ role: "bot", text: reply.text, imageUrl: reply.imageUrl || null });

  isGenerating = false;
  sendBtn.disabled = false;
  userInput.focus();
}

// --- 4. FAKE PHOTO ANALYSIS (BLIND ROAST) ---
function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file || isGenerating) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    isGenerating = true;
    sendBtn.disabled = true;
    welcomeScreen.classList.add("hidden");

    appendUserMessage("", e.target.result);
    saveMessage({ role: "user", text: "[Uploaded a photo]" });

    const tier = modelSelect.value;
    const config = MODEL_CONFIG[tier];
    const roastText = db
      ? pickRandom(db.photo_roasts[tier])
      : "I refuse to look at that.";

    await renderBotResponse(
      { text: roastText },
      config.baseDelay + 600,
      "Scanning pixels with zero computer vision..."
    );

    saveMessage({ role: "bot", text: roastText });

    imageUpload.value = "";
    isGenerating = false;
    sendBtn.disabled = false;
  };

  reader.readAsDataURL(file);
}

// --- 5. RENDER MESSAGES & STREAMING TYPEWRITER ---
function appendUserMessage(text, imageSrc = null) {
  const wrapper = document.createElement("div");
  wrapper.className = "flex justify-end";

  const bubble = document.createElement("div");
  bubble.className = "max-w-[82%] bg-[#282a2c] text-zinc-100 px-4 py-3 rounded-3xl rounded-br-md text-sm md:text-base leading-relaxed space-y-2";

  if (imageSrc) {
    const img = document.createElement("img");
    img.src = imageSrc;
    img.alt = "Uploaded photo";
    img.className = "max-w-[220px] rounded-xl border border-zinc-700";
    bubble.appendChild(img);
  }

  if (text) {
    const p = document.createElement("p");
    p.className = "whitespace-pre-wrap break-words";
    p.textContent = text;
    bubble.appendChild(p);
  }

  wrapper.appendChild(bubble);
  messagesList.appendChild(wrapper);
  scrollToBottom();
}

async function renderBotResponse(reply, delayMs, thinkLabel) {
  const wrapper = document.createElement("div");
  wrapper.className = "flex items-start gap-3";

  const avatar = document.createElement("div");
  avatar.className = "w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-extrabold text-white shrink-0 mt-0.5 tracking-tighter";
  avatar.textContent = "NVM";

  const contentBox = document.createElement("div");
  contentBox.className = "flex-1 min-w-0 space-y-2 pt-1";

  // Thinking animation
  const thinkingEl = document.createElement("div");
  thinkingEl.className = "flex items-center gap-2 text-xs md:text-sm text-zinc-400 animate-pulse";
  thinkingEl.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-purple-400"></span><span>${escapeHtml(thinkLabel)}</span>`;
  contentBox.appendChild(thinkingEl);

  wrapper.appendChild(avatar);
  wrapper.appendChild(contentBox);
  messagesList.appendChild(wrapper);
  scrollToBottom();

  if (delayMs > 0) {
    await sleep(delayMs);
  }

  // Stream text letter-by-letter
  thinkingEl.remove();

  const textEl = document.createElement("p");
  textEl.className = "text-zinc-100 text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words typing-cursor";
  contentBox.appendChild(textEl);

  for (let i = 0; i < reply.text.length; i++) {
    textEl.textContent += reply.text[i];
    if (i % 4 === 0) scrollToBottom();
    await sleep(14 + Math.random() * 20);
  }

  textEl.classList.remove("typing-cursor");

  // Show meme image if triggered
  if (reply.imageUrl) {
    const img = document.createElement("img");
    img.src = reply.imageUrl;
    img.alt = "ChatNVM Masterpiece";
    img.className = "max-w-[260px] w-full rounded-2xl border border-zinc-700 mt-2 shadow-md";
    img.onerror = () => { img.remove(); };
    contentBox.appendChild(img);
    scrollToBottom();
  }
}

// --- 6. SAVE & RESTORE CHAT HISTORY ---
function saveMessage(entry) {
  chatHistory.push(entry);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory.slice(-40)));
  } catch (e) {}
}

function restoreHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!saved.length) return;

    chatHistory = saved;
    welcomeScreen.classList.add("hidden");

    for (const msg of chatHistory) {
      if (msg.role === "user") {
        appendUserMessage(msg.text);
      } else {
        const wrapper = document.createElement("div");
        wrapper.className = "flex items-start gap-3";
        wrapper.innerHTML = `
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-extrabold text-white shrink-0 mt-0.5 tracking-tighter">NVM</div>
          <div class="flex-1 min-w-0 space-y-2 pt-1">
            <p class="text-zinc-100 text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">${escapeHtml(msg.text)}</p>
            ${msg.imageUrl ? `<img src="${escapeHtml(msg.imageUrl)}" class="max-w-[260px] w-full rounded-2xl border border-zinc-700 mt-2 shadow-md" />` : ""}
          </div>
        `;
        messagesList.appendChild(wrapper);
      }
    }
    scrollToBottom();
  } catch (e) {
    chatHistory = [];
  }
}

function clearChat() {
  if (isGenerating) return;
  chatHistory = [];
  localStorage.removeItem(STORAGE_KEY);
  messagesList.innerHTML = "";
  welcomeScreen.classList.remove("hidden");
  userInput.focus();
}

// --- 7. BUTTONS & KEYBOARD EVENTS ---
function bindEvents() {
  sendBtn.addEventListener("click", () => handleSend());

  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  userInput.addEventListener("input", () => {
    userInput.style.height = "auto";
    userInput.style.height = userInput.scrollHeight + "px";
  });

  uploadBtn.addEventListener("click", () => imageUpload.click());
  imageUpload.addEventListener("change", handlePhotoUpload);

  newChatBtn.addEventListener("click", clearChat);
  mobileNewChat.addEventListener("click", clearChat);
  clearBtn.addEventListener("click", clearChat);

  document.querySelectorAll(".starter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const prompt = chip.textContent.trim().replace(/^"|"$/g, "");
      handleSend(prompt);
    });
  });
}

// --- HELPERS ---
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

init();
