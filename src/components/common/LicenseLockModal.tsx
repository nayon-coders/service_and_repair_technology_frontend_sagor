import React, { useState, useEffect } from 'react';
import { ShieldAlert, Key, RefreshCw, Phone, Mail, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../services/api';

interface LicenseSuspendedDetail {
  licenseSuspended?: boolean;
  message?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export const LicenseLockModal: React.FC = () => {
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [licenseKey, setLicenseKey] = useState<string>('');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isActivating, setIsActivating] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Initial check on app startup
  useEffect(() => {
    const checkInitialLicense = async () => {
      try {
        const res = await apiClient.get('/license/status');
        if (res.data?.data) {
          const state = res.data.data;
          if (!state.isValid || state.status === 'SUSPENDED') {
            setIsLocked(true);
            setMessage(state.message || 'সফটওয়্যারের লাইসেন্স বা পেমেন্ট সংক্রান্ত কারণে সার্ভিস সাময়িকভাবে স্থগিত করা হয়েছে।');
            setContactPhone(state.contactPhone || '');
            setContactEmail(state.contactEmail || '');
          }
        }
      } catch (err: any) {
        if (err.response?.data?.licenseSuspended) {
          setIsLocked(true);
          setMessage(err.response.data.message || 'সফটওয়্যারের লাইসেন্স স্থগিত করা হয়েছে।');
          setContactPhone(err.response.data.contactPhone || '');
          setContactEmail(err.response.data.contactEmail || '');
        }
      }
    };

    checkInitialLicense();

    // Listen to custom event dispatched by axios interceptor
    const handleLicenseSuspension = (e: CustomEvent<LicenseSuspendedDetail>) => {
      setIsLocked(true);
      if (e.detail?.message) {
        setMessage(e.detail.message);
      }
      if (e.detail?.contactPhone) {
        setContactPhone(e.detail.contactPhone);
      }
      if (e.detail?.contactEmail) {
        setContactEmail(e.detail.contactEmail);
      }
    };

    window.addEventListener('app-license-suspended' as any, handleLicenseSuspension as any);

    return () => {
      window.removeEventListener('app-license-suspended' as any, handleLicenseSuspension as any);
    };
  }, []);

  const handleRefreshLicense = async () => {
    setIsChecking(true);
    setActionFeedback(null);
    try {
      const res = await apiClient.post('/license/refresh');
      const state = res.data?.data;
      if (state && (state.status === 'ACTIVE' || state.isValid)) {
        setActionFeedback({
          type: 'success',
          text: 'অভিনন্দন! লাইসেন্স সক্রিয় হয়েছে। সফটওয়্যার আনলক করা হয়েছে।',
        });
        setTimeout(() => {
          setIsLocked(false);
          window.location.reload();
        }, 1200);
      } else {
        setActionFeedback({
          type: 'error',
          text: 'লাইসেন্স এখনও স্থগিত রয়েছে। অনুগ্রহ করে বকেয়া পেমেন্ট সম্পন্ন করুন।',
        });
      }
    } catch {
      setActionFeedback({
        type: 'error',
        text: 'অনলাইন সার্ভারের সাথে যোগাযোগ করা যায়নি অথবা লাইসেন্স এখনও স্থগিত রয়েছে।',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleActivateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) return;

    setIsActivating(true);
    setActionFeedback(null);
    try {
      const res = await apiClient.post('/license/activate', { key: licenseKey.trim() });
      if (res.data?.success) {
        setActionFeedback({
          type: 'success',
          text: 'মাস্টার লাইসেন্স কি সফলভাবে গৃহীত হয়েছে! সফটওয়্যার স্থায়ীভাবে আনলক হয়েছে।',
        });
        setTimeout(() => {
          setIsLocked(false);
          window.location.reload();
        }, 1500);
      } else {
        setActionFeedback({
          type: 'error',
          text: res.data?.message || 'ভুল লাইসেন্স কি! সঠিক কি ইনপুট করুন।',
        });
      }
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        text: err.response?.data?.message || 'ভুল লাইসেন্স কি! সঠিক কি দিয়ে পুনরায় চেষ্টা করুন।',
      });
    } finally {
      setIsActivating(false);
    }
  };

  if (!isLocked) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999999] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-red-600/70 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-red-900/80 via-red-800 to-rose-900 p-6 flex items-center space-x-4 border-b border-red-600/40">
          <div className="p-3 bg-red-600/30 rounded-xl border border-red-500/40 flex-shrink-0 animate-pulse">
            <ShieldAlert className="w-9 h-9 text-red-200" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              সফটওয়্যার অ্যাক্সেস স্থগিত করা হয়েছে
            </h2>
            <p className="text-xs text-red-200 mt-1 font-medium">
              Software License & Payment Suspended by Developer
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Main Notice Box */}
          <div className="p-4 bg-red-950/40 border border-red-700/50 rounded-xl text-slate-200 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm leading-relaxed">
              {message ||
                'সফটওয়্যারের লাইসেন্স বা পেমেন্ট সংক্রান্ত কারণে সার্ভিস সাময়িকভাবে স্থগিত করা হয়েছে। অনুগ্রহ করে ডেভেলপারের সাথে যোগাযোগ করে পেমেন্ট পরিশোধ করুন।'}
            </div>
          </div>

          {/* Developer Contact Info */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              যোগাযোগের তথ্য (Contact Developer)
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-200">
              {contactPhone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono text-emerald-300 font-semibold">{contactPhone}</span>
                </div>
              )}
              {contactEmail && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-sky-400" />
                  <span className="font-mono text-sky-300">{contactEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Feedback Message */}
          {actionFeedback && (
            <div
              className={`p-3 rounded-lg text-sm flex items-center space-x-2 font-medium ${
                actionFeedback.type === 'success'
                  ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-300'
                  : 'bg-red-950/80 border border-red-600 text-red-300'
              }`}
            >
              {actionFeedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              )}
              <span>{actionFeedback.text}</span>
            </div>
          )}

          {/* Master Unlock Key Form */}
          <form onSubmit={handleActivateKey} className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              অফলাইন মাস্টার লাইসেন্স কি প্রবেশ করান (Master Unlock Key)
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  placeholder="e.g. SRT-PERMANENT-XXXX-XXXX"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/90 border border-slate-700 rounded-lg text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isActivating || !licenseKey.trim()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium text-sm rounded-lg transition-colors shadow-lg flex items-center space-x-1.5"
              >
                {isActivating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>যাচাই হচ্ছে...</span>
                  </>
                ) : (
                  <span>আনলক করুন</span>
                )}
              </button>
            </div>
          </form>

          {/* Remote Re-check Button */}
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>পেমেন্ট পরিশোধ করা হয়ে থাকলে:</span>
            <button
              type="button"
              onClick={handleRefreshLicense}
              disabled={isChecking}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-sky-400' : ''}`} />
              <span>অনলাইনে পুনরায় চেক করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
