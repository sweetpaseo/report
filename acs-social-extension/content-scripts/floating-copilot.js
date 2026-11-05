// ACS Social Assistant - Floating Copilot In-Page Widget

(function () {
  // Prevent duplicate injections
  if (document.getElementById("acs-floating-pill")) return;

  // 1. Create Floating Pill Button
  const pill = document.createElement("div");
  pill.id = "acs-floating-pill";
  pill.innerHTML = `<span>✨ ACS Copilot</span>`;
  document.body.appendChild(pill);

  // 2. Create Drawer
  const drawer = document.createElement("div");
  drawer.id = "acs-copilot-drawer";
  drawer.innerHTML = `
    <div class="acs-drawer-header">
      <div class="acs-drawer-title">
        <span>✨</span>
        <span>ACS Content Advisor</span>
      </div>
      <button class="acs-drawer-close" id="acs-close-drawer">&times;</button>
    </div>
    <div class="acs-drawer-content" id="acs-drawer-body">
      <div class="acs-card">
        <p style="font-size:11px; color:#64748b;">Memuat rekomendasi konten berbasis data Google Search Console...</p>
      </div>
    </div>
  `;
  document.body.appendChild(drawer);

  // Toggle drawer open/close
  pill.addEventListener("click", () => {
    drawer.classList.toggle("open");
    if (drawer.classList.contains("open")) {
      loadRecommendations();
    }
  });

  document.getElementById("acs-close-drawer").addEventListener("click", () => {
    drawer.classList.remove("open");
  });

  async function loadRecommendations() {
    const body = document.getElementById("acs-drawer-body");
    
    // Read selected client from storage
    chrome.storage.local.get(["selectedClientId", "staffToken"], (res) => {
      if (!res.staffToken || !res.selectedClientId) {
        body.innerHTML = `
          <div class="acs-card">
            <strong style="font-size:12px; color:#0f172a;">Belum Terhubung</strong>
            <p style="font-size:11px; color:#64748b; margin-top:4px;">Buka ikon ekstensi ACS di toolbar browser untuk login dan memilih klien.</p>
          </div>
        `;
        return;
      }

      chrome.runtime.sendMessage(
        { action: "GET_RECOMMENDATIONS", payload: { clientId: res.selectedClientId } },
        (response) => {
          if (chrome.runtime.lastError || !response || !response.ok) {
            body.innerHTML = `
              <div class="acs-card">
                <strong style="font-size:12px; color:#dc2626;">Gagal Memuat</strong>
                <p style="font-size:11px; color:#64748b; margin-top:4px;">${response?.error || "Pastikan server ACS berjalan."}</p>
              </div>
            `;
            return;
          }

          renderSuggestions(response);
        }
      );
    });
  }

  function renderSuggestions(data) {
    const body = document.getElementById("acs-drawer-body");
    const suggestions = data.suggestions || [];
    const bestTime = data.bestTimeToday;

    let html = `
      <div class="acs-card" style="background:#eff6ff; border-color:#bfdbfe;">
        <span class="acs-tag" style="background:#dbeafe; color:#1e40af;">🕒 Jam Tayang Terbaik Hari Ini</span>
        <strong style="font-size:12px; color:#1e3a8a; display:block; margin-top:4px;">${bestTime.day}</strong>
        <p style="font-size:11px; color:#3b82f6; margin-top:2px;">${bestTime.recommendedHours.join(" &bull; ")}</p>
      </div>

      <div style="font-size:11px; font-weight:800; text-transform:uppercase; color:#64748b; letter-spacing:0.5px;">
        Peluang Konten dari Pencarian Google
      </div>
    `;

    if (suggestions.length === 0) {
      html += `
        <div class="acs-card">
          <p style="font-size:11px; color:#64748b;">Belum ada kueri pencarian tersinkron untuk website klien ini.</p>
        </div>
      `;
    } else {
      suggestions.forEach((sug) => {
        html += `
          <div class="acs-card">
            <div class="acs-card-header">
              <span class="acs-tag">${sug.recommendedFormat}</span>
              <span style="font-size:10px; color:#10b981; font-weight:700;">${sug.searchVolume}</span>
            </div>
            <div class="acs-topic">Topik: ${sug.topic}</div>
            
            <div class="acs-hook-list">
              ${sug.hooks
                .map(
                  (h) => `
                <div class="acs-hook-item">
                  <span>${h}</span>
                  <button class="acs-hook-copy" data-hook="${encodeURIComponent(h)}">Salin Hook</button>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        `;
      });
    }

    body.innerHTML = html;

    // Attach click events for Copy Hook buttons
    body.querySelectorAll(".acs-hook-copy").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const text = decodeURIComponent(e.target.getAttribute("data-hook"));
        navigator.clipboard.writeText(text);
        const originalText = e.target.textContent;
        e.target.textContent = "Tersalin!";
        setTimeout(() => (e.target.textContent = originalText), 1500);
      });
    });
  }
})();

