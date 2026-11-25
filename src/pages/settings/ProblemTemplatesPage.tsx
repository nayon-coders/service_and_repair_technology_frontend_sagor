import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  RotateCcw, 
  ListPlus, 
  HelpCircle
} from 'lucide-react';
import { Button } from '../../components/common';
import { fetchProblemTemplates, saveProblemTemplates } from '../../services/templateService';

export const ProblemTemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<string[]>([]);
  const [singleInput, setSingleInput] = useState<string>('');
  const [bulkInput, setBulkInput] = useState<string>('');
  const [isBulkOpen, setIsBulkOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await fetchProblemTemplates();
      setTemplates(data);
    } catch {
      setFeedback({ type: 'error', message: 'টেমপ্লেট তালিকা লোড করা যায়নি।' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = singleInput.trim();
    if (!trimmed) return;
    if (templates.includes(trimmed)) {
      setFeedback({ type: 'error', message: 'এই সমস্যার বিবরণটি ইতিমধ্যে তালিকায় রয়েছে!' });
      return;
    }
    setTemplates((prev) => [...prev, trimmed]);
    setSingleInput('');
    setFeedback(null);
  };

  const handleAddBulk = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = bulkInput
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;

    setTemplates((prev) => {
      const existing = new Set(prev);
      const newlyAdded: string[] = [];
      lines.forEach((l) => {
        if (!existing.has(l)) {
          existing.add(l);
          newlyAdded.push(l);
        }
      });
      return [...prev, ...newlyAdded];
    });

    setBulkInput('');
    setIsBulkOpen(false);
    setFeedback({ type: 'success', message: `${lines.length} টি নতুন টেমপ্লেট সফলভাবে যোগ করা হয়েছে। সংরক্ষণ করতে 'Save Changes' চাপুন।` });
  };

  const handleRemove = (index: number) => {
    setTemplates((prev) => prev.filter((_, i) => i !== index));
    setFeedback(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const saved = await saveProblemTemplates(templates);
      setTemplates(saved);
      setFeedback({ type: 'success', message: 'সমস্যার বিবরণ টেমপ্লেটসমূহ ডাটাবেসে সফলভাবে সংরক্ষিত হয়েছে!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'সংরক্ষণ ব্যর্থ হয়েছে।' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    const defaults = [
      'Display flickering and power supply intermittently shutting down during scan.',
      'Motherboard circuit failure, device completely not powering on (Dead).',
      'Sensor calibration error and optic light intensity malfunction.',
      'Motor drive overheating and mechanical axis movement jammed.',
      'Suction pump pressure low and internal fluidics pipe leakage.',
      'Communication interface error and system freeze during inspection.',
      'Battery backup drained completely, charging circuit not responding.',
      'Control panel touch keypad unresponsive and error code flashing.',
    ];
    setTemplates(defaults);
    setFeedback({ type: 'success', message: 'ডিফল্ট টেমপ্লেট লোড করা হয়েছে। স্থায়ী করতে সংরক্ষণ করুন।' });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Fault & Problem Templates (সমস্যার বিবরণ টেমপ্লেট)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                এখানে সমস্যার বিবরণসমূহ সেভ করে রাখুন। রিকুইজিশন ও বিল তৈরির সময় এগুলো ফিল্ডের নিচে চলে আসবে এবং ১-ক্লিকেই ফিল্ড পূরণ হবে।
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            className="text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            ডিফল্ট রিস্টোর
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={isSaving}
            className="text-xs shadow-sm bg-blue-600 hover:bg-blue-500 text-white"
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            সংরক্ষণ করুন (Save Changes)
          </Button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between gap-3 animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border-rose-300 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Options Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Add Controls */}
        <div className="space-y-4 lg:col-span-1">
          {/* Single Add Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" />
              নতুন বিবরণ যোগ করুন (Add Single)
            </h3>
            <form onSubmit={handleAddSingle} className="space-y-3">
              <textarea
                rows={3}
                value={singleInput}
                onChange={(e) => setSingleInput(e.target.value)}
                placeholder="e.g. Display flickering / Power IC damaged..."
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!singleInput.trim()}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>তালিকায় যুক্ত করুন</span>
              </button>
            </form>
          </div>

          {/* Bulk Paste Box Toggle */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ListPlus className="w-4 h-4 text-indigo-600" />
                একসাথে একাধিক যোগ করুন (Bulk Add)
              </h3>
              <button
                type="button"
                onClick={() => setIsBulkOpen(!isBulkOpen)}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                {isBulkOpen ? 'লুকান' : 'ওপেন করুন'}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              প্রতি লাইনে একটি করে সমস্যার বিবরণ লিখে এক ক্লিকেই সবগুলো যোগ করে নিতে পারেন।
            </p>

            {isBulkOpen && (
              <form onSubmit={handleAddBulk} className="space-y-3 pt-2">
                <textarea
                  rows={6}
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder={`লাইন ১: Power supply unit damaged\nলাইন ২: Optic laser probe uncalibrated\nলাইন ৩: Keyboard keypad not typing`}
                  className="w-full text-xs p-3 font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                <button
                  type="submit"
                  disabled={!bulkInput.trim()}
                  className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <ListPlus className="w-4 h-4" />
                  <span>সবগুলো যোগ করুন</span>
                </button>
              </form>
            )}
          </div>

          {/* Help Info Box */}
          <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 text-slate-700 space-y-1.5 text-xs">
            <div className="font-bold flex items-center gap-1.5 text-blue-900">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>এটি কীভাবে সাহায্য করবে?</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              আপনি এখানে যা সেভ করবেন, রিকুইজিশন তৈরি ও বিল তৈরির সময় <strong>Fault Description / Problem</strong> ফিল্ডের ঠিক নিচেই এই তালিকাটি ভেসে উঠবে। টেকনিশিয়ান বা কর্মচারীকে বারবার বড় বড় সমস্যা টাইপ করতে হবে না—শুধু ক্লিক করলেই ইনপুটে বসে যাবে।
            </p>
          </div>
        </div>

        {/* Right: Template List */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  বর্তমান টেমপ্লেট তালিকা
                </h3>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-bold rounded-full">
                  {templates.length} টি
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                ড্রাফট তালিকা
              </span>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-xs text-slate-400">
                টেমপ্লেট তালিকা লোড হচ্ছে...
              </div>
            ) : templates.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <p className="text-xs text-slate-400">কোনো টেমপ্লেট সংরক্ষিত নেই।</p>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  ডিফল্ট টেমপ্লেটসমূহ লোড করুন
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1 mt-2">
                {templates.map((tmpl, idx) => (
                  <div
                    key={idx}
                    className="py-3 px-2 flex items-start justify-between gap-3 hover:bg-slate-50/80 rounded-lg group transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-slate-400 font-mono text-xs mt-0.5 font-bold w-5">
                        {idx + 1}.
                      </span>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium">
                        {tmpl}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      title="মুছে ফেলুন"
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Save Bar */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              পরিবর্তন সম্পন্ন হলে সেভ করুন:
            </span>
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              isLoading={isSaving}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5"
            >
              <Save className="w-4 h-4 mr-1.5" />
              সংরক্ষণ করুন (Save Changes)
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
