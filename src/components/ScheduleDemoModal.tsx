import React, { useState } from 'react';
import {
  X,
  Calendar,
  Building2,
  User,
  Mail,
  Phone,
  Layers,
  Send,
  Loader2,
  CheckCircle2,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { getZorvikDemoApiUrl } from '../lib/urls';

interface ScheduleDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScheduleDemoModal: React.FC<ScheduleDemoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [studioName, setStudioName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gearSize, setGearSize] = useState('10 - 50 units');
  const [preferredDate, setPreferredDate] = useState('');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const demoApiUrl = getZorvikDemoApiUrl();
      const payload = {
        studioName: studioName.trim(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        gearSize,
        preferredDate: preferredDate.trim(),
        message: message.trim(),
      };

      const res = await fetch(demoApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(
          data.error || 'Failed to submit demo request. Please try again or reach out on WhatsApp.'
        );
      }

      setIsDuplicate(Boolean(data.duplicate));
      setFeedbackMessage(
        data.message ||
          'Your ZManage demo request has been registered. Our operations specialist will connect with you.'
      );
      setIsSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error submitting inquiry';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setIsSuccess(false);
    setIsDuplicate(false);
    setErrorMessage('');
    onClose();
  };

  const whatsappInquiryText = encodeURIComponent(
    `Hi Zorvik Tech, I'd like to schedule an interactive walkthrough for ZManage studio operations${
      studioName ? ` for ${studioName}` : ''
    }.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#121216] border border-[#e4e1d9] dark:border-zinc-800 shadow-2xl text-charcoal dark:text-zinc-100 overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#e4e1d9] dark:border-zinc-800 flex items-center justify-between bg-paper/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-charcoal dark:text-white">
                Schedule a Demo Walkthrough
              </h3>
              <p className="text-[11px] font-mono text-steel dark:text-zinc-400">
                Direct consultation with our studio operations engineering team
              </p>
            </div>
          </div>

          <button
            onClick={resetAndClose}
            className="p-1.5 rounded-lg text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-bold text-charcoal dark:text-white font-serif">
                  {isDuplicate ? 'Demo Request Already Queued' : 'Demo Request Received!'}
                </h4>
                <p className="text-xs text-steel dark:text-zinc-300 max-w-sm mx-auto leading-relaxed">
                  {feedbackMessage}
                </p>
              </div>

              <div className="pt-3 border-t border-[#e4e1d9] dark:border-zinc-800 space-y-2">
                <a
                  href={`https://wa.me/?text=${whatsappInquiryText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Fast-Track on WhatsApp</span>
                </a>

                <button
                  onClick={resetAndClose}
                  className="w-full py-2 px-4 rounded-xl border border-[#e4e1d9] dark:border-zinc-800 text-xs font-mono text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-white transition cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-mono">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Studio Name */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-steel dark:text-zinc-300 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-zinc-400" />
                    Studio / Production House
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Cinema Gear"
                    value={studioName}
                    onChange={(e) => setStudioName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-paper dark:bg-zinc-900 border border-[#e4e1d9] dark:border-zinc-800 text-xs text-charcoal dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                {/* Contact Name */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-steel dark:text-zinc-300 flex items-center gap-1">
                    <User className="w-3 h-3 text-zinc-400" />
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-paper dark:bg-zinc-900 border border-[#e4e1d9] dark:border-zinc-800 text-xs text-charcoal dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-steel dark:text-zinc-300 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-zinc-400" />
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="contact@studio.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-paper dark:bg-zinc-900 border border-[#e4e1d9] dark:border-zinc-800 text-xs text-charcoal dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-steel dark:text-zinc-300 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-zinc-400" />
                    Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-paper dark:bg-zinc-900 border border-[#e4e1d9] dark:border-zinc-800 text-xs text-charcoal dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Gear Inventory Size */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-steel dark:text-zinc-300 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-zinc-400" />
                    Camera / Gear Fleet Size
                  </label>
                  <select
                    value={gearSize}
                    onChange={(e) => setGearSize(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-paper dark:bg-zinc-900 border border-[#e4e1d9] dark:border-zinc-800 text-xs text-charcoal dark:text-zinc-100 focus:outline-none focus:border-amber-500 transition cursor-pointer"
                  >
                    <option value="Under 10 units">Under 10 units</option>
                    <option value="10 - 50 units">10 - 50 units (Mid Studio)</option>
                    <option value="50 - 200 units">50 - 200 units (Fleet Rental)</option>
                    <option value="200+ units">200+ units (Enterprise)</option>
                  </select>
                </div>

                {/* Preferred Time Slot */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-steel dark:text-zinc-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-zinc-400" />
                    Preferred Slot
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tomorrow Afternoon"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-paper dark:bg-zinc-900 border border-[#e4e1d9] dark:border-zinc-800 text-xs text-charcoal dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              {/* Requirements & Notes */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-steel dark:text-zinc-300">
                  Notes & Specific Needs (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Need multi-warehouse checkouts and automated freelancer UPI payouts"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-paper dark:bg-zinc-900 border border-[#e4e1d9] dark:border-zinc-800 text-xs text-charcoal dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-amber-500 transition resize-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-5 rounded-xl bg-charcoal text-white dark:bg-white dark:text-charcoal hover:opacity-90 font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Scheduling Walkthrough...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Confirm Demo Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
