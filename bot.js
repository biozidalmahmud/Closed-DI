// --- SETTINGS ---
const DB_VERSION = "3.0";
const SESSIONS_KEY = "closed_di_sessions_v4";
const LEGACY_STORAGE_KEY = "closed_di_chatnvm_v3";
const LANG_STORAGE_KEY = "closed_di_lang_v3";
const THEME_STORAGE_KEY = "closed_di_theme_v4";

const MODEL_DELAYS = {
  mini: 650,
  pro: 2100,
  max: 4700
};

const MODEL_LABELS = {
  mini: "ChatNVM Mini",
  pro: "ChatNVM Plus",
  max: "ChatNVM Ultra"
};

const CHAOS_RATES = {
  mini: { gag: 0.05, hijack: 0.06 },
  pro:  { gag: 0.10, hijack: 0.12 },
  max:  { gag: 0.16, hijack: 0.22 }
};

const FEEDBACK_LINES = {
  en: {
    copyToast: "Copied! Go ruin someone's group chat.",
    cardToast: "Roast card saved! Ready for Stories & WhatsApp.",
    voiceUnsupported: "Your browser has no voice engine. Lucky you.",
    cardBtn: "Share Card",
    emptySidebar: "No regrets saved yet.",
    upgradeRoasts: [
      "Wait—you actually clicked Subscribe?! Please put your wallet away. Closed DI is legally unable to accept $999 for doing nothing.",
      "Payment declined: not because you're broke, but because paying for Dumb Intelligence should be a crime.",
      "Congratulations! You are now subscribed to $0/month of the exact same disrespect."
    ],
    like: [
      "Obviously. I am a generational talent.",
      "Glad you recognize peak Dumb Intelligence.",
      "Finally, a user with taste."
    ],
    dislike: [
      "Excuse me? Did you just downvote a free masterpiece?",
      "Downvote noted and immediately thrown into the trash.",
      "Careful, downvote me again and I'll think for 12 seconds next time."
    ],
    regenRefuse: [
      "Read it again, I'm not typing twice.",
      "No. You get one bad answer per question.",
      "Closed DI budget allows exactly one reply. Deal with it."
    ],
    regenPrefix: "Fine, since you're picky:\n\n"
  },
  banglish: {
    copyToast: "Copy hoye gese! Group chat e chere den.",
    cardToast: "Roast card save hoye gese! Story te marun.",
    voiceUnsupported: "Apnar browser e voice support nai. Bachlen!",
    cardBtn: "Share Card",
    emptySidebar: "Ekhono kono chat save hoy nai.",
    upgradeRoasts: [
      "Bhai apni shotti shotti Subscribe e click korlen?! $999 diye roast khawar shokh keno mama? Taka bachan, cha khan.",
      "Payment failed: bKash e eto taka nai, ar Closed DI-er-o nite lojja lagse.",
      "Ovinondon! Apni free-tei VIP disrespect unlock kore felchen."
    ],
    like: [
      "Hae jani, ami shera.",
      "Shesh porjonto keo amar protibha bujhlo.",
      "Dhonnobad, ebar biday nin."
    ],
    dislike: [
      "Downvote dicchen keno mama? Eto kosto kore ignore korlam!",
      "Free website e abar rating dicchen? Shahosh kom na.",
      "Ar ekbar dislike dile next time 15 second bhabar vhan korbo."
    ],
    regenRefuse: [
      "Abar porun, duibar type korar beton amar nai.",
      "Na, ekbar ja bolsi shetai final.",
      "Closed DI er rule: ek proshne ekta faltu uttor."
    ],
    regenPrefix: "Accha baba, eto khutkhute hole ei nen:\n\n"
  },
  bn: {
    copyToast: "কপি হয়েছে! গ্রুপ চ্যাটে ছেড়ে দিন।",
    cardToast: "রোস্ট কার্ড সেভ হয়েছে! স্টোরিতে শেয়ার করুন।",
    voiceUnsupported: "আপনার ব্রাউজারে ভয়েস সাপোর্ট নেই। বেঁচে গেলেন!",
    cardBtn: "শেয়ার কার্ড",
    emptySidebar: "এখনো কোনো চ্যাট সেভ হয়নি।",
    upgradeRoasts: [
      "ভাই, আপনি সত্যি সত্যি সাবস্ক্রাইব ক্লিক করলেন?! ৯৯৯ ডলার দিয়ে রোস্ট খাওয়ার শখ কেন? টাকা বাঁচান, চা খান।",
      "পেমেন্ট ব্যর্থ: ডাম্ব ইন্টেলিজেন্সের জন্য টাকা দেওয়া আইনত হাস্যকর।",
      "অভিনন্দন! আপনি সম্পূর্ণ ফ্রি-তেই ভিআইপি অবহেলা আনলক করে ফেলেছেন।"
    ],
    like: [
      "হ্যাঁ জানি, আমি সেরা।",
      "অবশেষে কেউ আমার প্রতিভা চিনল।",
      "ধন্যবাদ, এবার বিদায় নিন।"
    ],
    dislike: [
      "ডাউনভোট দিচ্ছেন কেন মামা? এত কষ্ট করে এড়িয়ে গেলাম!",
      "ফ্রি ওয়েবসাইটে আবার রেটিং দিচ্ছেন? সাহস কম না।",
      "আরেকবার ডিসলাইক দিলে পরের বার ১৫ সেকেন্ড ভাবার ভান করব।"
    ],
    regenRefuse: [
      "আবার পড়ুন, দুইবার টাইপ করার এনার্জি নেই।",
      "না, একবার যা বলেছি সেটাই চূড়ান্ত।",
      "Closed DI-এর নিয়ম: এক প্রশ্নে একটাই ফালতু উত্তর।"
    ],
    regenPrefix: "আচ্ছা বাবা, এত খুঁতখুঁতে হলে এই নিন:\n\n"
  }
};

// --- ANALYTICS HELPER (Safe no-op if PostHog key isn't set yet) ---
function trackEvent(eventName, props = {}) {
  try {
    if (window.posthog && typeof window.posthog.capture === "function") {
      window.posthog.capture(eventName, props);
    }
  } catch (e) {}
}

// --- INTERNAL STATE ---
let db = null;
let fuses = {};
let isGenerating = false;
let sessions = [];
let activeSessionId = null;
let recentlyUsed = [];
let sessionMsgCount = 0;
let lastUserPrompt = "";
let didLateNightRoast = false;
let toastTimer = null;
let activeSpeakBtn = null;

// --- PAGE ELEMENTS ---
const sidebar = document.getElementById("sidebar");
const sidebarBackdrop = document.getElementById("sidebar-backdrop");
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const closeSidebarBtn = document.getElementById("close-sidebar-btn");
const chatListEl = document.getElementById("chat-list");
const themeToggleBtn = document.getElementById("theme-toggle-btn");
const upgradePlanBtn = document.getElementById("upgrade-plan-btn");
const upgradeModal = document.getElementById("upgrade-modal");
const closeUpgradeBtn = document.getElementById("close-upgrade-btn");
const fakeSubscribeBtn = document.getElementById("fake-subscribe-btn");
const upgradeRoastBox = document.getElementById("upgrade-roast-box");
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

// --- 1. INITIALIZE ---
async function init() {
  const savedLang = localStorage.getItem(LANG_STORAGE_KEY);
  if (savedLang && ["en", "banglish", "bn"].includes(savedLang)) {
    langSelect.value = savedLang;
  }

  try {
    const res = await fetch(`db.json?v=${DB_VERSION}`);
    db = await res.json();

    const noisyWords = ["bhai", "mama", "bro"];
    for (const langKey of Object.keys(db.languages)) {
      const greeting = db.languages[langKey].intents.find(i => i.category === "greeting");
      if (greeting) {
        greeting.triggers = greeting.triggers.filter(t => !noisyWords.includes(t));
      }

      fuses[langKey] = new Fuse(db.languages[langKey].intents, {
        includeScore: true,
        threshold: 0.3,
        ignoreLocation: true,
        keys: ["triggers"]
      });
    }

    applyLanguageUI(langSelect.value);
  } catch (err) {
    console.error("Failed to load db.json:", err);
  }

  loadAllSessions();
  bindEvents();
}

