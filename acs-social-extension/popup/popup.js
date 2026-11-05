// ACS Social Assistant - Popup Script

document.addEventListener("DOMContentLoaded", async () => {
  const loginSection = document.getElementById("loginSection");
  const activeSection = document.getElementById("activeSection");
  const statusIndicator = document.getElementById("statusIndicator");

  const inputServerUrl = document.getElementById("inputServerUrl");
  const inputEmail = document.getElementById("inputEmail");
  const inputPassword = document.getElementById("inputPassword");
  const btnLogin = document.getElementById("btnLogin");
  const loginError = document.getElementById("loginError");

  const labelStaffName = document.getElementById("labelStaffName");
  const labelStaffEmail = document.getElementById("labelStaffEmail");
  const btnLogout = document.getElementById("btnLogout");
  const selectClient = document.getElementById("selectClient");
  const labelDetectedUsername = document.getElementById("labelDetectedUsername");
  const labelDetectHint = document.getElementById("labelDetectHint");
  const badgePlatform = document.getElementById("badgePlatform");

  const btnSyncNow = document.getElementById("btnSyncNow");
  const btnOpenDashboard = document.getElementById("btnOpenDashboard");
  const syncFeedback = document.getElementById("syncFeedback");

  // Load existing session state
  chrome.storage.local.get(["serverUrl", "staffToken", "staffUser", "clientsList", "selectedClientId"], (res) => {
    if (res.serverUrl) inputServerUrl.value = res.serverUrl;

    if (res.staffToken && res.staffUser) {
      showActiveView(res);
    } else {
      showLoginView();
    }
  });

  // Login handler
  btnLogin.addEventListener("click", async () => {
    const serverUrl = inputServerUrl.value.trim() || "http://localhost:3000";
    const email = inputEmail.value.trim();
    const password = inputPassword.value;

    if (!email || !password) {
      loginError.textContent = "Email dan password wajib diisi.";
      return;
    }

    btnLogin.disabled = true;
    btnLogin.textContent = "Memverifikasi...";
    loginError.textContent = "";

    chrome.runtime.sendMessage(
      { action: "LOGIN", payload: { serverUrl, email, password } },
      (response) => {
        btnLogin.disabled = false;
        btnLogin.textContent = "Hubungkan ke ACS";

        if (response && response.ok) {
          chrome.storage.local.get(null, (res) => showActiveView(res));
        } else {
          loginError.textContent = response?.error || "Koneksi gagal.";
        }
      }
    );
  });

  // Logout handler
  btnLogout.addEventListener("click", async () => {
    await chrome.storage.local.remove(["staffToken", "staffUser", "clientsList", "selectedClientId"]);
    showLoginView();
  });

  // Change client handler
  selectClient.addEventListener("change", () => {
    const selectedId = selectClient.value;
    chrome.storage.local.set({ selectedClientId: selectedId });
  });

  // Open Dashboard handler
  btnOpenDashboard.addEventListener("click", () => {
    chrome.storage.local.get(["serverUrl"], (res) => {
      const url = `${res.serverUrl || "http://localhost:3000"}/dashboard`;
      chrome.tabs.create({ url });
    });
  });

  // Sync Now handler
  btnSyncNow.addEventListener("click", async () => {
    syncFeedback.className = "feedback-msg";
    syncFeedback.style.display = "none";

    const clientId = selectClient.value;
    if (!clientId) {
      showFeedback("Pilih target klien terlebih dahulu.", "error");
      return;
    }

    btnSyncNow.disabled = true;
    btnSyncNow.textContent = "Menyerap data dari halaman...";

    // Ask active tab content script to extract data
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      btnSyncNow.disabled = false;
      btnSyncNow.textContent = "⚡ Sinkronkan ke ACS";
      showFeedback("Tab aktif tidak ditemukan.", "error");
      return;
    }

    chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_PAGE_DATA" }, async (extractRes) => {
      if (chrome.runtime.lastError || !extractRes) {
        btnSyncNow.disabled = false;
        btnSyncNow.textContent = "⚡ Sinkronkan ke ACS";
        showFeedback("Buka halaman profil Instagram atau TikTok terlebih dahulu.", "error");
        return;
      }

      try {
        btnSyncNow.textContent = "Mengirim ke server ACS...";

        // 1. Sync Profile Snapshot
        await sendMessagePromise({
          action: "SYNC_PROFILE",
          payload: {
            clientId,
            platform: extractRes.platform || "instagram",
            username: extractRes.username,
            fullName: extractRes.fullName,
            followersCount: extractRes.followersCount,
            followingCount: extractRes.followingCount,
            postsCount: extractRes.postsCount,
            bio: extractRes.bio,
            profilePicUrl: extractRes.profilePicUrl,
          },
        });

        // 2. Sync Posts if available
        let postsCount = 0;
        if (extractRes.posts && extractRes.posts.length > 0) {
          const postsRes = await sendMessagePromise({
            action: "SYNC_POSTS",
            payload: {
              clientId,
              platform: extractRes.platform || "instagram",
              posts: extractRes.posts,
            },
          });
          postsCount = postsRes.count || extractRes.posts.length;
        }

        btnSyncNow.disabled = false;
        btnSyncNow.textContent = "⚡ Sinkronkan ke ACS";
        showFeedback(`✓ Berhasil! Profil @${extractRes.username} & ${postsCount} postingan tersimpan.`, "success");
      } catch (err) {
        btnSyncNow.disabled = false;
        btnSyncNow.textContent = "⚡ Sinkronkan ke ACS";
        showFeedback(err.message || "Gagal sinkronisasi data.", "error");
      }
    });
  });

  function showLoginView() {
    loginSection.classList.remove("hidden");
    activeSection.classList.add("hidden");
    statusIndicator.className = "indicator offline";
  }

  function showActiveView(data) {
    loginSection.classList.add("hidden");
    activeSection.classList.remove("hidden");
    statusIndicator.className = "indicator online";

    if (data.staffUser) {
      labelStaffName.textContent = data.staffUser.name;
      labelStaffEmail.textContent = data.staffUser.email;
    }

    // Populate clients
    selectClient.innerHTML = "";
    const clients = data.clientsList || [];
    if (clients.length === 0) {
      selectClient.innerHTML = '<option value="">Belum ada klien ditugaskan</option>';
    } else {
      clients.forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = c.name;
        if (c.id === data.selectedClientId) opt.selected = true;
        selectClient.appendChild(opt);
      });
    }

    // Inspect active tab
    detectActiveTabInfo();
  }

  async function detectActiveTabInfo() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) return;

    if (tab.url.includes("instagram.com")) {
      badgePlatform.textContent = "Instagram";
      const match = tab.url.match(/instagram\.com\/([^/?#]+)/);
      if (match && !["direct", "explore", "reels", "stories"].includes(match[1])) {
        labelDetectedUsername.textContent = `@${match[1]}`;
        labelDetectHint.textContent = "Halaman profil terdeteksi & siap disinkronkan.";
      } else {
        labelDetectedUsername.textContent = "Buka Profil Klien";
        labelDetectHint.textContent = "Buka halaman profil (misal: instagram.com/nama_klien)";
      }
    } else if (tab.url.includes("tiktok.com")) {
      badgePlatform.textContent = "TikTok";
      const match = tab.url.match(/tiktok\.com\/@([^/?#]+)/);
      if (match) {
        labelDetectedUsername.textContent = `@${match[1]}`;
        labelDetectHint.textContent = "Halaman profil TikTok terdeteksi.";
      } else {
        labelDetectedUsername.textContent = "Buka Profil TikTok";
        labelDetectHint.textContent = "Buka halaman profil (misal: tiktok.com/@nama_klien)";
      }
    } else {
      badgePlatform.textContent = "Lainnya";
      labelDetectedUsername.textContent = "Buka Instagram / TikTok";
      labelDetectHint.textContent = "Ekstensi aktif otomatis saat Anda membuka IG atau TikTok.";
    }
  }

  function showFeedback(msg, type) {
    syncFeedback.textContent = msg;
    syncFeedback.className = `feedback-msg ${type}`;
    syncFeedback.style.display = "block";
  }

  function sendMessagePromise(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (res) => {
        if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
        if (res && res.error) return reject(new Error(res.error));
        resolve(res);
      });
    });
  }
});

