// ACS Social Assistant - Content Script: Page Extractor

(function () {
  console.log("[ACS Extension] Extractor loaded on", window.location.hostname);

  // Listen for messages from popup or background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "DETECT_PROFILE") {
      try {
        const info = detectCurrentProfile();
        sendResponse(info);
      } catch (err) {
        sendResponse({ error: err.message });
      }
      return true;
    }

    if (request.action === "COLLECT_PAGE_DATA" || request.action === "EXTRACT_PAGE_DATA") {
      try {
        const data = extractCurrentPageData();
        sendResponse(data);
      } catch (err) {
        sendResponse({ ok: false, error: err.message });
      }
      return true;
    }
  });

  function detectCurrentProfile() {
    const host = window.location.hostname;
    if (host.includes("instagram.com")) {
      const username = getInstagramUsername();
      if (!username) {
        return { ok: false, error: "Buka halaman profil Instagram akun klien." };
      }
      return { ok: true, platform: "instagram", username };
    }

    if (host.includes("tiktok.com")) {
      const match = window.location.pathname.match(/^\/@([^/?#]+)/);
      const username = match ? match[1] : "";
      if (!username) {
        return { ok: false, error: "Buka halaman profil TikTok akun klien." };
      }
      return { ok: true, platform: "tiktok", username };
    }

    return { ok: false, error: "Halaman bukan Instagram atau TikTok." };
  }

  function getInstagramUsername() {
    // 1. From Pathname
    const pathname = window.location.pathname;
    const match = pathname.match(/^\/([^/?#]+)/);
    const candidate = match ? match[1].trim() : "";
    const reserved = [
      "direct", "explore", "reels", "stories", "p", "reel",
      "accounts", "emails", "about", "legal", "terms", "privacy", ""
    ];

    if (candidate && !reserved.includes(candidate.toLowerCase())) {
      return candidate;
    }

    // 2. From Document Title
    const titleMatch = document.title.match(/@([a-zA-Z0-9._]+)/);
    if (titleMatch) return titleMatch[1];

    // 3. From header h2 / h1
    const headerHeading = document.querySelector("header h2, header h1, section h2");
    if (headerHeading && headerHeading.textContent) {
      const clean = headerHeading.textContent.trim();
      if (clean && !clean.includes(" ") && clean.length > 2) {
        return clean;
      }
    }

    return "";
  }

  function parseCount(text) {
    if (!text) return 0;
    const clean = text.toLowerCase().replace(/,/g, "").trim();
    if (clean.includes("k") || clean.includes("rb")) {
      return Math.round(parseFloat(clean) * 1000);
    }
    if (clean.includes("m") || clean.includes("jt")) {
      return Math.round(parseFloat(clean) * 1000000);
    }
    const num = parseInt(clean.replace(/[^0-9]/g, ""), 10);
    return isNaN(num) ? 0 : num;
  }

  function extractCurrentPageData() {
    const host = window.location.hostname;
    if (host.includes("instagram.com")) {
      return extractInstagramData();
    } else if (host.includes("tiktok.com")) {
      return extractTikTokData();
    }
    throw new Error("Halaman ini bukan Instagram atau TikTok.");
  }

  function extractInstagramData() {
    const username = getInstagramUsername();
    if (!username) {
      throw new Error("Silakan buka halaman profil Instagram klien (misal: instagram.com/erihome.id/).");
    }

    const headerEl = document.querySelector("header") || document.querySelector("main");
    const headerText = headerEl ? headerEl.innerText : document.body.innerText;

    // Parse counts using robust text matching
    let postsCount = 0;
    let followersCount = 0;
    let followingCount = 0;

    const postsMatch = headerText.match(/([\d.,kKmM]+)\s*(posts|kiriman|postingan)/i);
    if (postsMatch) postsCount = parseCount(postsMatch[1]);

    const followersMatch = headerText.match(/([\d.,kKmM]+)\s*(followers|pengikut)/i);
    if (followersMatch) followersCount = parseCount(followersMatch[1]);

    const followingMatch = headerText.match(/([\d.,kKmM]+)\s*(following|mengikuti)/i);
    if (followingMatch) followingCount = parseCount(followingMatch[1]);

    // Fallback: meta tags
    if (!followersCount) {
      const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute("content") || "";
      const metaMatch = metaDesc.match(/([0-9.,KkMm]+)\s+Followers,\s+([0-9.,KkMm]+)\s+Following,\s+([0-9.,KkMm]+)\s+Posts/i);
      if (metaMatch) {
        followersCount = parseCount(metaMatch[1]);
        followingCount = parseCount(metaMatch[2]);
        postsCount = parseCount(metaMatch[3]);
      }
    }

    // Full name, Bio, Avatar
    let fullName = "";
    let bio = "";
    let profilePicUrl = "";

    if (headerEl) {
      // Fullname usually in section next to h2 or first div with text
      const nameEl = headerEl.querySelector("header section span, header section h1");
      if (nameEl) fullName = nameEl.textContent?.trim() || "";

      // Bio text
      const bioEl = headerEl.querySelector("header section > div > span, header section > div:last-child");
      if (bioEl) bio = bioEl.textContent?.trim() || "";

      // Avatar
      const img = headerEl.querySelector('img[alt*="profile"], img[alt*="profil"], header img');
      if (img) profilePicUrl = img.src || "";
    }

    // Parse visible posts
    const posts = [];
    const postLinks = document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]');
    const seenIds = new Set();

    postLinks.forEach((a) => {
      const href = a.getAttribute("href") || "";
      const pMatch = href.match(/\/(p|reel)\/([^/?#]+)/);
      if (!pMatch) return;
      const postId = pMatch[2];
      if (seenIds.has(postId)) return;
      seenIds.add(postId);

      const fullUrl = href.startsWith("http") ? href : `https://www.instagram.com${href}`;
      const img = a.querySelector("img");
      const caption = img ? img.getAttribute("alt") || "" : "";
      const thumb = img ? img.getAttribute("src") || "" : "";

      // Likes/comments/views in overlay or grid card
      let likes = 0;
      let comments = 0;

      // 1. Check Instagram overlay items (ul > li: first is like, second is comment)
      const statItems = a.querySelectorAll("ul > li, div > ul > li, li");
      if (statItems && statItems.length >= 1) {
        statItems.forEach((li, idx) => {
          const rawText = (li.innerText || li.getAttribute("aria-label") || "").trim();
          const count = parseCount(rawText);
          if (idx === 0) likes = count;
          if (idx === 1) comments = count;
        });
      }

      // 2. Check inner text tokens (e.g. "4\n2" or "4 2")
      if (likes === 0 && comments === 0) {
        const rawInner = (a.innerText || "").trim();
        const tokens = rawInner.split(/[\s\n\r]+/).filter(Boolean);
        const numbersFound = [];
        for (const t of tokens) {
          const cleanToken = t.replace(/[^0-9.,kKmM]/g, "");
          if (cleanToken && /\d/.test(cleanToken)) {
            const val = parseCount(cleanToken);
            if (val > 0) numbersFound.push(val);
          }
        }
        if (numbersFound.length >= 2) {
          likes = numbersFound[0];
          comments = numbersFound[1];
        } else if (numbersFound.length === 1) {
          likes = numbersFound[0];
        }
      }

      // 3. Fallback: Check aria-labels or title attributes
      if (likes === 0) {
        const ariaEls = a.querySelectorAll("[aria-label]");
        ariaEls.forEach((el) => {
          const aria = el.getAttribute("aria-label") || "";
          if (/suka|like/i.test(aria)) {
            const m = aria.match(/([\d.,kKmM]+)/);
            if (m) likes = parseCount(m[1]);
          } else if (/komentar|comment/i.test(aria)) {
            const m = aria.match(/([\d.,kKmM]+)/);
            if (m) comments = parseCount(m[1]);
          }
        });
      }

      posts.push({
        postId,
        postUrl: fullUrl,
        caption: caption.slice(0, 1000),
        mediaType: pMatch[1] === "reel" ? "reel" : "image",
        thumbnailUrl: thumb,
        likesCount: likes,
        commentsCount: comments,
        sharesCount: 0,
        postedAt: new Date().toISOString(),
      });
    });

    return {
      ok: true,
      profile: {
        platform: "instagram",
        username,
        fullName: fullName || username,
        followersCount,
        followingCount,
        postsCount: postsCount || posts.length,
        bio: bio.slice(0, 500),
        profilePicUrl,
      },
      posts: posts.slice(0, 30),
    };
  }

  function extractTikTokData() {
    const match = window.location.pathname.match(/^\/@([^/?#]+)/);
    const username = match ? match[1] : "";
    if (!username) throw new Error("Buka halaman profil TikTok klien.");

    let followersCount = 0;
    let followingCount = 0;
    let likesCount = 0;

    const countEls = document.querySelectorAll('[data-e2e="followers-count"], [data-e2e="following-count"], [data-e2e="likes-count"]');
    if (countEls.length >= 3) {
      followingCount = parseCount(countEls[0].textContent);
      followersCount = parseCount(countEls[1].textContent);
      likesCount = parseCount(countEls[2].textContent);
    }

    return {
      ok: true,
      profile: {
        platform: "tiktok",
        username,
        fullName: username,
        followersCount,
        followingCount,
        postsCount: 0,
        bio: "",
        profilePicUrl: "",
      },
      posts: [],
    };
  }
})();