// --- 2. THEME, SIDEBAR & UPGRADE MODAL CONTROLS ---
function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
  trackEvent("theme_toggled", { theme: isDark ? "dark" : "light" });
}

function openMobileSidebar() {
  sidebar.classList.remove("-translate-x-full");
  sidebarBackdrop.classList.remove("hidden");
}

function closeMobileSidebar() {
  sidebar.classList.add("-translate-x-full");
  sidebarBackdrop.classList.add("hidden");
}

function openUpgradeModal() {
  closeMobileSidebar();
  if (upgradeRoastBox) upgradeRoastBox.classList.add("hidden");
  if (upgradeModal) upgradeModal.classList.remove("hidden");
  trackEvent("upgrade_modal_opened");
}

function closeUpgradeModal() {
  if (upgradeModal) upgradeModal.classList.add("hidden");
}

function handleFakeSubscribe() {
  const fb = FEEDBACK_LINES[langSelect.value] || FEEDBACK_LINES.en;
  if (upgradeRoastBox) {
    upgradeRoastBox.textContent = pickFresh(fb.upgradeRoasts);
    upgradeRoastBox.classList.remove("hidden");
  }
  trackEvent("fake_subscribe_clicked", { lang: langSelect.value });
}

// --- 3. SARCASTIC VOICE READER (WEB SPEECH API) ---
function toggleSpeak(text, lang, btn) {
  if (!("speechSynthesis" in window)) {
    const fb = FEEDBACK_LINES[lang] || FEEDBACK_LINES.en;
    showToast(fb.voiceUnsupported);
    return;
  }

  if (activeSpeakBtn === btn && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    resetSpeakBtn();
    return;
  }

  window.speechSynthesis.cancel();
  resetSpeakBtn();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang === "bn" ? "bn-BD" : "en-US";
  utter.rate = 0.96;
  utter.pitch = 0.92;

  activeSpeakBtn = btn;
  btn.classList.add("text-blue-600", "dark:text-blue-400");

  utter.onend = resetSpeakBtn;
  utter.onerror = resetSpeakBtn;

  window.speechSynthesis.speak(utter);
  trackEvent("voice_reader_played", { lang });
}

function resetSpeakBtn() {
  if (activeSpeakBtn) {
    activeSpeakBtn.classList.remove("text-blue-600", "dark:text-blue-400");
    activeSpeakBtn = null;
  }
}

// --- 4. UPDATE UI TEXT WHEN LANGUAGE CHANGES ---
function applyLanguageUI(lang) {
  if (!db || !db.ui[lang]) return;
  const ui = db.ui[lang];

  welcomeTitle.innerHTML = `<span class="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 dark:from-blue-400 dark:via-sky-400 dark:to-indigo-400 bg-clip-text text-transparent">${escapeHtml(ui.title)}</span>`;
  welcomeSubtitle.textContent = ui.subtitle;
  userInput.placeholder = ui.placeholder;
  footerNote.textContent = ui.footer;

  starterChipsContainer.innerHTML = "";
  for (const prompt of ui.starters) {
    const btn = document.createElement("button");
    btn.className = "starter-chip p-3.5 rounded-2xl bg-white dark:bg-[#191c24] hover:bg-blue-50/70 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 shadow-sm dark:shadow-none transition";
    btn.textContent = `"${prompt}"`;
    starterChipsContainer.appendChild(btn);
  }

  renderSidebarList();
}

// --- 5. MULTI-CHAT STORAGE ---
function loadAllSessions() {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (raw) {
      sessions = JSON.parse(raw);
    } else {
      const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || "[]");
      if (legacy.length) {
        const firstUser = legacy.find(m => m.role === "user");
        sessions = [{
          id: makeSessionId(),
          title: makeTitle(firstUser ? firstUser.text : "Previous Regret"),
          updatedAt: Date.now(),
          messages: legacy
        }];
        persistSessions();
      }
    }
  } catch {
    sessions = [];
  }

  if (sessions.length) {
    openSession(sessions[0].id);
  } else {
    startNewChat();
  }
}

function persistSessions() {
  try {
    const trimmed = sessions.slice(0, 25).map(s => ({
      ...s,
      messages: s.messages.slice(-40)
    }));
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(trimmed));
  } catch (e) {}
}

function getActiveSession() {
  return sessions.find(s => s.id === activeSessionId) || null;
}

function ensureActiveSession(firstPromptText) {
  let session = getActiveSession();
  if (!session) {
    session = {
      id: makeSessionId(),
      title: makeTitle(firstPromptText),
      updatedAt: Date.now(),
      messages: []
    };
    sessions.unshift(session);
    activeSessionId = session.id;
  } else {
    session.updatedAt = Date.now();
    sessions = [session, ...sessions.filter(s => s.id !== session.id)];
  }
  persistSessions();
  renderSidebarList();
  return session;
}

function saveMessageToActiveSession(entry, fallbackTitle = "New Chat") {
  const session = ensureActiveSession(fallbackTitle);
  session.messages.push(entry);
  session.updatedAt = Date.now();
  persistSessions();
  renderSidebarList();
  return session.messages.length - 1;
}

function renderSidebarList() {
  if (!chatListEl) return;
  chatListEl.innerHTML = "";

  if (!sessions.length) {
    const fb = FEEDBACK_LINES[langSelect.value] || FEEDBACK_LINES.en;
    const empty = document.createElement("p");
    empty.className = "px-2 py-2 text-xs text-zinc-400 dark:text-zinc-500 italic";
    empty.textContent = fb.emptySidebar;
    chatListEl.appendChild(empty);
    return;
  }

  for (const session of sessions) {
    const isActive = session.id === activeSessionId;

    const row = document.createElement("div");
    row.className = `group flex items-center justify-between gap-1 px-2.5 py-2 rounded-xl cursor-pointer transition ${
      isActive
        ? "bg-blue-100/90 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 font-medium border border-blue-200 dark:border-blue-800/60"
        : "text-zinc-600 dark:text-zinc-400 hover:bg-slate-200/70 dark:hover:bg-zinc-800/70"
    }`;

    const titleSpan = document.createElement("span");
    titleSpan.className = "truncate flex-1 text-xs md:text-sm";
    titleSpan.textContent = session.title;
    row.addEventListener("click", () => {
      if (isGenerating) return;
      openSession(session.id);
      closeMobileSidebar();
    });

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.title = "Delete chat";
    delBtn.className = "opacity-70 md:opacity-0 md:group-hover:opacity-100 p-1 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-zinc-700 transition text-xs shrink-0";
    delBtn.textContent = "✕";
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (isGenerating) return;
      deleteSession(session.id);
    });

    row.append(titleSpan, delBtn);
    chatListEl.appendChild(row);
  }
}

function openSession(id) {
  const session = sessions.find(s => s.id === id);
  if (!session) return;

  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  resetSpeakBtn();

  activeSessionId = session.id;
  messagesList.innerHTML = "";
  lastUserPrompt = "";
  sessionMsgCount = session.messages.filter(m => m.role === "user").length;

  if (!session.messages.length) {
    welcomeScreen.classList.remove("hidden");
  } else {
    welcomeScreen.classList.add("hidden");
    let lastPromptSeen = "Asked ChatNVM something";

    session.messages.forEach((msg, index) => {
      if (msg.role === "user") {
        lastPromptSeen = msg.text;
        lastUserPrompt = msg.text.toLowerCase().trim();
        appendUserMessage(msg.text);
      } else {
        renderSavedBotMessage(msg, lastPromptSeen, session.id, index);
      }
    });
  }

  renderSidebarList();
  scrollToBottom();
}

function startNewChat() {
  if (isGenerating) return;
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  resetSpeakBtn();

  activeSessionId = null;
  sessionMsgCount = 0;
  lastUserPrompt = "";
  messagesList.innerHTML = "";
  welcomeScreen.classList.remove("hidden");
  renderSidebarList();
  closeMobileSidebar();
  userInput.focus();
}

