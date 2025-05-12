import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  return res.json(); // { token, user }
}

export async function register(name: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) throw new Error('Registration failed');
  return res.json(); // { token, user }
}

export async function getCurrentUser() {
  const token = Cookies.get('token');
  if (!token) return null;
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json(); // { user }
}

export function setToken(token: string) {
  Cookies.set('token', token, { expires: 7, secure: true, sameSite: 'lax' });
}

export function removeToken() {
  Cookies.remove('token');
} 
