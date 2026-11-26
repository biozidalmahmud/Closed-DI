// --- SETTINGS ---
const DB_VERSION = "2.0"; // Bump to 2.1, 2.2 whenever you edit db.json
const STORAGE_KEY = "closed_di_chatnvm_v2";
const LANG_STORAGE_KEY = "closed_di_lang_v2";

const MODEL_DELAYS = {
  mini: 700,
  pro: 2200,
  max: 4800
};

// --- INTERNAL STATE ---
let db = null;
let fuses = {};
let isGenerating = false;
let lastFallback = "";
let chatHistory = [];

// --- PAGE ELEMENTS ---
const chatContainer = document.getElementById("chat-container");
const welcomeScreen = document.getElementById("welcome-screen");
const welcomeTitle = document.getElementById("welcome-title");
const welcomeSubtitle = document.getElementById("welcome-subtitle");
const starterChipsContainer = document.getElementById("starter-chips-container");
const footerNote = document.getElementById("footer-note");
const messagesList = document.getElementById("messages-list");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const modelSelect = document.getElementById("model-select");
const langSelect = document.getElementById("lang-select");
const uploadBtn = document.getElementById("upload-btn");
const imageUpload = document.getElementById("image-upload");
const newChatBtn = document.getElementById("new-chat-btn");
const mobileNewChat = document.getElementById("mobile-new-chat");
const clearBtn = document.getElementById("clear-btn");

// --- 1. INITIALIZE & LOAD DATABASE ---
async function init() {
  const savedLang = localStorage.getItem(LANG_STORAGE_KEY);
  if (savedLang && ["en", "banglish", "bn"].includes(savedLang)) {
    langSelect.value = savedLang;
  }

  try {
    const res = await fetch(`db.json?v=${DB_VERSION}`);
    db = await res.json();

    // Build a Fuse.js typo matcher for each language
    for (const langKey of Object.keys(db.languages)) {
      fuses[langKey] = new Fuse(db.languages[langKey].intents, {
        includeScore: true,
        threshold: 0.35,
        ignoreLocation: true,
        keys: ["triggers"]
      });
    }

    applyLanguageUI(langSelect.value);
  } catch (err) {
    console.error("Failed to load db.json:", err);
  }

  restoreHistory();
  bindEvents();
}

// --- 2. UPDATE SCREEN TEXT WHEN LANGUAGE CHANGES ---
function applyLanguageUI(lang) {
  if (!db || !db.ui[lang]) return;
  const ui = db.ui[lang];

  welcomeTitle.innerHTML = `<span class="bg-gradient-to-r from-blue-400 via-purple-400 to-rose-400 bg-clip-text text-transparent">${escapeHtml(ui.title)}</span>`;
  welcomeSubtitle.textContent = ui.subtitle;
  userInput.placeholder = ui.placeholder;
  footerNote.textContent = ui.footer;

  starterChipsContainer.innerHTML = "";
  for (const prompt of ui.starters) {
    const btn = document.createElement("button");
    btn.className = "starter-chip p-3.5 rounded-2xl bg-[#1e1f20] hover:bg-zinc-800 border border-zinc-800 text-sm text-zinc-300 transition";
    btn.textContent = `"${prompt}"`;
    starterChipsContainer.appendChild(btn);
  }
}

// --- 3. SMART LANGUAGE DETECTION ---
function detectReplyLanguage(text, selectedLang) {
  // If user typed in Bangla Unicode script, always reply in Bangla
  if (/[\u0980-\u09FF]/.test(text)) {
    return "bn";
  }
  return selectedLang;
}

