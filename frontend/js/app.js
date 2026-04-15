// ─── Config ────────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:8080/api/v1"; // ← change to your server URL

// ─── State ─────────────────────────────────────────────────────────────────
let token = localStorage.getItem("snip_token") || null;
let user  = JSON.parse(localStorage.getItem("snip_user") || "null");
let history = JSON.parse(localStorage.getItem("snip_history") || "[]");

// ─── DOM Refs ───────────────────────────────────────────────────────────────
const authScreen      = document.getElementById("auth-screen");
const dashScreen      = document.getElementById("dashboard-screen");

// Auth
const tabs            = document.querySelectorAll(".tab");
const loginForm       = document.getElementById("login-form");
const registerForm    = document.getElementById("register-form");
const loginBtn        = document.getElementById("login-btn");
const registerBtn     = document.getElementById("register-btn");
const loginError      = document.getElementById("login-error");
const registerError   = document.getElementById("register-error");

// Dashboard
const headerUsername  = document.getElementById("header-username");
const logoutBtn       = document.getElementById("logout-btn");
const originalUrl     = document.getElementById("original-url");
const customCode      = document.getElementById("custom-code");
const expiryInput     = document.getElementById("expiry");
const shortenBtn      = document.getElementById("shorten-btn");
const shortenError    = document.getElementById("shorten-error");
const resultBox       = document.getElementById("result-box");
const shortUrlLink    = document.getElementById("short-url-link");
const resultOriginal  = document.getElementById("result-original-url");
const copyBtn         = document.getElementById("copy-btn");
const historyList     = document.getElementById("history-list");
const historyCount    = document.getElementById("history-count");
const clearHistoryBtn = document.getElementById("clear-history-btn");

// ─── Init ────────────────────────────────────────────────────────────────────
function init() {
  if (token && user) {
    showDashboard();
  } else {
    showAuth();
  }
}

// ─── Screen Switchers ────────────────────────────────────────────────────────
function showAuth() {
  authScreen.classList.add("active");
  dashScreen.classList.remove("active");
}

function showDashboard() {
  authScreen.classList.remove("active");
  dashScreen.classList.add("active");
  headerUsername.textContent = user?.username || "";
  renderHistory();
}

// ─── Tab Switching ───────────────────────────────────────────────────────────
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    loginForm.classList.remove("active");
    registerForm.classList.remove("active");
    clearErrors();
    if (tab.dataset.tab === "login") {
      loginForm.classList.add("active");
    } else {
      registerForm.classList.add("active");
    }
  });
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
function showError(el, msg) {
  el.textContent = msg;
  el.classList.remove("hidden");
}

function clearErrors() {
  [loginError, registerError, shortenError].forEach(el => {
    el.classList.add("hidden");
    el.textContent = "";
  });
}

function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.style.opacity = loading ? ".6" : "1";
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

// ─── Auth: Register ──────────────────────────────────────────────────────────
registerBtn.addEventListener("click", async () => {
  clearErrors();
  const username = document.getElementById("reg-username").value.trim();
  const email    = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;

  if (!username || !email || !password) {
    return showError(registerError, "All fields are required.");
  }

  setLoading(registerBtn, true);
  try {
    const { ok, data } = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });

    if (!ok) {
      return showError(registerError, data.message || "Registration failed.");
    }

    // Auto-switch to login after success
    document.querySelector('.tab[data-tab="login"]').click();
    document.getElementById("login-email").value = email;
  } catch {
    showError(registerError, "Network error. Is the server running?");
  } finally {
    setLoading(registerBtn, false);
  }
});

// ─── Auth: Login ─────────────────────────────────────────────────────────────
loginBtn.addEventListener("click", async () => {
  clearErrors();
  const email    = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    return showError(loginError, "Email and password are required.");
  }

  setLoading(loginBtn, true);
  try {
    const { ok, data } = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!ok) {
      return showError(loginError, data.message || "Login failed.");
    }

    token = data.token;
    user  = data.data;
    localStorage.setItem("snip_token", token);
    localStorage.setItem("snip_user", JSON.stringify(user));
    showDashboard();
  } catch {
    showError(loginError, "Network error. Is the server running?");
  } finally {
    setLoading(loginBtn, false);
  }
});

