const INSTAGRAM_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/**
 * Decodes an Instagram shortcode (Snowflake 64-bit ID) into exact publication Date.
 * Works for both /p/{shortcode}/ and /reel/{shortcode}/ URLs.
 */
export function decodeInstagramShortcodeDate(shortcode: string): Date | null {
  if (!shortcode || typeof shortcode !== "string") return null;
  const clean = shortcode.trim();
  try {
    let id = 0n;
    for (let i = 0; i < clean.length; i++) {
      const idx = INSTAGRAM_ALPHABET.indexOf(clean[i]);
      if (idx === -1) return null;
      id = id * 64n + BigInt(idx);
    }
    // Instagram epoch is 1314220021721ms (~24 Aug 2011)
    // 41 bits timestamp offset: (id >> 23n) + epoch
    const timestamp = (id >> 23n) + 1314220021721n;
    const date = new Date(Number(timestamp));
    if (isNaN(date.getTime()) || date.getFullYear() < 2011 || date.getFullYear() > 2035) {
      return null;
    }
    return date;
  } catch {
    return null;
  }
}

/**
 * Decodes a TikTok video ID (64-bit Snowflake timestamp) into exact publication Date.
 * TikTok 64-bit ID: upper 32 bits represent Unix timestamp in seconds.
 */
export function decodeTikTokIdDate(videoId: string): Date | null {
  if (!videoId || typeof videoId !== "string") return null;
  const clean = videoId.trim();
  if (!/^\d{16,21}$/.test(clean)) return null;
  try {
    const id = BigInt(clean);
    const unixSeconds = Number(id >> 32n);
    const date = new Date(unixSeconds * 1000);
    if (isNaN(date.getTime()) || date.getFullYear() < 2016 || date.getFullYear() > 2035) {
      return null;
    }
    return date;
  } catch {
    return null;
  }
}

/**
 * Resolves the real original publication date of a social post.
 */
export function resolvePostDate(platform: string, postId: string, fallbackDate?: string | null): string {
  const p = platform.toLowerCase();
  if (p === "instagram") {
    const decoded = decodeInstagramShortcodeDate(postId);
    if (decoded) {
      return decoded.toISOString();
    }
  } else if (p === "tiktok") {
    const decoded = decodeTikTokIdDate(postId);
    if (decoded) {
      return decoded.toISOString();
    }
  }

  if (fallbackDate && !isNaN(new Date(fallbackDate).getTime())) {
    return new Date(fallbackDate).toISOString();
  }
  return new Date().toISOString();
}