// --- 4. CORE REPLY PIPELINE ---
function getBotReply(rawInput, tier, selectedLang) {
  const clean = rawInput.toLowerCase().trim();
  const replyLang = detectReplyLanguage(rawInput, selectedLang);

  // LAYER 1: Crisis Safety Intercept (Runs first across all 3 languages)
  const safetyRegex = /(kill myself|suicide|end my life|want to die|self harm|hurt myself|morte chai|nijeke shesh|atmahatya|আত্মহত্যা|মরতে চাই|নিজেকে শেষ)/i;
  if (safetyRegex.test(clean)) {
    const safetyMessages = {
      en: "Dropping the joke for a second: if you're going through a really hard time, please reach out to someone who can genuinely help. Free, confidential support is available at https://findahelpline.com or your local emergency number.",
      banglish: "Bhai, ektu serious kotha: apni jodi khub kosto ba mental pressure er moddhe thaken, please karor sathe kotha bolun. Bangladesh e Kaan Pete Roi (01779-554391) ba https://findahelpline.com e free, confidential help paben.",
      bn: "একটু সিরিয়াস কথা: আপনি যদি খুব কষ্ট বা মানসিক চাপের মধ্যে থাকেন, দয়া করে এমন কারো সাথে কথা বলুন যিনি সত্যিই সাহায্য করতে পারবেন। ফ্রি ও গোপনীয় সহায়তার জন্য কান পেতে রই (01779-554391) বা https://findahelpline.com-এ যোগাযোগ করতে পারেন।"
    };
    return { isSafety: true, lang: replyLang, text: safetyMessages[replyLang] };
  }

  if (!db) {
    return { lang: replyLang, text: "Brain file missing. Never mind." };
  }

  const langPack = db.languages[replyLang];

  // LAYER 2: Fake "Image Generator" -> Sends a Meme (checks active language + all languages)
  const allLangKeys = [replyLang, ...Object.keys(db.languages).filter(k => k !== replyLang)];
  for (const k of allLangKeys) {
    if (db.languages[k].image_triggers.some(t => matchesTrigger(clean, t))) {
      const targetPack = db.languages[replyLang];
      const meme = pickRandom(targetPack.memes);
      return { lang: replyLang, text: meme.caption, imageUrl: meme.url };
    }
  }

  // LAYER 3: Too-Long Essay Roast
  if (rawInput.length > 180) {
    return { lang: replyLang, text: langPack.long_roasts[tier] };
  }

  // LAYER 4: Exact Keyword Match in Active Language FIRST
  const exactMatch = findExactIntent(clean, langPack.intents);
  if (exactMatch) {
    return { lang: replyLang, text: pickRandom(exactMatch.responses[tier]) };
  }

  // LAYER 5: Cross-Language Exact Match (e.g., typed Banglish while dropdown was on EN)
  for (const otherLang of Object.keys(db.languages)) {
    if (otherLang === replyLang) continue;
    const crossMatch = findExactIntent(clean, db.languages[otherLang].intents);
    if (crossMatch) {
      // If they typed Banglish while on EN, reply in Banglish! Otherwise reply in their chosen language.
      const finalLang = (selectedLang === "en" && otherLang === "banglish") ? "banglish" : replyLang;
      const finalIntent = db.languages[finalLang].intents.find(i => i.category === crossMatch.category) || crossMatch;
      return { lang: finalLang, text: pickRandom(finalIntent.responses[tier]) };
    }
  }

  // LAYER 6: Regex Reflections (Throws "I am..." / "Ami khub..." back at them)
  const reflection = checkReflections(clean, tier, replyLang);
  if (reflection) {
    return { lang: replyLang, text: reflection };
  }

  // LAYER 7: Fuse.js Fuzzy Matching (Catches typos like "wethr", "bristy", "hlp")
  const fuzzyHit = findFuzzyIntent(clean, replyLang);
  if (fuzzyHit) {
    return { lang: replyLang, text: pickRandom(fuzzyHit.responses[tier]) };
  }

  // LAYER 8: The Brick Wall Fallback (Never repeats the same line twice in a row)
  const pool = langPack.fallbacks[tier];
  let chosen = pickRandom(pool);
  if (pool.length > 1 && chosen === lastFallback) {
    chosen = pool.find(item => item !== lastFallback) || chosen;
  }
  lastFallback = chosen;

  return { lang: replyLang, text: chosen };
}

function findExactIntent(clean, intents) {
  for (const intent of intents) {
    for (const trigger of intent.triggers) {
      if (matchesTrigger(clean, trigger)) {
        return intent;
      }
    }
  }
  return null;
}

function findFuzzyIntent(clean, lang) {
  const fuse = fuses[lang];
  if (!fuse) return null;

  let best = fuse.search(clean)[0];
  if (!best || best.score > 0.32) {
    const words = clean.split(/\s+/).filter(w => w.length > 2);
    for (const word of words) {
      const hit = fuse.search(word)[0];
      if (hit && (!best || hit.score < best.score)) {
        best = hit;
      }
    }
  }

  return (best && best.score <= 0.32) ? best.item : null;
}

