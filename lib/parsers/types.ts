export type DailyGsc = {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  averagePosition: number;
};

export type GscDimension = {
  name: string;
  clicks: number;
  impressions: number;
  ctr: number;
  averagePosition: number;
};

export type DailyGa = {
  date: string;
  activeUsers?: number;
  newUsers?: number;
  engagementSeconds?: number;
  revenue?: number;
};

export type ParsedReport = {
  source: "gsc" | "ga";
  property?: string;
  periodStart: string;
  periodEnd: string;
  warnings: string[];
  metrics: Record<string, number | null>;
  gsc?: {
    daily: DailyGsc[];
    queries: GscDimension[];
    pages: GscDimension[];
    devices: GscDimension[];
  };
  ga?: {
    daily: DailyGa[];
    channels: Array<{ channel: string; sessions: number; newUsers: number }>;
    pages: Array<{ title: string; views: number }>;
    events: Array<{ name: string; count: number; keyCount: number }>;
    cities?: Array<{ city: string; activeUsers: number }>;
    deviceModels?: Array<{ model: string; activeUsers: number }>;
  };
};
