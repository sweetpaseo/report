// ACS Social Assistant - Background Service Worker (Manifest V3)

chrome.runtime.onInstalled.addListener(() => {
  console.log("[ACS Extension] Installed successfully.");
  chrome.storage.local.get(["serverUrl"], (res) => {
    if (!res.serverUrl) {
      chrome.storage.local.set({ serverUrl: "https://report.erihome.id" });
    }
  });
});

// Handle messages from Popup or Content Scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "LOGIN") {
    handleLogin(request.payload).then(sendResponse).catch((err) => sendResponse({ error: err.message }));
    return true; // Keep message channel open for async response
  }

  if (request.action === "SYNC_PROFILE") {
    handleSyncProfile(request.payload).then(sendResponse).catch((err) => sendResponse({ error: err.message }));
    return true;
  }

  if (request.action === "SYNC_POSTS") {
    handleSyncPosts(request.payload).then(sendResponse).catch((err) => sendResponse({ error: err.message }));
    return true;
  }

  if (request.action === "GET_RECOMMENDATIONS") {
    handleGetRecommendations(request.payload).then(sendResponse).catch((err) => sendResponse({ error: err.message }));
    return true;
  }
});

function cleanServerUrl(rawUrl) {
  let url = (rawUrl || "https://report.erihome.id").trim().replace(/\/+$/, "");
  if (url.includes("report.erihome.id")) {
    url = url.replace(/^http:\/\//i, "https://");
    if (!url.startsWith("https://")) url = "https://" + url;
  } else if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = (url.includes("localhost") || url.includes("127.0.0.1"))
      ? "http://" + url
      : "https://" + url;
  }
  return url;
}

async function getServerConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["serverUrl", "staffToken"], (res) => {
      resolve({
        serverUrl: cleanServerUrl(res.serverUrl),
        staffToken: res.staffToken || "",
      });
    });
  });
}

async function handleLogin({ email, password, serverUrl }) {
  const targetServer = cleanServerUrl(serverUrl);
  const url = `${targetServer}/api/extension/auth`;

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
        deviceName: "Chrome Extension",
      }),
    });
  } catch (err) {
    throw new Error(`Koneksi gagal (${err.message}). Pastikan server ${targetServer} dapat diakses.`);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Gagal masuk ke server ACS. Periksa email atau password.");
  }

  // Save token and server URL
  await chrome.storage.local.set({
    serverUrl: targetServer,
    staffToken: data.token,
    staffUser: data.staff,
    clientsList: data.clients,
    selectedClientId: data.clients[0]?.id || null,
  });

  return { ok: true, staff: data.staff, clients: data.clients };
}

async function handleSyncProfile(payload) {
  const { serverUrl, staffToken } = await getServerConfig();
  if (!staffToken) throw new Error("Staff belum login ke ekstensi.");

  const url = `${serverUrl}/api/extension/sync-profile`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${staffToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Gagal sinkronkan profil.");
  return data;
}

async function handleSyncPosts(payload) {
  const { serverUrl, staffToken } = await getServerConfig();
  if (!staffToken) throw new Error("Staff belum login ke ekstensi.");

  const url = `${serverUrl}/api/extension/sync-posts`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${staffToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Gagal sinkronkan postingan.");
  return data;
}

async function handleGetRecommendations({ clientId }) {
  const { serverUrl, staffToken } = await getServerConfig();
  if (!staffToken) throw new Error("Staff belum login.");

  const url = `${serverUrl}/api/extension/content-recommendations?clientId=${encodeURIComponent(clientId)}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${staffToken}` },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Gagal mengambil rekomendasi.");
  return data;
}