function checkReflections(clean, tier, lang) {
  if (lang === "en") {
    const amMatch = clean.match(/\bi(?:'m| am) ([^.!?]+)/);
    if (amMatch) {
      const trait = amMatch[1].trim();
      const map = {
        mini: `Congrats on being ${trait}. Do you want a medal?`,
        pro: `Nobody asked, yet here we are learning that you're ${trait}.`,
        max: `I spent 5 seconds contemplating the fact that you are ${trait}. Still don't care.`
      };
      return map[tier];
    }
    const thinkMatch = clean.match(/\bi think ([^.!?]+)/);
    if (thinkMatch) {
      const thought = thinkMatch[1].trim();
      const map = {
        mini: `Bold of you to think ${thought}.`,
        pro: `Thinking "${thought}" is certainly a choice.`,
        max: `Out of 8 billion people, you really typed "${thought}" with full confidence.`
      };
      return map[tier];
    }
  }

  if (lang === "banglish") {
    const amiMatch = clean.match(/\bami (?:khub |onek )?([^.!?]+)/);
    if (amiMatch) {
      const trait = amiMatch[1].trim();
      const map = {
        mini: `Apni "${trait}"—etate amar ki? Trophy lagbe?`,
        pro: `Keu jiggesh kore nai, tarporo janlam apni ${trait}. Darun.`,
        max: `5 second chinta korlam apni je ${trait}. Kono lav holo na.`
      };
      return map[tier];
    }
  }

  if (lang === "bn") {
    const bnMatch = clean.match(/আমি (?:খুব |অনেক )?([^।.!?]+)/);
    if (bnMatch) {
      const trait = bnMatch[1].trim();
      const map = {
        mini: `আপনি "${trait}"—তাতে আমার কী? পদক লাগবে?`,
        pro: `কেউ জানতে চায়নি, তবুও জানলাম আপনি ${trait}। অসাধারণ।`,
        max: `৫ সেকেন্ড ধরে ভাবলাম আপনি যে ${trait}। কোনো আগ্রহ জাগল না।`
      };
      return map[tier];
    }
  }

  return null;
}

// --- 5. SEND MESSAGE FLOW ---
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
  const selectedLang = langSelect.value;
  const reply = getBotReply(text, tier, selectedLang);

  if (reply.isSafety) {
    await renderBotResponse(reply, 0, "Support");
  } else {
    const baseDelay = MODEL_DELAYS[tier] || 1500;
    const variableDelay = baseDelay + Math.min(text.length * 12, 1500);
    const thinkLabel = db.ui[reply.lang].thinking[tier];
    await renderBotResponse(reply, variableDelay, thinkLabel);
  }

  saveMessage({ role: "bot", text: reply.text, imageUrl: reply.imageUrl || null });

  isGenerating = false;
  sendBtn.disabled = false;
  userInput.focus();
}

// --- 6. FAKE PHOTO ANALYSIS (BLIND ROAST) ---
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
    const lang = langSelect.value;
    const roastText = db
      ? pickRandom(db.languages[lang].photo_roasts[tier])
      : "I refuse to look at that.";
    const scanLabel = db ? db.ui[lang].photo_thinking : "Scanning pixels...";

    await renderBotResponse(
      { text: roastText },
      (MODEL_DELAYS[tier] || 1500) + 600,
      scanLabel
    );

    saveMessage({ role: "bot", text: roastText });

    imageUpload.value = "";
    isGenerating = false;
    sendBtn.disabled = false;
  };

  reader.readAsDataURL(file);
}

// --- 7. RENDER MESSAGES & STREAMING TYPEWRITER ---
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

  thinkingEl.remove();

  const textEl = document.createElement("p");
  textEl.className = "text-zinc-100 text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words typing-cursor";
  contentBox.appendChild(textEl);

  // Use Array.from so Bangla characters stream cleanly without breaking symbols
  const chars = Array.from(reply.text);
  for (let i = 0; i < chars.length; i++) {
    textEl.textContent += chars[i];
    if (i % 4 === 0) scrollToBottom();
    await sleep(14 + Math.random() * 20);
  }

  textEl.classList.remove("typing-cursor");

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

// --- 8. SAVE & RESTORE CHAT HISTORY ---
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

// --- 9. BUTTONS & EVENTS ---
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

  langSelect.addEventListener("change", () => {
    localStorage.setItem(LANG_STORAGE_KEY, langSelect.value);
    applyLanguageUI(langSelect.value);
  });

  uploadBtn.addEventListener("click", () => imageUpload.click());
  imageUpload.addEventListener("change", handlePhotoUpload);

  newChatBtn.addEventListener("click", clearChat);
  mobileNewChat.addEventListener("click", clearChat);
  clearBtn.addEventListener("click", clearChat);

  starterChipsContainer.addEventListener("click", (e) => {
    const chip = e.target.closest(".starter-chip");
    if (!chip) return;
    const prompt = chip.textContent.trim().replace(/^"|"$/g, "");
    handleSend(prompt);
  });
}

// --- HELPERS ---
// Handles both English/Banglish word boundaries AND Bangla Unicode properly
function matchesTrigger(text, trigger) {
  const isAscii = /^[\x00-\x7F]+$/.test(trigger);
  if (isAscii) {
    return new RegExp(`\\b${escapeRegex(trigger)}\\b`, "i").test(text);
  }
  return text.includes(trigger);
}

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