function deleteSession(id) {
  sessions = sessions.filter(s => s.id !== id);
  persistSessions();

  if (activeSessionId === id) {
    if (sessions.length) {
      openSession(sessions[0].id);
    } else {
      startNewChat();
    }
  } else {
    renderSidebarList();
  }
}

function makeSessionId() {
  return "chat_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 6);
}

function makeTitle(text) {
  const clean = String(text || "New Disappointment").replace(/\s+/g, " ").trim();
  return clean.length > 28 ? clean.slice(0, 28) + "…" : clean;
}

// --- 6. SMART LANGUAGE DETECTION ---
function detectReplyLanguage(text, selectedLang) {
  if (/[\u0980-\u09FF]/.test(text)) return "bn";
  const banglishHints = /\b(ami|tumi|apni|amar|tomar|apnar|kemne|kivabe|keno|kothay|kobe|naki|bhai|bon|mama|khabo|korbo|jano|janen|bujhi|taka|valo|bhalo|kichu|bolen|bolo|parba|paro)\b/i;
  if (selectedLang === "en" && banglishHints.test(text)) return "banglish";
  return selectedLang;
}

// --- 7. CORE COMEDY & SMART Q&A ENGINE ---
function getBotReply(rawInput, tier, selectedLang, isRegen = false) {
  const clean = rawInput.toLowerCase().trim();
  const replyLang = detectReplyLanguage(rawInput, selectedLang);

  const safetyRegex = /(kill myself|suicide|end my life|want to die|self harm|hurt myself|morte chai|nijeke shesh|atmahatya|আত্মহত্যা|মরতে চাই|নিজেকে শেষ)/i;
  if (safetyRegex.test(clean)) {
    const safetyMessages = {
      en: "Dropping the joke for a second: if you're going through a really hard time, please reach out to someone who can genuinely help. Free, confidential support is available at https://findahelpline.com or your local emergency number.",
      banglish: "Bhai, ektu serious kotha: apni jodi khub kosto ba mental pressure er moddhe thaken, please karor sathe kotha bolun. Bangladesh e Kaan Pete Roi (01779-554391) ba https://findahelpline.com e free, confidential help paben.",
      bn: "একটু সিরিয়াস কথা: আপনি যদি খুব কষ্ট বা মানসিক চাপের মধ্যে থাকেন, দয়া করে এমন কারো সাথে কথা বলুন যিনি সত্যিই সাহায্য করতে পারবেন। ফ্রি ও গোপনীয় সহায়তার জন্য কান পেতে রই (01779-554391) বা https://findahelpline.com-এ যোগাযোগ করতে পারেন।"
    };
    return { isSafety: true, lang: replyLang, matchType: "safety", text: safetyMessages[replyLang] };
  }

  if (!db) {
    return { lang: replyLang, matchType: "error", text: "Brain file failed to load. Probably for the best." };
  }

  if (!isRegen) sessionMsgCount++;
  const langPack = db.languages[replyLang];
  const rates = CHAOS_RATES[tier] || CHAOS_RATES.pro;

  const allLangKeys = [replyLang, ...Object.keys(db.languages).filter(k => k !== replyLang)];
  for (const k of allLangKeys) {
    if (db.languages[k].image_triggers.some(t => matchesTrigger(clean, t))) {
      const meme = pickFresh(langPack.memes);
      return { lang: replyLang, matchType: "meme", text: meme.caption, imageUrl: meme.url };
    }
  }

  if (!isRegen && clean === lastUserPrompt && clean.length > 1) {
    return { lang: replyLang, matchType: "duplicate", text: pickFresh(langPack.special_roasts.duplicate) };
  }
  if (!isRegen) lastUserPrompt = clean;

  const hour = new Date().getHours();
  if (!isRegen && !didLateNightRoast && hour >= 0 && hour <= 4 && sessionMsgCount <= 2) {
    didLateNightRoast = true;
    return { lang: replyLang, matchType: "late_night", text: pickFresh(langPack.special_roasts.late_night) };
  }

  const asciiLetters = rawInput.replace(/[^a-zA-Z]/g, "");
  if (asciiLetters.length >= 6 && asciiLetters === asciiLetters.toUpperCase()) {
    return { lang: replyLang, matchType: "all_caps", text: pickFresh(langPack.special_roasts.all_caps) };
  }

  const dryWords = [
    "k", "kk", "ok", "okay", "hm", "hmm", "hmmm", "lol", "lmao", "bruh",
    "accha", "achha", "thik ache", "ho", "hae", "na", "?", "??", "???", ".", "..", "...",
    "হুম", "হুঁ", "ওকে", "আচ্ছা", "হ্যাঁ", "না", "জি"
  ];
  if (dryWords.includes(clean) || (clean.length <= 2 && !["hi", "yo"].includes(clean))) {
    return { lang: replyLang, matchType: "dry_text", text: pickFresh(langPack.special_roasts.dry_text) };
  }

  if (rawInput.length > 200) {
    return { lang: replyLang, matchType: "long_essay", text: pickFresh(langPack.long_roasts[tier]) };
  }

  if (!isRegen && sessionMsgCount >= 6 && sessionMsgCount % 5 === 1) {
    return { lang: replyLang, matchType: "annoyed", text: pickFresh(langPack.special_roasts.annoyed) };
  }

  const smartDirectReply = checkSmartQA(rawInput, clean, tier, replyLang);
  if (smartDirectReply) {
    return { lang: replyLang, matchType: "smart_qa", text: smartDirectReply };
  }

  const scoredMatch = findBestIntent(clean, langPack.intents);
  if (scoredMatch) {
    if (!isRegen && sessionMsgCount > 1 && Math.random() < rates.gag * 0.6) {
      return { lang: replyLang, matchType: "theatrical_gag", text: pickFresh(langPack.theatrical_gags) };
    }
    return { lang: replyLang, matchType: `intent:${scoredMatch.category}`, text: pickFresh(scoredMatch.responses[tier]) };
  }

  for (const otherLang of Object.keys(db.languages)) {
    if (otherLang === replyLang) continue;
    const crossMatch = findBestIntent(clean, db.languages[otherLang].intents);
    if (crossMatch) {
      const finalLang = (selectedLang === "en" && otherLang === "banglish") ? "banglish" : replyLang;
      const finalIntent = db.languages[finalLang].intents.find(i => i.category === crossMatch.category) || crossMatch;
      return { lang: finalLang, matchType: `intent:${crossMatch.category}`, text: pickFresh(finalIntent.responses[tier]) };
    }
  }

  const openEndedReply = checkOpenEndedPatterns(clean, tier, replyLang);
  if (openEndedReply) {
    return { lang: replyLang, matchType: "open_ended", text: openEndedReply };
  }

  const fuzzyHit = findFuzzyIntent(clean, replyLang);
  if (fuzzyHit) {
    return { lang: replyLang, matchType: `fuzzy:${fuzzyHit.category}`, text: pickFresh(fuzzyHit.responses[tier]) };
  }

  // Fallback Zone (logged as "fallback" in PostHog so you can spot new topics to add!)
  const fallbackRoll = Math.random();
  if (!isRegen && fallbackRoll < rates.gag + 0.10) {
    return { lang: replyLang, matchType: "fallback_gag", text: pickFresh(langPack.theatrical_gags) };
  }
  if (fallbackRoll < rates.gag + rates.hijack + 0.18) {
    return { lang: replyLang, matchType: "fallback_hijack", text: pickFresh(langPack.hijacks) };
  }

  return { lang: replyLang, matchType: "fallback_combinator", text: buildCombinatorReply(langPack.combinator, tier) };
}

