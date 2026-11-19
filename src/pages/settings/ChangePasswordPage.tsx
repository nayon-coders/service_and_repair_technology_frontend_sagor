import React, { useState } from 'react';
import { 
  Lock, 
  User as UserIcon, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  KeyRound, 
  ShieldCheck, 
  Save 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { changePassword } from '../../services/authService';
import { Button } from '../../components/common';

export const ChangePasswordPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [showCurrent, setShowCurrent] = useState<boolean>(false);
  const [showNew, setShowNew] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!currentPassword) {
      setErrorMessage('Please enter your current password.');
      return;
    }

    if (!newPassword) {
      setErrorMessage('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirm password do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setSuccessMessage('Password changed successfully! Please use your new password next time you log in.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || 'Failed to change password. Please check your current password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Lock className="w-7 h-7 text-indigo-600" />
              Security &amp; Password Management
            </h1>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-indigo-200">
              Security
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Update your account password to protect access to financial records and administrative modules.
          </p>
        </div>

        {/* Setting Navigation Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/settings/profile"
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition inline-flex items-center gap-1.5"
          >
            <UserIcon className="w-3.5 h-3.5 text-slate-500" />
            Profile
          </Link>
          <Link
            to="/settings/change-password"
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white shadow-xs inline-flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Password Form (2 cols) */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h3 className="text-base font-bold text-slate-900">Change Account Password</h3>
            <p className="text-xs text-slate-500 mt-1">
              Ensure you choose a strong password with at least 6 characters.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Current Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  required
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type your new password"
                  required
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
              >
                <Save className="w-4 h-4 mr-1.5" />
                Update Password
              </Button>
            </div>
          </form>
        </div>

        {/* Security Guidelines Card (1 col) */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm pb-3 border-b border-slate-200">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            Security Guidelines
          </div>

          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <KeyRound className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Use at least 6-8 characters combining letters, numbers, and symbols.</span>
            </li>
            <li className="flex items-start gap-2">
              <KeyRound className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Never share your administrator login with unauthorized personnel.</span>
            </li>
            <li className="flex items-start gap-2">
              <KeyRound className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Passwords are securely hashed using bcrypt (12 rounds) with zero plaintext storage.</span>
            </li>
            <li className="flex items-start gap-2">
              <KeyRound className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>If you suspect credentials compromised, change immediately.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
