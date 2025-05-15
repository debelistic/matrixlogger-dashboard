const API_URL = process.env.NEXT_PUBLIC_API_URL;
import Cookies from 'js-cookie';

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  settings?: {
    defaultRetentionDays: number;
    maxApps?: number;
    maxUsersPerApp?: number;
  };
  stats?: {
    members: number;
    apps: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  id: string;
  userId: {
    id: string;
    name: string;
    email: string;
  };
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'active' | 'invited' | 'inactive';
  joinedAt: string;
  invitedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

function getAuthHeaders(): Record<string, string> {
  const token = Cookies.get('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function createOrganization(data: { name: string; description?: string }) {
  const res = await fetch(`${API_URL}/organizations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to create organization');
  return res.json();
}

export async function fetchOrganizations(): Promise<Organization[]> {
  const res = await fetch(`${API_URL}/organizations`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) throw new Error('Failed to fetch organizations');
  return res.json();
}

export async function fetchOrganization(orgId: string): Promise<Organization> {
  const res = await fetch(`${API_URL}/organizations/${orgId}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) throw new Error('Failed to fetch organization');
  return res.json();
}

export async function updateOrganization(orgId: string, data: {
  name?: string;
  description?: string;
  settings?: Organization['settings'];
}) {
  const res = await fetch(`${API_URL}/organizations/${orgId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to update organization');
  return res.json();
}

export async function fetchOrganizationMembers(orgId: string): Promise<OrganizationMember[]> {
  const res = await fetch(`${API_URL}/organizations/${orgId}/members`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) throw new Error('Failed to fetch organization members');
  return res.json();
}

export async function inviteMember(orgId: string, data: { email: string; role: string }) {
  const res = await fetch(`${API_URL}/organizations/${orgId}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to invite member');
  return res.json();
}

export async function updateMemberRole(orgId: string, memberId: string, role: string) {
  const res = await fetch(`${API_URL}/organizations/${orgId}/members/${memberId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ role }),
  });

  if (!res.ok) throw new Error('Failed to update member role');
  return res.json();
}

export async function removeMember(orgId: string, memberId: string) {
  const res = await fetch(`${API_URL}/organizations/${orgId}/members/${memberId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) throw new Error('Failed to remove member');
} 
