'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useOrganization } from '../../../context/OrganizationContext';
import { updateOrganization } from '../../../api/organizations';
import toast from 'react-hot-toast';

interface FormData {
  name: string;
  description: string;
  settings: {
    defaultRetentionDays: number;
    maxApps?: number;
    maxUsersPerApp?: number;
  };
}

interface FormErrors {
  name?: string;
  description?: string;
  settings?: {
    defaultRetentionDays?: string;
    maxApps?: string;
    maxUsersPerApp?: string;
  };
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  organizationName: string;
  isDeleting: boolean;
}

function DeleteModal({ isOpen, onClose, onConfirm, organizationName, isDeleting }: DeleteModalProps) {
  const [confirmName, setConfirmName] = useState('');
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white/10 rounded-xl p-6 max-w-md w-full mx-4 backdrop-blur-sm border border-white/10">
        <h3 className="text-xl font-semibold text-red-400 mb-4">Delete Organization</h3>
        <p className="text-gray-300 mb-4">
          This action cannot be undone. This will permanently delete the organization
          <strong className="text-white"> {organizationName} </strong>
          and remove all associated data.
        </p>
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">
            Please type <strong className="text-white">{organizationName}</strong> to confirm
          </label>
          <input
            type="text"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-red-500"
            placeholder="Type organization name"
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmName !== organizationName || isDeleting}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : 'I understand, delete this organization'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrganizationSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { currentOrganization, loading: orgLoading, refreshOrganizations } = useOrganization();
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    name: '',
    description: '',
    settings: {
      defaultRetentionDays: 30,
      maxApps: undefined,
      maxUsersPerApp: undefined
    }
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (currentOrganization) {
      setForm({
        name: currentOrganization.name,
        description: currentOrganization.description || '',
        settings: {
          defaultRetentionDays: currentOrganization.settings?.defaultRetentionDays || 30,
          maxApps: currentOrganization.settings?.maxApps,
          maxUsersPerApp: currentOrganization.settings?.maxUsersPerApp
        }
      });
    }
  }, [currentOrganization]);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Organization name is required';
    } else if (form.name.length < 3) {
      newErrors.name = 'Organization name must be at least 3 characters';
    } else if (form.name.length > 50) {
      newErrors.name = 'Organization name must be less than 50 characters';
    }

    if (form.description && form.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (form.settings.defaultRetentionDays < 1) {
      newErrors.settings = {
        ...newErrors.settings,
        defaultRetentionDays: 'Default retention days must be at least 1'
      };
    }

    if (form.settings.maxApps && form.settings.maxApps < 1) {
      newErrors.settings = {
        ...newErrors.settings,
        maxApps: 'Maximum apps must be at least 1'
      };
    }

    if (form.settings.maxUsersPerApp && form.settings.maxUsersPerApp < 1) {
      newErrors.settings = {
        ...newErrors.settings,
        maxUsersPerApp: 'Maximum users per app must be at least 1'
      };
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentOrganization || !validateForm()) {
      return;
    }

    try {
      setSaving(true);
      await updateOrganization(currentOrganization._id, form);
      toast.success('Organization settings updated successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update organization settings';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentOrganization) return;
    
    try {
      setIsDeleting(true);
      await updateOrganization(currentOrganization._id, {
        name: currentOrganization.name,
        description: currentOrganization.description || '',
        settings: {
          defaultRetentionDays: currentOrganization.settings?.defaultRetentionDays || 30,
          maxApps: currentOrganization.settings?.maxApps,
          maxUsersPerApp: currentOrganization.settings?.maxUsersPerApp
        }
      });
      toast.success('Organization deleted successfully');
      await refreshOrganizations();
      router.replace('/organizations');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete organization';
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (authLoading || orgLoading) {
    return <div className="flex justify-center items-center h-64 text-accent">Loading...</div>;
  }

  if (!currentOrganization) {
    return <div className="text-center text-gray-400 mt-12">No organization selected.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-accent">Organization Settings</h1>
        <button
          onClick={() => router.push('/organizations/members')}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark"
        >
          Manage Members
        </button>
      </div>

      <div className="bg-white/10 rounded-xl p-6 shadow border border-white/10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Organization Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              className={`w-full px-4 py-2 bg-white/5 border ${errors.name ? 'border-red-500' : 'border-white/10'} rounded-lg text-white focus:ring-2 focus:ring-accent`}
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => {
                setForm({ ...form, description: e.target.value });
                if (errors.description) setErrors({ ...errors, description: undefined });
              }}
              className={`w-full px-4 py-2 bg-white/5 border ${errors.description ? 'border-red-500' : 'border-white/10'} rounded-lg text-white focus:ring-2 focus:ring-accent h-24`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description}</p>
            )}
          </div>

          <div className="border-t border-white/10 pt-4 mt-6">
            <h2 className="text-lg font-semibold text-white mb-4">Default Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Default Retention Days</label>
                <input
                  type="number"
                  value={form.settings.defaultRetentionDays}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      settings: { ...form.settings, defaultRetentionDays: parseInt(e.target.value) }
                    });
                    if (errors.settings?.defaultRetentionDays) {
                      setErrors({
                        ...errors,
                        settings: { ...errors.settings, defaultRetentionDays: undefined }
                      });
                    }
                  }}
                  className={`w-full px-4 py-2 bg-white/5 border ${errors.settings?.defaultRetentionDays ? 'border-red-500' : 'border-white/10'} rounded-lg text-white focus:ring-2 focus:ring-accent`}
                  min="1"
                />
                {errors.settings?.defaultRetentionDays && (
                  <p className="mt-1 text-sm text-red-400">{errors.settings.defaultRetentionDays}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Maximum Apps</label>
                <input
                  type="number"
                  value={form.settings.maxApps || ''}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      settings: { ...form.settings, maxApps: e.target.value ? parseInt(e.target.value) : undefined }
                    });
                    if (errors.settings?.maxApps) {
                      setErrors({
                        ...errors,
                        settings: { ...errors.settings, maxApps: undefined }
                      });
                    }
                  }}
                  className={`w-full px-4 py-2 bg-white/5 border ${errors.settings?.maxApps ? 'border-red-500' : 'border-white/10'} rounded-lg text-white focus:ring-2 focus:ring-accent`}
                  min="1"
                  placeholder="Unlimited"
                />
                {errors.settings?.maxApps && (
                  <p className="mt-1 text-sm text-red-400">{errors.settings.maxApps}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Maximum Users per App</label>
                <input
                  type="number"
                  value={form.settings.maxUsersPerApp || ''}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      settings: { ...form.settings, maxUsersPerApp: e.target.value ? parseInt(e.target.value) : undefined }
                    });
                    if (errors.settings?.maxUsersPerApp) {
                      setErrors({
                        ...errors,
                        settings: { ...errors.settings, maxUsersPerApp: undefined }
                      });
                    }
                  }}
                  className={`w-full px-4 py-2 bg-white/5 border ${errors.settings?.maxUsersPerApp ? 'border-red-500' : 'border-white/10'} rounded-lg text-white focus:ring-2 focus:ring-accent`}
                  min="1"
                  placeholder="Unlimited"
                />
                {errors.settings?.maxUsersPerApp && (
                  <p className="mt-1 text-sm text-red-400">{errors.settings.maxUsersPerApp}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 bg-white/10 rounded-xl p-6 shadow border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4">Danger Zone</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-500/20 rounded-lg bg-red-500/10">
            <div>
              <h3 className="text-red-400 font-medium">Delete Organization</h3>
              <p className="text-sm text-gray-400">
                Permanently delete this organization and all its data. This action cannot be undone.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        organizationName={currentOrganization?.name || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
} 
