"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useTheme, Theme } from "../../context/ThemeContext";
import toast from "react-hot-toast";

interface ProfileForm {
  name: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PreferencesForm {
  theme: Theme;
  emailNotifications: boolean;
}

export default function SettingsPage() {
  const { user, loading, updateProfile, updatePassword } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [saving, setSaving] = useState(false);
  
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: user?.name || '',
  });

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferencesForm, setPreferencesForm] = useState<PreferencesForm>({
    theme: theme,
    emailNotifications: true,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
      });
    }
  }, [user]);

  // Update preferences form when theme changes
  useEffect(() => {
    setPreferencesForm(prev => ({ ...prev, theme }));
  }, [theme]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProfile(profileForm);
      toast.success('Profile updated successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      setSaving(true);
      await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update password';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setTheme(preferencesForm.theme);
      // TODO: Implement email notifications update
      toast.success('Preferences updated successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update preferences';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-accent">Loading...</div>;
  }
  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6 text-accent">Settings</h1>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-lg transition ${
            activeTab === 'profile'
              ? 'bg-accent text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-lg transition ${
            activeTab === 'security'
              ? 'bg-accent text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Security
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-2 rounded-lg transition ${
            activeTab === 'preferences'
              ? 'bg-accent text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Preferences
        </button>
      </div>

      <div className="bg-white/10 rounded-xl p-6 shadow border border-white/10">
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ name: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="text-sm text-gray-400">
              Email: <span className="text-white">{user?.email}</span> (not editable)
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        )}

        {activeTab === 'security' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-accent"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update Password'}
            </button>
          </form>
        )}

        {activeTab === 'preferences' && (
          <form onSubmit={handlePreferencesSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Theme</label>
              <select
                value={preferencesForm.theme}
                onChange={(e) => setPreferencesForm({ ...preferencesForm, theme: e.target.value as Theme })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-accent"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System (follows device preference)</option>
              </select>
              <p className="mt-1 text-sm text-gray-400">
                {preferencesForm.theme === 'system' ? 'Automatically switches between light and dark based on your system settings.' : 
                 `Always use ${preferencesForm.theme} mode.`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="emailNotifications"
                checked={preferencesForm.emailNotifications}
                onChange={(e) => setPreferencesForm({ ...preferencesForm, emailNotifications: e.target.checked })}
                className="rounded bg-white/5 border-white/10 text-accent focus:ring-accent"
              />
              <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-300">
                Receive email notifications
              </label>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 
