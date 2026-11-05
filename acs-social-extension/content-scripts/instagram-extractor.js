// ACS Social Assistant - Content Script: Page Extractor

(function () {
  console.log("[ACS Extension] Extractor loaded on", window.location.hostname);

  // Listen for extraction requests from popup or floating widget
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "EXTRACT_PAGE_DATA") {
      try {
        const data = extractCurrentPageData();
        sendResponse(data);
      } catch (err) {
        sendResponse({ error: err.message });
      }
      return true;
    }
  });

  function extractCurrentPageData() {
    const host = window.location.hostname;
    if (host.includes("instagram.com")) {
      return extractInstagramData();
    } else if (host.includes("tiktok.com")) {
      return extractTikTokData();
    }
    throw new Error("Halaman ini bukan Instagram atau TikTok.");
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

  function extractInstagramData() {
    // 1. Get username from URL
    const match = window.location.pathname.match(/^\/([^/?#]+)/);
    const username = match ? match[1] : "";
    if (!username || ["direct", "explore", "reels", "stories"].includes(username)) {
      throw new Error("Silakan buka halaman profil Instagram klien (bukan feed beranda).");
    }

    // 2. Parse profile header metrics
    let postsCount = 0;
    let followersCount = 0;
    let followingCount = 0;
    let fullName = "";
    let bio = "";
    let profilePicUrl = "";

    // Header stats usually appear in a list or span
    const listItems = document.querySelectorAll("header section ul li, header ul li");
    if (listItems.length >= 3) {
      postsCount = parseCount(listItems[0].textContent);
      followersCount = parseCount(listItems[1].textContent);
      followingCount = parseCount(listItems[2].textContent);
    } else {
      // Fallback selector via title / aria-label
      const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute("content") || "";
      const metaMatch = metaDesc.match(/([0-9.,KkMm]+)\s+Followers,\s+([0-9.,KkMm]+)\s+Following,\s+([0-9.,KkMm]+)\s+Posts/i);
      if (metaMatch) {
        followersCount = parseCount(metaMatch[1]);
        followingCount = parseCount(metaMatch[2]);
        postsCount = parseCount(metaMatch[3]);
      }
    }

    // Full name and bio
    const headerEl = document.querySelector("header");
    if (headerEl) {
      const bioEl = headerEl.querySelector("h1, h2");
      if (bioEl) fullName = bioEl.textContent || "";
      const bioTextEl = headerEl.querySelector("header section > div:last-child");
      if (bioTextEl) bio = bioTextEl.textContent || "";

      const imgEl = headerEl.querySelector("img");
      if (imgEl) profilePicUrl = imgEl.src || "";
    }

    // 3. Parse visible post cards on the grid
    const posts = [];
    const postLinks = document.querySelectorAll('a[href^="/p/"], a[href^="/reel/"]');
    const seenIds = new Set();

    postLinks.forEach((a) => {
      const href = a.getAttribute("href") || "";
      const pMatch = href.match(/\/(p|reel)\/([^/?#]+)/);
      if (!pMatch) return;
      const postId = pMatch[2];
      if (seenIds.has(postId)) return;
      seenIds.add(postId);

      const img = a.querySelector("img");
      const caption = img ? img.getAttribute("alt") || "" : "";
      const thumbnailUrl = img ? img.src || "" : "";
      const mediaType = href.includes("/reel/") ? "reel" : "photo";

      // Check aria-labels for likes/comments if available
      let likes = 0;
      let comments = 0;
      const aria = a.getAttribute("aria-label") || "";
      const likesMatch = aria.match(/([0-9.,KkMm]+)\s*(suka|likes)/i);
      const commentsMatch = aria.match(/([0-9.,KkMm]+)\s*(komentar|comments)/i);
      if (likesMatch) likes = parseCount(likesMatch[1]);
      if (commentsMatch) comments = parseCount(commentsMatch[1]);

      posts.push({
        postId,
        postUrl: `https://www.instagram.com${href}`,
        caption: caption.slice(0, 300),
        mediaType,
        thumbnailUrl,
        likesCount: likes,
        commentsCount: comments,
        sharesCount: 0,
        postedAt: new Date().toISOString(),
      });
    });

    return {
      platform: "instagram",
      username,
      fullName,
      followersCount,
      followingCount,
      postsCount: postsCount || posts.length,
      bio,
      profilePicUrl,
      posts: posts.slice(0, 24),
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
      platform: "tiktok",
      username,
      fullName: username,
      followersCount,
      followingCount,
      postsCount: 0,
      bio: "",
      profilePicUrl: "",
      posts: [],
    };
  }
})();