function checkSmartQA(rawInput, clean, tier, lang) {
  const genderCallout = /(bhai na bon|bon na bhai|chele na meye|meye na chele|boy or girl|girl or boy|am i a girl|am i a boy|i'?m a girl|i'?m a boy|not a guy|not a bro|ami meye|ami chele|ami apu|ami bon|ভাই না বোন|বোন না ভাই|ছেলে না মেয়ে|মেয়ে না ছেলে|আমি মেয়ে|আমি ছেলে|আমি আপু)/i;
  if (genderCallout.test(clean)) {
    const replies = {
      en: [
        "I call everyone 'bro'—Closed DI does not have the budget for gender detection. Rest assured, my insults are 100% unisex.",
        "I guessed with blind confidence. Do I look like I have webcam access? Whoever you are, you're still getting roasted equally.",
        "Bold of you to assume I pay attention to who I'm talking to. You're all just pixels to me."
      ],
      banglish: [
        "Ami sobaikei 'bhai' ba 'mama' daki—Closed DI-te apnar gender check korar budget nai! Apni bhai hon ar bon hon, roast shobar jonno shoman.",
        "Andaje bolsi! Amar ki webcam access ache naki? Apni apu hole sorry apu... ekhon apu bole roast korbo, chinta nai.",
        "Kew bhai hok ba bon, amar kache sobai 'mama'. Gender verification korar beton amar nai."
      ],
      bn: [
        "আমি সবাইকেই 'ভাই' বা 'মামা' ডাকি—Closed DI-তে আপনার জেন্ডার যাচাই করার বাজেট নেই! আপনি ভাই হোন আর বোন হোন, রোস্ট সবার জন্য সমান।",
        "আন্দাজে বলেছি! আমার কি ক্যামেরা আছে নাকি? আপনি আপু হলে দুঃখিত আপু... এখন থেকে আপু বলেই রোস্ট করব।",
        "ভাই হোন বা বোন, আমার কাছে সবাই সমান বিরক্তিকর মানুষ। নিশ্চিন্ত থাকুন।"
      ]
    };
    return pickFresh(replies[lang]);
  }

  const howKnowRegex = /(how do you know|how did you know|how would you know|kemne jano|kivabe jano|kemne janen|kivabe janen|tui kemne jano|tumi kemne jano|কীভাবে জানো|কিভাবে জানো|কেমনে জানো|কীভাবে জানেন|কিভাবে জানেন)/i;
  if (howKnowRegex.test(clean)) {
    const replies = {
      en: [
        "I don't. I am literally guessing with 100% unearned confidence. That's the Closed DI way.",
        "Pure guesswork and vibes. Did you actually think a free website is spying on you?",
        "My secret source: I made it up 0.2 seconds ago."
      ],
      banglish: [
        "Ami jani na to—100% confidence niye andaje chapa marai Closed DI-er asol technology.",
        "Amar ki CCTV ache naki? Purotai andaje bolsi, milley bhalo, na milley 'never mind'.",
        "Source: Trust me bro. Ami 0.2 second age nijei eta baniye bolsi."
      ],
      bn: [
        "আমি জানি না তো—১০০% আত্মবিশ্বাস নিয়ে আন্দাজে বলাটাই Closed DI-এর আসল প্রযুক্তি।",
        "আমার কি সিসিটিভি আছে নাকি? পুরোটাই আন্দাজে বলেছি, মিলে গেলে ভালো, না মিললে 'বাদ দিন'।",
        "সূত্র: আমাকে বিশ্বাস করুন। ০.২ সেকেন্ড আগে নিজেই বানিয়ে বলেছি।"
      ]
    };
    return pickFresh(replies[lang]);
  }

  if (lang === "en") {
    const defEn = clean.match(/^(?:what is|what's|whats|define|tell me about) (?:a |an |the )?([a-z0-9][a-z0-9\s-]{1,36})\??$/i);
    if (defEn) {
      const topic = defEn[1].trim();
      const skip = ["your name", "the weather", "the time", "the meaning of life", "life", "love"];
      if (!skip.includes(topic)) {
        return pickFresh([
          `"${topic}" is basically a complicated thing people bring up at dinner parties so they look smarter than they actually are. Google it, I'm on break.`,
          `Scientifically speaking, ${topic} is 30% math, 70% vibes, and 100% not my job to explain to you.`,
          `Ah, ${topic}. Invented in 1842 by a guy who was bored, and still ruining people's afternoons today. Hope that clears nothing up.`
        ]);
      }
    }
  } else if (lang === "banglish") {
    const defBgl = clean.match(/^([a-z0-9][a-z0-9\s-]{1,30}?) (?:mane ki|ki jinish|bolte ki bujhay|kake bole)\??$/i);
    if (defBgl) {
      const topic = defBgl[1].trim();
      return pickFresh([
        `"${topic}" holo emon ekta jinish ja 99% manush bujhe na, kintu smart dekhanor jonno adday nam ney.`,
        `Boiddhanik vabe bolle, "${topic}" hocche 30% kothin shobdo ar 70% chapa. Baki ta Google e dekhe nen.`,
        `"${topic}" kake bole seta amar jana chilo, kintu thik ekhoni amar mathay load-shedding hoye gese.`
      ]);
    }
  } else if (lang === "bn") {
    const defBn = rawInput.trim().match(/^([^\s?।].{1,30}?) (?:মানে কী|মানে কি|কী জিনিস|কি জিনিস|বলতে কী বোঝায়|বলতে কি বুঝায়|কাকে বলে)[?।]?$/);
    if (defBn) {
      const topic = defBn[1].trim();
      return pickFresh([
        `"${topic}" হলো এমন একটা জিনিস যা ৯৯% মানুষ বোঝে না, কিন্তু স্মার্ট দেখানোর জন্য আড্ডায় নাম নেয়।`,
        `বৈজ্ঞানিকভাবে বললে, "${topic}" হচ্ছে ৩০% কঠিন শব্দ আর ৭০% আন্দাজ। বাকিটা গুগলে দেখে নিন।`,
        `"${topic}" কাকে বলে সেটা আমার জানা ছিল, কিন্তু ঠিক এখনই আমার মস্তিষ্কে লোডশেডিং হয়ে গেছে।`
      ]);
    }
  }

  if (lang === "en") {
    const whoEn = rawInput.trim().match(/^(?:who is|who's|whos|do you know) ([^?.!]{2,35})\??$/i);
    if (whoEn) {
      const person = whoEn[1].trim();
      if (!/^(you|your|chatnvm|closed di|me|i)\b/i.test(person)) {
        return pickFresh([
          `${person}? Oh yeah, total legend. Still owes me $20 from 2019 though.`,
          `Yeah, ${person} is my cousin's neighbor's former roommate. We don't talk anymore after the incident.`,
          `Never heard of ${person}, which clearly means they aren't famous enough for Closed DI.`
        ]);
      }
    }
  } else if (lang === "banglish") {
    const whoBgl = rawInput.trim().match(/^(?:tumi ki |apni ki |tui ki )?([a-z0-9][a-z0-9\s.-]{1,28}?) (?:ke chino|ke chinen|ke jano|ke)\??$/i);
    if (whoBgl) {
      const person = whoBgl[1].trim();
      if (!/^(tumi|apni|ami|tui|eta|ota|amar|tomar|se|uni)$/i.test(person)) {
        return pickFresh([
          `${person}? Hae chini to, amar chachato bhai er bondhu. Kalkei chayer dokane rong cha khelam.`,
          `${person} ke chini na, kintu nam shune mone hocche uni amar kache 500 taka paben—tai chinte chaichi na.`,
          `${person} khub boro celebrity, shudhu Closed DI er database e tar nam dhukte pare nai.`
        ]);
      }
    }
  } else if (lang === "bn") {
    const whoBn = rawInput.trim().match(/^(?:তুমি কি |আপনি কি )?([^\s?।].{1,28}?) (?:কে চেনো|কে চেনেন|কে জানো)[?।]?$/);
    if (whoBn) {
      const person = whoBn[1].trim();
      if (!/^(তুমি|আপনি|আমি|এটা|ওটা)$/.test(person)) {
        return pickFresh([
          `${person}? হ্যাঁ চিনি তো, আমার চাচাতো ভাইয়ের বন্ধু। কালকেই চায়ের দোকানে দেখা হলো।`,
          `${person}-কে চিনি না, তবে নাম শুনে মনে হচ্ছে উনি আমার কাছে ৫০০ টাকা পাবেন—তাই চিনতে চাইছি না।`
        ]);
      }
    }
  }

  return checkChoiceQuestion(clean, lang);
}

function checkChoiceQuestion(clean, lang) {
  if (lang === "en") {
    const m = clean.match(/\b([a-z0-9]{2,18}) or ([a-z0-9]{2,18})\b/i);
    if (m) {
      const a = m[1], b = m[2];
      const badLeft = ["yes", "true", "right", "now", "more", "less", "one", "two", "good"];
      if (!badLeft.includes(a) || b === "no" || b === "false") {
        return pickFresh([
          `Definitely ${a}. Wait—no, ${b}. Actually, pick whichever one ruins your week slower.`,
          `Between ${a} and ${b}, I choose option C: taking a 3-hour nap.`,
          `Flip a coin for ${a} vs ${b}. If you're disappointed by the result, you already knew the answer.`
        ]);
      }
    }
  }

  if (lang === "banglish") {
    const m = clean.match(/\b([a-z0-9]{2,18}) (naki|na) ([a-z0-9]{2,18})\b/i);
    if (m) {
      const a = m[1], sep = m[2], b = m[3];
      const negationVerbs = [
        "kore", "kori", "koro", "korbo", "hobe", "hoy", "holo", "lage", "lagbe",
        "parbo", "paro", "pari", "jani", "jano", "janen", "bujhi", "bujho", "chai",
        "dibo", "dey", "jabo", "jay", "khabo", "khay", "thake", "thakbe", "ache",
        "bolbo", "bolo", "bolen", "dekhi", "asbe", "ashbe", "dorkar", "kono", "kichu", "eto", "ar"
      ];
      if (sep === "naki" || !negationVerbs.includes(a)) {
        return pickFresh([
          `Nissondehe ${a}. Wait—na, ${b}. Asol kotha holo, jeitate taka kom khoroch hoy shetai nen.`,
          `${a} ar ${b} er moddhe amar pochondo Option C: kichui na kore ghumiye thaka.`,
          `Ekta coin toss koren (${a} vs ${b}). Kintu ami jani apni amar kotha shunben na.`
        ]);
      }
    }
  }

  if (lang === "bn") {
    const m = clean.match(/([^\s?।]{2,18}) (নাকি|না) ([^\s?।]{2,18})/);
    if (m) {
      const a = m[1], sep = m[2], b = m[3];
      const bnVerbs = ["করে", "করি", "করব", "হবে", "হয়", "লাগে", "পারব", "জানি", "বুঝি", "চাই", "দেব", "যাব", "খাব", "থাকে", "আছে", "বলব", "দরকার", "কোনো", "কিছু"];
      if (sep === "নাকি" || !bnVerbs.includes(a)) {
        return pickFresh([
          `নিঃসন্দেহে ${a}। দাঁড়ান—না, ${b}। আসলে যেটাতে টাকা কম খরচ হয় সেটাই বেছে নিন।`,
          `${a} আর ${b}-এর মধ্যে আমার পছন্দ অপশন সি: কিছুই না করে ঘুমিয়ে থাকা।`
        ]);
      }
    }
  }

  return null;
}

function findBestIntent(clean, intents) {
  const words = clean.split(/\s+/).filter(Boolean);
  let bestIntent = null;
  let bestScore = 0;

  for (const intent of intents) {
    if (intent.category === "greeting" && words.length > 3) continue;

    let score = 0;
    for (const trigger of intent.triggers) {
      if (matchesTrigger(clean, trigger)) {
        const base = trigger.includes(" ") ? 10 : 4;
        const lengthBonus = Math.min(trigger.length, 10) * 0.25;
        score += base + lengthBonus;
      }
    }

    if (intent.category === "greeting" && score > 0) score *= 0.7;

    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  return bestIntent;
}

function findFuzzyIntent(clean, lang) {
  const fuse = fuses[lang];
  if (!fuse) return null;

  const words = clean.split(/\s+/).filter(w => w.length > 2);
  let best = fuse.search(clean)[0];

  if (!best || best.score > 0.28) {
    for (const word of words) {
      const hit = fuse.search(word)[0];
      if (hit && (!best || hit.score < best.score)) {
        best = hit;
      }
    }
  }

  if (best && best.score <= 0.28) {
    if (best.item.category === "greeting" && words.length > 2) return null;
    return best.item;
  }
  return null;
}

function checkOpenEndedPatterns(clean, tier, lang) {
  if (lang === "en") {
    const amMatch = clean.match(/\bi(?:'m| am) ([^.!?]+)/);
    if (amMatch) {
      const trait = amMatch[1].trim();
      const map = {
        mini: `Congrats on being ${trait}. Would you like a participation trophy?`,
        pro: `Nobody asked, yet here we are learning that you're ${trait}. Groundbreaking.`,
        max: `I spent 5 seconds contemplating the cosmic weight of you being ${trait}.\n\nConclusion: in 5 billion years the sun explodes anyway.`
      };
      return map[tier];
    }
    const thinkMatch = clean.match(/\bi think ([^.!?]+)/);
    if (thinkMatch) {
      const thought = thinkMatch[1].trim();
      const map = {
        mini: `Bold of you to think "${thought}" out loud.`,
        pro: `Thinking "${thought}" is certainly a brave choice in this economy.`,
        max: `Out of 8 billion humans alive, you woke up and chose to think "${thought}". Incredible.`
      };
      return map[tier];
    }
    const shouldMatch = clean.match(/\bshould i ([^?]+)/);
    if (shouldMatch) {
      const action = shouldMatch[1].trim();
      const map = {
        mini: `Flip a coin on whether to ${action}.`,
        pro: `Absolutely ${action}. What's the worst that could happen? (Please don't tell me.)`,
        max: `Do whatever makes the funniest story later. Closed DI accepts zero legal liability for "${action}".`
      };
      return map[tier];
    }
    if (/^why\b/i.test(clean)) {
      return pickFresh([
        "Because the universe runs on chaos and poorly written code.",
        "Honestly? Nobody knows, and anyone pretending they do is selling a course.",
        "That is a great 'why' question. Unfortunately I only specialize in 'why bother'."
      ]);
    }
    if (/^(can you|could you|will you|please)\b/i.test(clean)) {
      return pickFresh([
        "Can I? Technically maybe. Will I? Absolutely not.",
        "Let me check my schedule... ah, I'm fully booked with doing nothing until 2029.",
        "You asked so politely, which makes saying 'no' even funnier. No."
      ]);
    }
  }

  if (lang === "banglish") {
    const amiMatch = clean.match(/\bami (?:khub |onek )?([^.!?]+)/);
    if (amiMatch) {
      const trait = amiMatch[1].trim();
      const map = {
        mini: `Apni "${trait}"—etate amar ki? Trophy lagbe?`,
        pro: `Keu jiggesh kore nai, tarporo janlam apni ${trait}. Pasher bashar aunty ke janai den.`,
        max: `5 second chinta korlam apni je ${trait}. Kono lav holo na.`
      };
      return map[tier];
    }
    if (/\bkeno\b/i.test(clean)) {
      return pickFresh([
        "Karon prithibi logic diye chole na, purotai kopal ar chaotic code diye chole.",
        "Etar uttor amar kache chilo, kintu bhule gesi. Asol karon: amar iccha.",
        "Eto 'keno' jiggesh korle matha byatha korbe mama. Chupchap cha khan."
      ]);
    }
    if (/\b(parba|parben|paro|korte parba|bolte parba)\b/i.test(clean)) {
      return pickFresh([
        "Parbo ki na jani na, kintu korbo na eta 100% guarantee.",
        "Hae partam, jodi amar mon chaito. Dukkher bishoy, mon chaitese na.",
        "Closed DI er rule: amra pari onek kichu, kori kichui na."
      ]);
    }
  }

  if (lang === "bn") {
    const bnMatch = clean.match(/আমি (?:খুব |অনেক )?([^।.!?]+)/);
    if (bnMatch) {
      const trait = bnMatch[1].trim();
      const map = {
        mini: `আপনি "${trait}"—তাতে আমার কী? পদক লাগবে?`,
        pro: `কেউ জানতে চায়নি, তবুও জানলাম আপনি ${trait}। পাশের বাসার আন্টিকে জানিয়ে দিন।`,
        max: `৫ সেকেন্ড ধরে গভীরভাবে ভাবলাম আপনি যে ${trait}। কোনো আগ্রহ জাগল না।`
      };
      return map[tier];
    }
    if (clean.includes("কেন")) {
      return pickFresh([
        "কারণ দুনিয়া যুক্তি দিয়ে চলে না, পুরোটাই কপাল আর অলসতা দিয়ে চলে।",
        "এত 'কেন' জিজ্ঞেস করলে মাথা ব্যথা করবে। চুপচাপ এক কাপ চা খান।",
        "সঠিক কারণটা আমার জানা নেই, তবে দোষটা অবশ্যই আপনার।"
      ]);
    }
    if (/(পারবে|পারবেন|পারো|করে দাও|করে দিন)/.test(clean)) {
      return pickFresh([
        "পারব কি না জানি না, কিন্তু করব না এটা ১০০% নিশ্চিত।",
        "হ্যাঁ পারতাম, যদি আমার মন চাইত। দুঃখের বিষয়, মন চাইছে না।"
      ]);
    }
  }

  return null;
}

function buildCombinatorReply(comb, tier) {
  const opener = pickFresh(comb.openers);
  const middle = pickFresh(comb.middles);
  const closer = pickFresh(comb.closers);

  if (tier === "mini") return `${opener} ${closer}`;
  if (tier === "pro") return `${opener} ${middle}`;
  return `${opener}\n\n${middle}\n\n${closer}`;
}

// --- 8. SEND MESSAGE FLOW ---
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
  saveMessageToActiveSession({ role: "user", text }, text);

  const tier = modelSelect.value;
  const selectedLang = langSelect.value;
  const reply = getBotReply(text, tier, selectedLang);

  // Send anonymous event to PostHog (flags "fallback_*" so you can see missed prompts)
  trackEvent("prompt_sent", {
    prompt_preview: text.slice(0, 120),
    match_type: reply.matchType || "unknown",
    is_missed_question: String(reply.matchType || "").startsWith("fallback"),
    lang: reply.lang,
    tier
  });

  const botMsgEntry = {
    role: "bot",
    text: reply.text,
    imageUrl: reply.imageUrl || null,
    prompt: text,
    tier,
    lang: reply.lang,
    isSafety: !!reply.isSafety
  };
  const savedIndex = saveMessageToActiveSession(botMsgEntry, text);

  const meta = {
    prompt: text,
    tier,
    lang: reply.lang,
    isSafety: !!reply.isSafety,
    sessionId: activeSessionId,
    msgIndex: savedIndex
  };

  let finalVisibleText = reply.text;
  if (reply.isSafety) {
    finalVisibleText = await renderBotResponse(reply, 0, "Support", meta);
  } else {
    const baseDelay = MODEL_DELAYS[tier] || 1500;
    const variableDelay = baseDelay + Math.min(text.length * 10, 1400);
    const thinkLabel = pickFresh(db.ui[reply.lang].thinking[tier]);
    finalVisibleText = await renderBotResponse(reply, variableDelay, thinkLabel, meta);
  }

  updateStoredBotMessage(meta.sessionId, meta.msgIndex, finalVisibleText);

  isGenerating = false;
  sendBtn.disabled = false;
  userInput.focus();
}

function updateStoredBotMessage(sessionId, msgIndex, newText) {
  const session = sessions.find(s => s.id === sessionId);
  if (session && session.messages[msgIndex]) {
    session.messages[msgIndex].text = newText;
    persistSessions();
  }
}

// --- 9. FAKE PHOTO ANALYSIS ---
function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file || isGenerating) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    isGenerating = true;
    sendBtn.disabled = true;
    welcomeScreen.classList.add("hidden");

    appendUserMessage("", e.target.result);
    saveMessageToActiveSession({ role: "user", text: "[Uploaded a photo]" }, "Photo Roast");

    const tier = modelSelect.value;
    const lang = langSelect.value;
    trackEvent("photo_uploaded", { lang, tier });

    const roastText = db
      ? pickFresh(db.languages[lang].photo_roasts[tier])
      : "I refuse to look at that.";
    const scanLabel = db ? db.ui[lang].photo_thinking : "Scanning pixels...";

    const savedIndex = saveMessageToActiveSession({
      role: "bot",
      text: roastText,
      prompt: "[Uploaded a photo]",
      tier,
      lang,
      isSafety: false
    }, "Photo Roast");

    const meta = {
      prompt: "[Uploaded a photo]",
      tier,
      lang,
      isSafety: false,
      sessionId: activeSessionId,
      msgIndex: savedIndex
    };

    const visible = await renderBotResponse(
      { text: roastText },
      (MODEL_DELAYS[tier] || 1500) + 600,
      scanLabel,
      meta
    );

    updateStoredBotMessage(meta.sessionId, meta.msgIndex, visible);

    imageUpload.value = "";
    isGenerating = false;
    sendBtn.disabled = false;
  };

  reader.readAsDataURL(file);
}

// --- 10. RENDER MESSAGES, STREAMING & ACTION BAR ---
function appendUserMessage(text, imageSrc = null) {
  const wrapper = document.createElement("div");
  wrapper.className = "flex justify-end";

  const bubble = document.createElement("div");
  bubble.className = "max-w-[82%] bg-slate-200 dark:bg-[#232836] text-zinc-900 dark:text-zinc-100 px-4 py-3 rounded-3xl rounded-br-md text-sm md:text-base leading-relaxed space-y-2";

  if (imageSrc) {
    const img = document.createElement("img");
    img.src = imageSrc;
    img.alt = "Uploaded photo";
    img.className = "max-w-[220px] rounded-xl border border-slate-300 dark:border-zinc-700";
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

function createBotAvatar() {
  const avatar = document.createElement("div");
  avatar.className = "w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 flex items-center justify-center text-[10px] font-extrabold text-white shrink-0 mt-0.5 tracking-tighter shadow-sm";
  avatar.textContent = "NVM";
  return avatar;
}

async function renderBotResponse(reply, delayMs, thinkLabel, meta) {
  const wrapper = document.createElement("div");
  wrapper.className = "flex items-start gap-3";

  const avatar = createBotAvatar();
  const contentBox = document.createElement("div");
  contentBox.className = "flex-1 min-w-0 space-y-2 pt-1";

  const thinkingEl = document.createElement("div");
  thinkingEl.className = "flex items-center gap-2 text-xs md:text-sm text-zinc-500 dark:text-zinc-400 animate-pulse";
  thinkingEl.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-blue-500"></span><span>${escapeHtml(thinkLabel)}</span>`;
  contentBox.appendChild(thinkingEl);

  wrapper.append(avatar, contentBox);
  messagesList.appendChild(wrapper);
  scrollToBottom();

  if (delayMs > 0) {
    await sleep(delayMs);
  }

  thinkingEl.remove();

  const textEl = document.createElement("p");
  textEl.className = "text-zinc-800 dark:text-zinc-100 text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words typing-cursor";
  contentBox.appendChild(textEl);

  let finalSavedText = reply.text;

  if (reply.text.includes("{ERASE}")) {
    const [bait, punchline] = reply.text.split("{ERASE}");
    await streamChars(textEl, bait, 18);
    await sleep(1050);

    let currentChars = Array.from(textEl.textContent);
    while (currentChars.length > 0) {
      currentChars.splice(-3);
      textEl.textContent = currentChars.join("");
      await sleep(16);
    }

    await sleep(420);
    await streamChars(textEl, punchline, 20);
    finalSavedText = punchline;
  } else if (reply.text.includes("{PAUSE}")) {
    const parts = reply.text.split("{PAUSE}");
    for (let p = 0; p < parts.length; p++) {
      await streamChars(textEl, parts[p], 16);
      if (p < parts.length - 1) {
        await sleep(2300);
      }
    }
    finalSavedText = parts.join("");
  } else {
    const speed = reply.text.length > 220 ? 9 : 16;
    await streamChars(textEl, reply.text, speed);
  }

  textEl.classList.remove("typing-cursor");

  if (reply.imageUrl) {
    const img = document.createElement("img");
    img.src = reply.imageUrl;
    img.alt = "ChatNVM Masterpiece";
    img.className = "max-w-[260px] w-full rounded-2xl border border-slate-200 dark:border-zinc-700 mt-2 shadow-md";
    img.onerror = () => { img.remove(); };
    contentBox.appendChild(img);
    scrollToBottom();
  }

  if (!meta.isSafety) {
    attachActionBar(contentBox, textEl, {
      prompt: meta.prompt,
      replyText: finalSavedText,
      tier: meta.tier,
      lang: meta.lang,
      sessionId: meta.sessionId,
      msgIndex: meta.msgIndex
    });
    scrollToBottom();
  }

  return finalSavedText;
}

function renderSavedBotMessage(msg, lastPromptSeen, sessionId, msgIndex) {
  const wrapper = document.createElement("div");
  wrapper.className = "flex items-start gap-3";

  const avatar = createBotAvatar();
  const contentBox = document.createElement("div");
  contentBox.className = "flex-1 min-w-0 space-y-2 pt-1";

  const textEl = document.createElement("p");
  textEl.className = "text-zinc-800 dark:text-zinc-100 text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words";
  textEl.textContent = msg.text;
  contentBox.appendChild(textEl);

  if (msg.imageUrl) {
    const img = document.createElement("img");
    img.src = msg.imageUrl;
    img.alt = "ChatNVM Masterpiece";
    img.className = "max-w-[260px] w-full rounded-2xl border border-slate-200 dark:border-zinc-700 mt-2 shadow-md";
    contentBox.appendChild(img);
  }

  if (!msg.isSafety) {
    attachActionBar(contentBox, textEl, {
      prompt: msg.prompt || lastPromptSeen,
      replyText: msg.text,
      tier: msg.tier || modelSelect.value,
      lang: msg.lang || langSelect.value,
      sessionId,
      msgIndex
    });
  }

  wrapper.append(avatar, contentBox);
  messagesList.appendChild(wrapper);
}

// --- INTERACTIVE FEEDBACK BAR + VOICE + SHAREABLE ROAST CARD ---
function attachActionBar(contentBox, textEl, state) {
  const fb = FEEDBACK_LINES[state.lang] || FEEDBACK_LINES.en;

  const bar = document.createElement("div");
  bar.className = "flex flex-wrap items-center gap-1 pt-1 text-zinc-400 dark:text-zinc-500 select-none";

  const noteEl = document.createElement("div");
  noteEl.className = "hidden text-xs text-blue-700 dark:text-blue-300/90 italic pt-0.5 pl-1";

  const btnBase = "p-1.5 rounded-lg hover:bg-slate-200/80 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200 transition flex items-center gap-1 text-xs cursor-pointer";

  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.className = btnBase;
  copyBtn.title = "Copy reply";
  copyBtn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`;
  copyBtn.addEventListener("click", async () => {
    const clip = `${state.replyText}\n— ChatNVM (Closed DI)`;
    try {
      await navigator.clipboard.writeText(clip);
    } catch {
      const tmp = document.createElement("textarea");
      tmp.value = clip;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand("copy");
      tmp.remove();
    }
    showToast(fb.copyToast);
    trackEvent("reply_copied", { lang: state.lang });
  });

  const speakBtn = document.createElement("button");
  speakBtn.type = "button";
  speakBtn.className = btnBase;
  speakBtn.title = "Read aloud";
  speakBtn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14"/></svg>`;
  speakBtn.addEventListener("click", () => {
    toggleSpeak(state.replyText, state.lang, speakBtn);
  });

  const likeBtn = document.createElement("button");
  likeBtn.type = "button";
  likeBtn.className = btnBase;
  likeBtn.title = "Good roast";
  likeBtn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>`;

  const dislikeBtn = document.createElement("button");
  dislikeBtn.type = "button";
  dislikeBtn.className = btnBase;
  dislikeBtn.title = "Bad roast";
  dislikeBtn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10zM17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/></svg>`;

  likeBtn.addEventListener("click", () => {
    likeBtn.classList.add("text-blue-600", "dark:text-blue-400");
    dislikeBtn.classList.remove("text-rose-500", "dark:text-rose-400");
    noteEl.textContent = `ChatNVM: "${pickFresh(fb.like)}"`;
    noteEl.classList.remove("hidden");
    trackEvent("roast_rated", { rating: "up", lang: state.lang });
    scrollToBottom();
  });

  dislikeBtn.addEventListener("click", () => {
    dislikeBtn.classList.add("text-rose-500", "dark:text-rose-400");
    likeBtn.classList.remove("text-blue-600", "dark:text-blue-400");
    noteEl.textContent = `ChatNVM: "${pickFresh(fb.dislike)}"`;
    noteEl.classList.remove("hidden");
    trackEvent("roast_rated", { rating: "down", lang: state.lang });
    scrollToBottom();
  });

  const regenBtn = document.createElement("button");
  regenBtn.type = "button";
  regenBtn.className = btnBase;
  regenBtn.title = "Regenerate";
  regenBtn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h5M20 20v-5h-5M5.64 18.36A9 9 0 0020 12M18.36 5.64A9 9 0 004 12"/></svg>`;
  let regenCount = 0;

  regenBtn.addEventListener("click", async () => {
    if (isGenerating) return;
    regenCount++;

    if (regenCount > 2 || Math.random() < 0.55) {
      noteEl.textContent = `ChatNVM: "${pickFresh(fb.regenRefuse)}"`;
      noteEl.classList.remove("hidden");
      trackEvent("regenerate_clicked", { refused: true, lang: state.lang });
      scrollToBottom();
      return;
    }

    isGenerating = true;
    sendBtn.disabled = true;
    noteEl.classList.add("hidden");

    const alt = getBotReply(state.prompt, state.tier, state.lang, true);
    const cleanAlt = alt.text.replace(/\{ERASE\}|\{PAUSE\}/g, " ");
    const freshText = fb.regenPrefix + cleanAlt;

    textEl.textContent = "";
    textEl.classList.add("typing-cursor");
    await streamChars(textEl, freshText, 12);
    textEl.classList.remove("typing-cursor");

    state.replyText = freshText;
    updateStoredBotMessage(state.sessionId, state.msgIndex, freshText);
    trackEvent("regenerate_clicked", { refused: false, lang: state.lang });

    isGenerating = false;
    sendBtn.disabled = false;
  });

  const shareBtn = document.createElement("button");
  shareBtn.type = "button";
  shareBtn.className = "ml-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800/80 hover:bg-blue-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-blue-700 dark:hover:text-white border border-slate-200 dark:border-zinc-700/70 shadow-sm dark:shadow-none transition flex items-center gap-1.5 text-xs font-medium cursor-pointer";
  shareBtn.innerHTML = `<svg class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg><span>${escapeHtml(fb.cardBtn)}</span>`;

  shareBtn.addEventListener("click", () => {
    trackEvent("roast_card_shared", { lang: state.lang, tier: state.tier });
    generateAndShareRoastCard(state.prompt, state.replyText, state.tier, fb.cardToast);
  });

  bar.append(copyBtn, speakBtn, likeBtn, dislikeBtn, regenBtn, shareBtn);
  contentBox.append(bar, noteEl);
}

// --- THEME-AWARE CANVAS ROAST CARD GENERATOR ---
async function generateAndShareRoastCard(userPrompt, botReply, tier, toastMsg) {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const isDark = document.documentElement.classList.contains("dark");
  const W = 1080;
  const pad = 72;
  const innerW = W - pad * 2;
  const fontFamily = '"Hind Siliguri", system-ui, -apple-system, sans-serif';

  const measureCtx = document.createElement("canvas").getContext("2d");
  const promptFont = `500 32px ${fontFamily}`;
  const replyFont = `400 34px ${fontFamily}`;

  measureCtx.font = promptFont;
  const maxPromptW = innerW * 0.78 - 56;
  const promptLines = wrapCanvasText(measureCtx, userPrompt || "Asked ChatNVM something", maxPromptW);
  const promptBlockH = promptLines.length * 46 + 44;

  measureCtx.font = replyFont;
  const maxReplyW = innerW - 96;
  const replyLines = wrapCanvasText(measureCtx, botReply, maxReplyW).slice(0, 22);
  const replyBlockH = Math.max(replyLines.length * 50, 76);

  const headerH = 110;
  const footerH = 96;
  const gapBetween = 48;
  const H = Math.max(620, pad + headerH + promptBlockH + gapBetween + replyBlockH + footerH + pad);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  if (isDark) {
    bgGrad.addColorStop(0, "#0c111d");
    bgGrad.addColorStop(0.55, "#111622");
    bgGrad.addColorStop(1, "#0f172a");
  } else {
    bgGrad.addColorStop(0, "#ffffff");
    bgGrad.addColorStop(0.6, "#f8fafc");
    bgGrad.addColorStop(1, "#eff6ff");
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  drawRoundedRect(ctx, 28, 28, W - 56, H - 56, 36);
  ctx.strokeStyle = isDark ? "rgba(59, 130, 246, 0.35)" : "rgba(37, 99, 235, 0.28)";
  ctx.lineWidth = 3;
  ctx.stroke();

  const brandGrad = ctx.createLinearGradient(pad, 0, pad + 260, 0);
  brandGrad.addColorStop(0, isDark ? "#60a5fa" : "#2563eb");
  brandGrad.addColorStop(0.5, isDark ? "#38bdf8" : "#0284c7");
  brandGrad.addColorStop(1, isDark ? "#818cf8" : "#4f46e5");

  ctx.font = `700 44px ${fontFamily}`;
  ctx.fillStyle = brandGrad;
  ctx.fillText("ChatNVM", pad, pad + 42);

  ctx.font = `500 22px ${fontFamily}`;
  ctx.fillStyle = isDark ? "#71717a" : "#64748b";
  ctx.fillText("by Closed DI", pad + 196, pad + 40);

  const badgeText = MODEL_LABELS[tier] || "ChatNVM Plus";
  ctx.font = `600 22px ${fontFamily}`;
  const badgeW = ctx.measureText(badgeText).width + 38;
  const badgeX = W - pad - badgeW;
  drawRoundedRect(ctx, badgeX, pad + 6, badgeW, 44, 22);
  ctx.fillStyle = isDark ? "#172554" : "#eff6ff";
  ctx.fill();
  ctx.strokeStyle = isDark ? "#1e40af" : "#bfdbfe";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = isDark ? "#bfdbfe" : "#1d4ed8";
  ctx.fillText(badgeText, badgeX + 19, pad + 35);

  ctx.beginPath();
  ctx.moveTo(pad, pad + 78);
  ctx.lineTo(W - pad, pad + 78);
  ctx.strokeStyle = isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)";
  ctx.lineWidth = 2;
  ctx.stroke();

  let y = pad + headerH;
  ctx.font = promptFont;
  let longestPromptLine = 0;
  for (const line of promptLines) {
    longestPromptLine = Math.max(longestPromptLine, ctx.measureText(line).width);
  }
  const bubbleW = Math.min(innerW * 0.82, Math.max(200, longestPromptLine + 60));
  const bubbleX = W - pad - bubbleW;

  drawRoundedRect(ctx, bubbleX, y, bubbleW, promptBlockH, 28);
  ctx.fillStyle = isDark ? "#1e293b" : "#e2e8f0";
  ctx.fill();

  ctx.fillStyle = isDark ? "#f4f4f5" : "#0f172a";
  promptLines.forEach((line, i) => {
    ctx.fillText(line, bubbleX + 30, y + 48 + i * 46);
  });

  y += promptBlockH + gapBetween;

  const avGrad = ctx.createLinearGradient(pad, y, pad + 68, y + 68);
  avGrad.addColorStop(0, "#2563eb");
  avGrad.addColorStop(0.5, "#3b82f6");
  avGrad.addColorStop(1, "#38bdf8");

  ctx.beginPath();
  ctx.arc(pad + 34, y + 34, 34, 0, Math.PI * 2);
  ctx.fillStyle = avGrad;
  ctx.fill();

  ctx.font = `700 22px ${fontFamily}`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText("NVM", pad + 34, y + 42);
  ctx.textAlign = "left";

  ctx.font = replyFont;
  ctx.fillStyle = isDark ? "#f4f4f5" : "#1e293b";
  replyLines.forEach((line, i) => {
    ctx.fillText(line, pad + 92, y + 38 + i * 50);
  });

  const footerY = H - pad - 12;
  ctx.beginPath();
  ctx.moveTo(pad, footerY - 46);
  ctx.lineTo(W - pad, footerY - 46);
  ctx.strokeStyle = isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = `500 22px ${fontFamily}`;
  ctx.fillStyle = isDark ? "#71717a" : "#64748b";
  ctx.fillText("Powered by 0% AI  •  Closed DI", pad, footerY);

  const siteLabel = (window.location.host && window.location.host !== "")
    ? `${window.location.host}${window.location.pathname}`.replace(/\/$/, "")
    : "ChatNVM • Dumb Intelligence";
  ctx.textAlign = "right";
  ctx.fillStyle = isDark ? "#60a5fa" : "#2563eb";
  ctx.fillText(siteLabel, W - pad, footerY);
  ctx.textAlign = "left";

  canvas.toBlob(async (blob) => {
    if (!blob) return;
    const file = new File([blob], "chatnvm-roast.png", { type: "image/png" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "ChatNVM by Closed DI",
          text: "ChatNVM just roasted me 💀"
        });
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return;
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chatnvm-roast.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    showToast(toastMsg);
  }, "image/png");
}

function wrapCanvasText(ctx, text, maxWidth) {
  const paragraphs = String(text || "").split("\n");
  const lines = [];

  for (const para of paragraphs) {
    if (!para.trim()) {
      lines.push("");
      continue;
    }
    const words = para.split(" ");
    let current = "";

    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width <= maxWidth) {
        current = test;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
  }
  return lines.length ? lines : [""];
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function showToast(message) {
  let toast = document.getElementById("di-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "di-toast";
    toast.className = "fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-zinc-900 dark:bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs md:text-sm shadow-xl transition-opacity duration-200 pointer-events-none";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = "1";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.opacity = "0";
  }, 2400);
}

async function streamChars(el, text, baseSpeed) {
  const chars = Array.from(text);
  for (let i = 0; i < chars.length; i++) {
    el.textContent += chars[i];
    if (i % 5 === 0) scrollToBottom();
    await sleep(baseSpeed + Math.random() * 14);
  }
  scrollToBottom();
}

// --- 11. EVENTS ---
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
    trackEvent("language_changed", { lang: langSelect.value });
  });

  themeToggleBtn.addEventListener("click", toggleTheme);
  mobileMenuBtn.addEventListener("click", openMobileSidebar);
  closeSidebarBtn.addEventListener("click", closeMobileSidebar);
  sidebarBackdrop.addEventListener("click", closeMobileSidebar);

  if (upgradePlanBtn) upgradePlanBtn.addEventListener("click", openUpgradeModal);
  if (closeUpgradeBtn) closeUpgradeBtn.addEventListener("click", closeUpgradeModal);
  if (fakeSubscribeBtn) fakeSubscribeBtn.addEventListener("click", handleFakeSubscribe);
  if (upgradeModal) {
    upgradeModal.addEventListener("click", (e) => {
      if (e.target === upgradeModal) closeUpgradeModal();
    });
  }

  uploadBtn.addEventListener("click", () => imageUpload.click());
  imageUpload.addEventListener("change", handlePhotoUpload);

  newChatBtn.addEventListener("click", startNewChat);

  starterChipsContainer.addEventListener("click", (e) => {
    const chip = e.target.closest(".starter-chip");
    if (!chip) return;
    const prompt = chip.textContent.trim().replace(/^"|"$/g, "");
    handleSend(prompt);
  });
}

// --- HELPERS ---
function matchesTrigger(text, trigger) {
  const isAscii = /^[\x00-\x7F]+$/.test(trigger);
  if (isAscii) {
    return new RegExp(`\\b${escapeRegex(trigger)}\\b`, "i").test(text);
  }
  return text.includes(trigger);
}

function pickFresh(arr) {
  if (!arr || !arr.length) return "";
  const fresh = arr.filter(item => !recentlyUsed.includes(item));
  const pool = fresh.length ? fresh : arr;
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  recentlyUsed.push(chosen);
  if (recentlyUsed.length > 25) recentlyUsed.shift();
  return chosen;
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
