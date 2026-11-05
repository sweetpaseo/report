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
    if (res.serverUrl) {
      inputServerUrl.value = res.serverUrl;
    } else {
      inputServerUrl.value = "https://report.erihome.id";
    }

    if (res.staffToken && res.staffUser) {
      showActiveView(res);
    } else {
      showLoginView();
    }
  });

  // Helper to normalize server URL
  function normalizeUrl(url) {
    let clean = (url || "https://report.erihome.id").trim().replace(/\/+$/, "");
    if (clean.includes("report.erihome.id")) {
      clean = clean.replace(/^http:\/\//i, "https://");
      if (!clean.startsWith("https://")) clean = "https://" + clean;
    } else if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = (clean.includes("localhost") || clean.includes("127.0.0.1"))
        ? "http://" + clean
        : "https://" + clean;
    }
    return clean;
  }

  // Login handler
  btnLogin.addEventListener("click", async () => {
    let serverUrl = normalizeUrl(inputServerUrl.value);
    inputServerUrl.value = serverUrl;

    const email = inputEmail.value.trim().toLowerCase();
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
          loginError.textContent = response?.error || "Koneksi gagal. Pastikan URL dan kredensial benar.";
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
  selectClient.addEventListener("change", async (e) => {
    const clientId = e.target.value;
    await chrome.storage.local.set({ selectedClientId: clientId });
    validateDetectedProfileWithClient(clientId);
  });

  // Sync button handler
  btnSyncNow.addEventListener("click", async () => {
    btnSyncNow.disabled = true;
    btnSyncNow.textContent = "Menyinkronkan data...";
    setFeedback("Mengumpulkan data profil & postingan...", "info");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab || !activeTab.id) {
        setFeedback("Tab aktif tidak ditemukan.", "error");
        btnSyncNow.disabled = false;
        btnSyncNow.textContent = "⚡ Sinkronkan ke ACS Sekarang";
        return;
      }

      chrome.tabs.sendMessage(activeTab.id, { action: "COLLECT_PAGE_DATA" }, async (pageData) => {
        if (chrome.runtime.lastError || !pageData || !pageData.ok) {
          setFeedback("Buka halaman profil Instagram atau TikTok terlebih dahulu.", "error");
          btnSyncNow.disabled = false;
          btnSyncNow.textContent = "⚡ Sinkronkan ke ACS Sekarang";
          return;
        }

        chrome.storage.local.get(["selectedClientId"], (res) => {
          const clientId = res.selectedClientId;
          if (!clientId) {
            setFeedback("Pilih klien tujuan terlebih dahulu.", "error");
            btnSyncNow.disabled = false;
            btnSyncNow.textContent = "⚡ Sinkronkan ke ACS Sekarang";
            return;
          }

          // Send Sync Profile
          chrome.runtime.sendMessage(
            { action: "SYNC_PROFILE", payload: { clientId, ...pageData.profile } },
            (profileRes) => {
              if (!profileRes || profileRes.error) {
                setFeedback(`Gagal sinkronisasi profil: ${profileRes?.error || "Error"}`, "error");
                btnSyncNow.disabled = false;
                btnSyncNow.textContent = "⚡ Sinkronkan ke ACS Sekarang";
                return;
              }

              // Send Sync Posts
              chrome.runtime.sendMessage(
                {
                  action: "SYNC_POSTS",
                  payload: {
                    clientId,
                    platform: pageData.profile.platform,
                    posts: pageData.posts,
                  },
                },
                (postsRes) => {
                  btnSyncNow.disabled = false;
                  btnSyncNow.textContent = "⚡ Sinkronkan ke ACS Sekarang";

                  if (!postsRes || postsRes.error) {
                    setFeedback("Profil tersimpan, tetapi postingan gagal diunggah.", "warning");
                  } else {
                    setFeedback(
                      `Berhasil! Profil @${pageData.profile.username} dan ${postsRes.savedCount || pageData.posts.length} postingan tersinkronkan.`,
                      "success"
                    );
                  }
                }
              );
            }
          );
        });
      });
    });
  });

  // Open dashboard button
  btnOpenDashboard.addEventListener("click", () => {
    chrome.storage.local.get(["serverUrl"], (res) => {
      const url = `${normalizeUrl(res.serverUrl)}/dashboard`;
      chrome.tabs.create({ url });
    });
  });

  // State switch helpers
  function showLoginView() {
    loginSection.classList.remove("hidden");
    activeSection.classList.add("hidden");
    statusIndicator.className = "indicator offline";
  }

  function showActiveView(state) {
    loginSection.classList.add("hidden");
    activeSection.classList.remove("hidden");
    statusIndicator.className = "indicator online";

    if (state.staffUser) {
      labelStaffName.textContent = state.staffUser.name || "Staff";
      labelStaffEmail.textContent = state.staffUser.email || "";
    }

    // Populate clients
    selectClient.innerHTML = "";
    const clients = state.clientsList || [];
    if (clients.length === 0) {
      selectClient.innerHTML = '<option value="">Tidak ada klien ditugaskan</option>';
    } else {
      clients.forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = c.name;
        if (c.id === state.selectedClientId) opt.selected = true;
        selectClient.appendChild(opt);
      });
    }

    detectCurrentTab();
  }

  function detectCurrentTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.url) return;

      const url = tab.url;
      if (url.includes("instagram.com")) {
        badgePlatform.textContent = "Instagram";
        badgePlatform.className = "badge instagram";
      } else if (url.includes("tiktok.com")) {
        badgePlatform.textContent = "TikTok";
        badgePlatform.className = "badge tiktok";
      } else {
        badgePlatform.textContent = "Bukan Medsos";
        badgePlatform.className = "badge";
        labelDetectedUsername.textContent = "Halaman Tidak Didukung";
        labelDetectHint.textContent = "Buka akun Instagram atau TikTok klien untuk memulai.";
        return;
      }

      chrome.tabs.sendMessage(tab.id, { action: "DETECT_PROFILE" }, (response) => {
        if (chrome.runtime.lastError || !response || !response.username) {
          labelDetectedUsername.textContent = "Mencari profil di halaman...";
          labelDetectHint.textContent = "Pastikan Anda berada di halaman profil utama akun.";
        } else {
          labelDetectedUsername.textContent = `@${response.username}`;
          labelDetectHint.textContent = "Siap disinkronkan ke ACS.";
        }
      });
    });
  }

  function validateDetectedProfileWithClient(clientId) {
    chrome.storage.local.get(["clientsList"], (res) => {
      const client = (res.clientsList || []).find((c) => c.id === clientId);
      if (client && client.socialHandles) {
        // Optional hint if handle differs
      }
    });
  }

  function setFeedback(msg, type) {
    syncFeedback.textContent = msg;
    syncFeedback.className = `feedback ${type}`;
    syncFeedback.classList.remove("hidden");
  }
});
