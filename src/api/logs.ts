const API_URL = process.env.NEXT_PUBLIC_API_URL;
import Cookies from 'js-cookie';

interface Log {
  id: string;
  appId: string;
  message: string;
  level?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface PaginationMeta {
  hasNextPage: boolean;
  nextCursor: string | null;
  prevCursor: string | null;
  limit: number;
}

interface LogsResponse {
  data: Log[];
  pagination: PaginationMeta;
}

interface FetchLogsOptions {
  limit?: number;
  cursor?: string | null;
}

function getAuthHeaders(): Record<string, string> {
  const token = Cookies.get('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchLogs(appId: string, options: FetchLogsOptions = {}): Promise<LogsResponse> {
  const { limit = 50, cursor } = options;
  const queryParams = new URLSearchParams({
    appId,
    limit: limit.toString(),
    ...(cursor && { cursor })
  });

  const res = await fetch(`${API_URL}/logs?${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) throw new Error('Failed to fetch logs');
  return res.json();
} 
