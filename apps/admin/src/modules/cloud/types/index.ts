export interface FileItem {
  id: number;
  name: string;
  filename?: string;
  mime_type?: string;
  size?: number;
  url?: string;
  thumbnail_url?: string;
  folder?: string;
  created_at?: string;
}

export interface UsageStats {
  usedBytes: number;
  quotaBytes: number;
  percent: number;
  filesCount: number;
}
