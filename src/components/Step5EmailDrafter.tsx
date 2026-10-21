import React, { useState, useEffect } from 'react';
import { Mail, Copy, Check, ExternalLink, ArrowLeft, Send, Paperclip } from 'lucide-react';
import { WithdrawalFormData, EmailDraft } from '../types';

interface Step5Props {
  formData: WithdrawalFormData;
  onBack: () => void;
}

export const Step5EmailDrafter: React.FC<Step5Props> = ({ formData, onBack }) => {
  const [tone, setTone] = useState<'formal' | 'polite' | 'concise'>('formal');
  const [isDrafting, setIsDrafting] = useState(false);
  const [draft, setDraft] = useState<EmailDraft>({
    recipient: 'atomy_in@atomypark.com',
    subject: `Atomy Membership Withdrawal Form _ ${formData.memberId || 'IND123456'}`,
    body: '',
  });
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  const fetchEmailDraft = async (selectedTone: 'formal' | 'polite' | 'concise' = tone) => {
    setIsDrafting(true);
    try {
      const response = await fetch('/api/draft-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantName: formData.applicantName,
          memberId: formData.memberId,
          panNumber: formData.panNumber,
          mobileNumber: formData.mobileNumber,
          emailId: formData.emailId,
          reason: formData.reason,
          tone: selectedTone,
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        setDraft(json.data);
      }
    } catch {
      // Fallback
      setDraft({
        recipient: 'atomy_in@atomypark.com',
        subject: `Atomy Membership Withdrawal Form _ ${formData.memberId || ''}`,
        body: `Dear Atomy India Support Team,\n\nPlease find attached my signed Atomy Membership Withdrawal Request Form and identity proof documents.\n\nMember Details:\n- Name: ${formData.applicantName}\n- Member ID: ${formData.memberId}\n- PAN: ${formData.panNumber}\n- Contact: ${formData.mobileNumber}\n- Reason: ${formData.reason || 'Personal reasons'}\n\nKindly process my withdrawal request and confirm account de-registration.\n\nThank you.\n\nSincerely,\n${formData.applicantName}\n${formData.mobileNumber}`,
      });
    } finally {
      setIsDrafting(false);
    }
  };

  useEffect(() => {
    fetchEmailDraft(tone);
  }, [tone]);

  const copyToClipboard = async (text: string, isSubject: boolean) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isSubject) {
        setCopiedSubject(true);
        setTimeout(() => setCopiedSubject(false), 2000);
      } else {
        setCopiedBody(true);
        setTimeout(() => setCopiedBody(false), 2000);
      }
    } catch {
      // Ignored
    }
  };

  const mailtoUrl = `mailto:${draft.recipient}?subject=${encodeURIComponent(
    draft.subject
  )}&body=${encodeURIComponent(draft.body)}`;

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    draft.recipient
  )}&su=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="pb-1">
        <h2 className="text-base font-semibold text-slate-900">Email Submission</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Send the drafted email to Atomy India support with your filled form attached.
        </p>
      </div>

      {/* Reminder Banner */}
      <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/60 text-xs text-amber-900 flex items-center gap-2.5">
        <Paperclip className="w-4 h-4 text-amber-600 shrink-0" />
        <span className="text-[11px] leading-tight">
          Remember to attach the downloaded PDF before tapping send in your email app.
        </span>
      </div>

      {/* Email Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        {/* Tone Selector */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Draft Tone
          </span>
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px]">
            {(['formal', 'polite', 'concise'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition cursor-pointer ${
                  tone === t
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Recipient */}
        <div>
          <span className="text-[10px] font-medium text-slate-400 block mb-0.5">To</span>
          <div className="text-xs font-semibold text-slate-800 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
            {draft.recipient}
          </div>
        </div>

        {/* Subject */}
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] font-medium text-slate-400">Subject</span>
            <button
              onClick={() => copyToClipboard(draft.subject, true)}
              className="text-[11px] text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer font-medium"
            >
              {copiedSubject ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <input
            type="text"
            value={draft.subject}
            onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
            className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 outline-none"
          />
        </div>

        {/* Body */}
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] font-medium text-slate-400">Message</span>
            <button
              onClick={() => copyToClipboard(draft.body, false)}
              className="text-[11px] text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer font-medium"
            >
              {copiedBody ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <textarea
            rows={7}
            value={draft.body}
            onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            className="w-full p-3 rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed outline-none"
          />
        </div>

        {/* Direct Send Buttons: Mobile-first */}
        <div className="space-y-2 pt-1">
          <a
            href={mailtoUrl}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-2 active:scale-[0.99] transition shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Open in Phone Email App</span>
          </a>

          <a
            href={gmailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center justify-center gap-1.5 active:scale-[0.99] transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>Open in Gmail (Web)</span>
          </a>
        </div>
      </div>

      {/* Back button */}
      <div className="pt-1">
        <button
          onClick={onBack}
          className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center justify-center gap-1 transition active:scale-[0.99] cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Form Preview</span>
        </button>
      </div>
    </div>
  );
};