// Enter key support for auth forms
document.getElementById("login-password").addEventListener("keydown", e => {
  if (e.key === "Enter") loginBtn.click();
});
document.getElementById("reg-password").addEventListener("keydown", e => {
  if (e.key === "Enter") registerBtn.click();
});

// ─── Logout ──────────────────────────────────────────────────────────────────
logoutBtn.addEventListener("click", () => {
  token = null;
  user  = null;
  localStorage.removeItem("snip_token");
  localStorage.removeItem("snip_user");
  resultBox.classList.add("hidden");
  showAuth();
});

// ─── Shorten ─────────────────────────────────────────────────────────────────
shortenBtn.addEventListener("click", async () => {
  clearErrors();
  const url    = originalUrl.value.trim();
  const code   = customCode.value.trim() || undefined;
  const expiry = expiryInput.value || null;

  if (!url) {
    return showError(shortenError, "Original URL is required.");
  }

  try { new URL(url); }
  catch { return showError(shortenError, "Please enter a valid URL (include https://)."); }

  setLoading(shortenBtn, true);
  try {
    const { ok, data } = await apiFetch("/url/shorten", {
      method: "POST",
      body: JSON.stringify({
        originalUrl: url,
        shortCode: code,
        expiry: expiry ? new Date(expiry).toISOString() : null,
      }),
    });

    if (!ok) {
      return showError(shortenError, data.message || "Failed to shorten URL.");
    }

    const shortUrl = data.data.shortURL;

    // Show result
    shortUrlLink.textContent = shortUrl;
    shortUrlLink.href        = shortUrl;
    resultOriginal.textContent = url;
    resultBox.classList.remove("hidden");

    // Add to local history
    history.unshift({
      shortUrl,
      originalUrl: url,
      createdAt: new Date().toISOString(),
      expiry: expiry || null,
    });
    if (history.length > 50) history.pop();
    localStorage.setItem("snip_history", JSON.stringify(history));
    renderHistory();

    // Clear form
    originalUrl.value = "";
    customCode.value  = "";
    expiryInput.value = "";
  } catch {
    showError(shortenError, "Network error. Is the server running?");
  } finally {
    setLoading(shortenBtn, false);
  }
});

// ─── Copy Button (result box) ─────────────────────────────────────────────────
copyBtn.addEventListener("click", () => {
  copyToClipboard(shortUrlLink.textContent, copyBtn);
});

function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const originalHTML = btn.innerHTML;
    btn.classList.add("copied");
    btn.querySelector("span") && (btn.querySelector("span").textContent = "Copied!");
    setTimeout(() => {
      btn.classList.remove("copied");
      btn.innerHTML = originalHTML;
    }, 2000);
  });
}

// ─── History ──────────────────────────────────────────────────────────────────
function renderHistory() {
  historyCount.textContent = history.length || "";

  if (!history.length) {
    historyList.innerHTML = `<div class="empty-state">No links yet. Shorten one above.</div>`;
    return;
  }

  historyList.innerHTML = history.map((item, idx) => {
    const date    = new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    const expired = item.expiry && new Date(item.expiry) < new Date();
    return `
      <div class="history-item">
        <div class="history-item-left">
          <a class="hi-short" href="${item.shortUrl}" target="_blank">${item.shortUrl}</a>
          <div class="hi-original">${item.originalUrl}</div>
        </div>
        <div class="history-item-right">
          <div class="hi-meta">
            ${date}
            ${item.expiry ? `<br/><span style="color:${expired ? "var(--error)" : "var(--muted)"}">
              ${expired ? "Expired" : "Expires " + new Date(item.expiry).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}
            </span>` : ""}
          </div>
          <button class="hi-copy-btn" data-url="${item.shortUrl}" title="Copy">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>
      </div>
    `;
  }).join("");

  // Attach copy handlers
  historyList.querySelectorAll(".hi-copy-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      copyToClipboard(btn.dataset.url, btn);
    });
  });
}

clearHistoryBtn.addEventListener("click", () => {
  if (!history.length) return;
  history = [];
  localStorage.setItem("snip_history", "[]");
  resultBox.classList.add("hidden");
  renderHistory();
});

// ─── Start ───────────────────────────────────────────────────────────────────
init();
