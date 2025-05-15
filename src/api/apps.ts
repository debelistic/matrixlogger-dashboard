const API_URL = process.env.NEXT_PUBLIC_API_URL;
import Cookies from 'js-cookie';

export interface App {
  _id: string;
  name: string;
  slug: string;
  apiKey: string;
  description?: string;
  retentionDays: number;
  organizationId: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  settings?: {
    allowedOrigins?: string[];
    rateLimit?: number;
    enableWebhooks?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

function getAuthHeaders(): Record<string, string> {
  const token = Cookies.get('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function createApp(data: {
  name: string;
  description?: string;
  retentionDays?: number;
  organizationId: string;
  settings?: App['settings'];
}) {
  const res = await fetch(`${API_URL}/apps`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to create application');
  return res.json();
}

export async function fetchOrganizationApps(organizationId: string): Promise<App[]> {
  const res = await fetch(`${API_URL}/apps/org/${organizationId}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) throw new Error('Failed to fetch applications');
  return res.json();
}

export async function fetchApp(id: string): Promise<App> {
  const res = await fetch(`${API_URL}/apps/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) throw new Error('Failed to fetch application');
  return res.json();
}

export async function updateApp(id: string, data: {
  name?: string;
  description?: string;
  retentionDays?: number;
  settings?: App['settings'];
}) {
  const res = await fetch(`${API_URL}/apps/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to update application');
  return res.json();
}

export async function deleteApp(id: string) {
  const res = await fetch(`${API_URL}/apps/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) throw new Error('Failed to delete application');
} 
