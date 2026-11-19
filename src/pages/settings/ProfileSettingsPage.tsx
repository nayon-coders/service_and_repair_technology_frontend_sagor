import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  Calendar,
  Lock,
  Sliders,
  Save,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile } from '../../services/authService';
import { Input, Button } from '../../components/common';

export const ProfileSettingsPage: React.FC = () => {
  const { user } = useAuth();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Name cannot be empty.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Email cannot be empty.');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateProfile({
        name: name.trim(),
        email: email.trim().toLowerCase(),
      });
      setSuccessMessage('Profile information updated successfully! Changes are saved.');
      // Update local storage or state
      if (user) {
        user.name = name.trim();
        user.email = email.trim().toLowerCase();
      }
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || 'Failed to update profile information.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'System Initialized';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <UserIcon className="w-7 h-7 text-blue-600" />
              Admin Profile &amp; Account Settings
            </h1>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-blue-200">
              Settings
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Manage your personal administrator profile, email address, role authorizations, and access credentials.
          </p>
        </div>

        {/* Setting Navigation Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/settings/profile"
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-xs inline-flex items-center gap-1.5"
          >
            <UserIcon className="w-3.5 h-3.5" />
            Profile
          </Link>
          <Link
            to="/settings/change-password"
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition inline-flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            Change Password
          </Link>
          <Link
            to="/settings/system"
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition inline-flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            System &amp; Desktop App
          </Link>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2.5 font-medium shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2.5 font-medium shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-3xl font-black shadow-md border-4 border-white mb-4">
            {name ? name.charAt(0).toUpperCase() : 'A'}
          </div>

          <h2 className="text-lg font-bold text-slate-900">{name || 'Administrator'}</h2>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">{email || 'admin@example.com'}</p>

          <div className="mt-4 flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Shield className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              {user?.role || 'Super Admin'}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Active User
            </span>
          </div>

          <div className="w-full mt-6 pt-6 border-t border-slate-100 space-y-3 text-left text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Member Since
              </span>
              <span className="font-semibold text-slate-800">{formattedDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Access Protocol
              </span>
              <span className="font-mono text-slate-700 font-semibold">JWT Session</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" /> Auth Permissions
              </span>
              <span className="font-bold text-blue-700">Full Access (*)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h3 className="text-base font-bold text-slate-900">Personal &amp; Contact Details</h3>
            <p className="text-xs text-slate-500 mt-1">
              Update the display name and primary administrative email used for notifications and logging.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Input
                label="Full Administrator Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sagar Badsha"
                leftIcon={UserIcon}
                required
              />
            </div>

            <div>
              <Input
                label="Email Address (Login Username)"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@example.com"
                leftIcon={Mail}
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">
                This email address is used to authenticate into the 1Service Management portal.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">Security Notice:</p>
              <p>
                Changing your profile email will update your login identifier. To change your security password, please visit the{' '}
                <Link to="/settings/change-password" className="text-blue-600 font-bold hover:underline">
                  Change Password
                </Link>{' '}
                tab.
              </p>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
              >
                <Save className="w-4 h-4 mr-1.5" />
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
