import React, { useEffect, useState } from 'react';
import { Download, Share2, ArrowLeft, ArrowRight, RefreshCw, Check, Eye, EyeOff } from 'lucide-react';
import { generateAtomyWithdrawalPdf } from '../utils/pdfGenerator';
import { WithdrawalFormData } from '../types';

interface Step4Props {
  formData: WithdrawalFormData;
  onNext: () => void;
  onBack: () => void;
}

export const Step4PreviewAndGenerate: React.FC<Step4Props> = ({
  formData,
  onNext,
  onBack,
}) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const generatePdf = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const result = await generateAtomyWithdrawalPdf(formData);
      setPdfBlobUrl(result.blobUrl);
      setPdfBytes(result.pdfBytes);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to generate PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generatePdf();
  }, [formData]);

  const handleDownload = () => {
    if (!pdfBlobUrl) return;
    const filename = `Atomy_Withdrawal_Form_${formData.memberId || 'Form'}.pdf`;
    const link = document.createElement('a');
    link.href = pdfBlobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!pdfBytes) return;
    try {
      const filename = `Atomy_Withdrawal_Form_${formData.memberId || 'Form'}.pdf`;
      const file = new File([pdfBytes.buffer as ArrayBuffer], filename, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Atomy Withdrawal Form - ${formData.memberId}`,
          text: `Atomy Membership Withdrawal Form for Member ID: ${formData.memberId}`,
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({
          title: `Atomy Withdrawal Form - ${formData.memberId}`,
          text: `Membership Withdrawal Form for ${formData.applicantName}`,
          url: window.location.href,
        });
      } else {
        handleDownload();
      }
    } catch {
      // User cancelled
    }
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="pb-1">
        <h2 className="text-base font-semibold text-slate-900">Form Generated</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Your official withdrawal form has been populated with your details, PAN photo, and signature.
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-2.5">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block">Applicant</span>
            <span className="font-semibold text-slate-900 truncate block">
              {formData.applicantName || '—'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Member ID</span>
            <span className="font-semibold text-slate-900 truncate block">
              {formData.memberId || '—'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">PAN Number</span>
            <span className="font-semibold text-slate-900 truncate block">
              {formData.panNumber || '—'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Status</span>
            <span className="font-semibold text-emerald-600 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Form Complete
            </span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
          <button
            onClick={handleDownload}
            disabled={!pdfBlobUrl}
            className="py-2.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.99] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handleShare}
            disabled={!pdfBytes}
            className="py-2.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 font-medium text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.99] cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* PDF Document Preview Toggle */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showPreview ? 'Hide Document Preview' : 'View Document Preview'}
          </span>
          <span className="text-[10px] text-slate-400">PDF</span>
        </button>

        {showPreview && (
          <div className="h-96 w-full bg-slate-100 flex items-center justify-center p-2">
            {isGenerating ? (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <RefreshCw className="w-4 h-4 animate-spin text-slate-600" />
                <span>Compiling PDF...</span>
              </div>
            ) : pdfBlobUrl ? (
              <iframe
                src={`${pdfBlobUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                title="Atomy Withdrawal Form"
                className="w-full h-full rounded-lg border border-slate-200 bg-white"
              />
            ) : (
              <span className="text-xs text-slate-400">Preview not available</span>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center justify-center gap-1 transition active:scale-[0.99] cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          onClick={onNext}
          className="flex-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-xs flex items-center justify-center gap-1.5 transition active:scale-[0.99] cursor-pointer"
        >
          <span>Continue to Email</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
