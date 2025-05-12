const API_URL = process.env.NEXT_PUBLIC_API_URL;
import Cookies from 'js-cookie';

function getAuthHeaders(): Record<string, string> {
  const token = Cookies.get('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchApps() {
  const res = await fetch(`${API_URL}/apps`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) throw new Error('Failed to fetch apps');
  return res.json();
}

export async function createApp(name: string, retentionDays: number = 30) {
  const res = await fetch(`${API_URL}/apps`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ name, retentionDays }),
  });
  if (!res.ok) throw new Error('Failed to create app');
  return res.json();
}

export async function updateApp(id: string, data: { name?: string; retentionDays?: number }) {
  const res = await fetch(`${API_URL}/apps/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update app');
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
  if (!res.ok) throw new Error('Failed to delete app');
  return res.json();
} 
