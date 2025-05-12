const API_URL = process.env.NEXT_PUBLIC_API_URL;
import Cookies from 'js-cookie';

function getAuthHeaders(): Record<string, string> {
  const token = Cookies.get('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchApiKeys() {
  const res = await fetch(`${API_URL}/apikeys`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) throw new Error('Failed to fetch API keys');
  return res.json();
} 
