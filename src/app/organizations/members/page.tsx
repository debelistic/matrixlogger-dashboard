'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useOrganization } from '../../../context/OrganizationContext';
import { 
  fetchOrganizationMembers, 
  inviteMember, 
  updateMemberRole, 
  removeMember,
  resendInvitation 
} from '../../../api/organizations';
import toast from 'react-hot-toast';

type Role = 'owner' | 'admin' | 'member' | 'viewer';

interface Member {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  role: Role;
  status: 'active' | 'invited' | 'inactive';
  invitedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  invitedAt?: string;
}

export default function MembersPage() {
  const { user, loading: authLoading } = useAuth();
  const { currentOrganization, loading: orgLoading } = useOrganization();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'member' as Role });
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchMembers = useCallback(async () => {
    if (!currentOrganization) return;
    
    try {
      setLoading(true);
      const data = await fetchOrganizationMembers(currentOrganization._id);
      const mappedMembers: Member[] = data.map(member => ({
        _id: member.id,
        userId: {
          _id: member.userId.id,
          name: member.userId.name,
          email: member.userId.email
        },
        role: member.role,
        status: member.status,
        invitedBy: member.invitedBy ? {
          _id: member.invitedBy.id,
          name: member.invitedBy.name,
          email: member.invitedBy.email
        } : undefined,
        invitedAt: member.joinedAt
      }));
      setMembers(mappedMembers);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load members';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [currentOrganization]);

  useEffect(() => {
    if (currentOrganization) {
      fetchMembers();
    }
  }, [currentOrganization, fetchMembers]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login');
    }
  }, [user, authLoading, router]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization) return;

    try {
      setSaving(true);
      await inviteMember(currentOrganization._id, inviteForm);
      toast.success('Invitation sent successfully');
      setShowInvite(false);
      setInviteForm({ email: '', role: 'member' });
      await fetchMembers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send invitation';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: Role) => {
    if (!currentOrganization) return;

    try {
      await updateMemberRole(currentOrganization._id, memberId, newRole);
      toast.success('Member role updated successfully');
      await fetchMembers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update member role';
      toast.error(message);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!currentOrganization || !confirm('Are you sure you want to remove this member?')) return;

    try {
      await removeMember(currentOrganization._id, memberId);
      toast.success('Member removed successfully');
      await fetchMembers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove member';
      toast.error(message);
    }
  };

  const filteredMembers = members.filter(member => 
    member.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.userId.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

  const handleResendInvite = async (memberId: string) => {
    if (!currentOrganization) return;

    try {
      await resendInvitation(currentOrganization._id, memberId);
      toast.success('Invitation resent successfully');
      await fetchMembers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resend invitation';
      toast.error(message);
    }
  };

  const handleCancelInvite = async (memberId: string) => {
    if (!currentOrganization || !confirm('Are you sure you want to cancel this invitation?')) return;

    try {
      const response = await fetch(`/api/organizations/${currentOrganization._id}/members/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to cancel invitation');

      toast.success('Invitation cancelled successfully');
      await fetchMembers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel invitation';
      toast.error(message);
    }
  };

  if (authLoading || orgLoading || loading) {
    return <div className="flex justify-center items-center h-64 text-accent">Loading...</div>;
  }

  if (!currentOrganization) {
    return <div className="text-center text-gray-400 mt-12">No organization selected.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-accent">Organization Members</h1>
        <button
          onClick={() => setShowInvite(true)}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark"
        >
          Invite Member
        </button>
      </div>

      <div className="bg-white/10 rounded-xl overflow-hidden shadow border border-white/10">
        <div className="p-4 border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search members..."
                className="w-full px-4 py-2 pl-10 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-accent"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <button
              onClick={() => setShowInvite(true)}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark whitespace-nowrap"
            >
              Invite Member
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm font-medium text-gray-400">Name</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Email</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Role</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                <th className="text-right p-4 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMembers.map((member) => (
                <tr key={member._id} className="border-b border-white/10 last:border-0">
                  <td className="p-4 text-white">{member.userId.name}</td>
                  <td className="p-4 text-white">{member.userId.email}</td>
                  <td className="p-4">
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member._id, e.target.value as Role)}
                      className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm"
                      disabled={member.role === 'owner' || member.status === 'invited'}
                    >
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-2 px-2 py-1 rounded text-xs ${
                      member.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      member.status === 'invited' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        member.status === 'active' ? 'bg-green-400' :
                        member.status === 'invited' ? 'bg-yellow-400' :
                        'bg-red-400'
                      }`}></span>
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end items-center space-x-2">
                      {member.status === 'invited' && (
                        <>
                          <button
                            onClick={() => handleResendInvite(member._id)}
                            className="text-accent hover:text-accent-light text-sm"
                            title="Resend invitation"
                          >
                            Resend
                          </button>
                          <button
                            onClick={() => handleCancelInvite(member._id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                            title="Cancel invitation"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {member.status === 'active' && member.role !== 'owner' && (
                        <button
                          onClick={() => handleRemoveMember(member._id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                          title="Remove member"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-white/10">
            <div className="text-sm text-gray-400">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredMembers.length)} of {filteredMembers.length} members
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-white/5 border border-white/10 rounded text-white disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-white/5 border border-white/10 rounded text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 rounded-xl p-6 max-w-md w-full mx-4 backdrop-blur-sm border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Invite New Member</h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-accent"
                  placeholder="member@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as Role })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-accent"
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark disabled:opacity-50"
                >
                  {saving ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 
