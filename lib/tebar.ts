const TEBAR_API_BASE = "https://api.tebar.app/v1";

function getApiKey(): string {
  const key = process.env.TEBAR_API_KEY?.trim();
  if (!key) {
    throw new Error("TEBAR_API_KEY is not configured in environment variables.");
  }
  return key;
}

async function tebarFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const apiKey = getApiKey();
  const url = endpoint.startsWith("http") ? endpoint : `${TEBAR_API_BASE}${endpoint}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error?.message || `Tebar API Error: ${response.status} ${response.statusText}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export interface TebarUser {
  id: string;
  email: string;
  name: string;
  mode: string;
}

export interface TebarAccount {
  id: string;
  platform: string;
  platform_account_id?: string;
  name: string;
  username?: string;
  profile_picture?: string;
  profile_id?: string;
  connected_at?: string;
  status?: string;
}

export interface TebarProfile {
  id: string;
  name: string;
  external_id: string | null;
  is_default: boolean;
  created_at: string;
}

export interface ConnectLinkResponse {
  url: string;
  profile_id: string;
  expires_at: string;
}

export interface TebarPost {
  id: string;
  content: string;
  status: "draft" | "scheduled" | "publishing" | "published" | "failed";
  targets?: Array<{
    account_id: string;
    platform?: string;
    status?: string;
  }>;
  scheduled_at?: string | null;
  published_at?: string | null;
  created_at: string;
}

export interface TebarIdea {
  id: string;
  text: string;
  column_id?: string;
  created_at: string;
}

export interface TebarBestTimes {
  days: Record<string, Array<{ hour: number; score: number }>>;
}

export async function getTebarMe(): Promise<{ user: TebarUser }> {
  return tebarFetch<{ user: TebarUser }>("/me");
}

export async function getTebarProfiles(): Promise<{ data: TebarProfile[] }> {
  return tebarFetch<{ data: TebarProfile[] }>("/profiles");
}

export async function getTebarAccounts(): Promise<{ data: TebarAccount[] }> {
  return tebarFetch<{ data: TebarAccount[] }>("/accounts");
}

export async function createTebarConnectLink(profileId?: string): Promise<ConnectLinkResponse> {
  let targetProfileId = profileId;
  if (!targetProfileId) {
    const profiles = await getTebarProfiles();
    const defaultProfile = profiles.data.find((p) => p.is_default) || profiles.data[0];
    if (!defaultProfile) {
      throw new Error("No Tebar profile found to generate connect link.");
    }
    targetProfileId = defaultProfile.id;
  }

  return tebarFetch<ConnectLinkResponse>(`/profiles/${targetProfileId}/connect-links`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function getTebarPosts(params?: {
  accountId?: string;
  status?: string;
  limit?: number;
}): Promise<{ data: TebarPost[]; next_cursor: string | null }> {
  const query = new URLSearchParams();
  if (params?.accountId) query.set("account_id", params.accountId);
  if (params?.status) query.set("status", params.status);
  if (params?.limit) query.set("limit", String(params.limit));

  const queryStr = query.toString();
  return tebarFetch<{ data: TebarPost[]; next_cursor: string | null }>(
    `/posts${queryStr ? `?${queryStr}` : ""}`
  );
}

export async function createTebarPost(payload: {
  content: string;
  accountIds: string[];
  scheduledAt?: string;
  mediaUrls?: string[];
}): Promise<TebarPost> {
  const body = {
    content: payload.content,
    targets: payload.accountIds.map((id) => ({ account_id: id })),
    ...(payload.scheduledAt ? { scheduled_at: payload.scheduledAt } : {}),
    ...(payload.mediaUrls && payload.mediaUrls.length > 0 ? { media: payload.mediaUrls.map((url) => ({ url })) } : {}),
  };

  return tebarFetch<TebarPost>("/posts", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getTebarIdeas(): Promise<{ data: TebarIdea[] }> {
  return tebarFetch<{ data: TebarIdea[] }>("/ideas");
}

export async function createTebarIdea(text: string, columnId?: string): Promise<TebarIdea> {
  return tebarFetch<TebarIdea>("/ideas", {
    method: "POST",
    body: JSON.stringify({ text, ...(columnId ? { column_id: columnId } : {}) }),
  });
}

export async function getTebarAccountInsights(accountId: string): Promise<Record<string, unknown>> {
  return tebarFetch<Record<string, unknown>>(`/accounts/${accountId}/insights`);
}

export async function getTebarBestTimes(accountId: string): Promise<TebarBestTimes> {
  return tebarFetch<TebarBestTimes>(`/accounts/${accountId}/best-times`);
}

