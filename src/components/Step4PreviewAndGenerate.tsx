import React, { useEffect, useState } from 'react';
import { Download, Share2, ArrowLeft, ArrowRight, RefreshCw, Check, Eye, EyeOff, ExternalLink } from 'lucide-react';
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

  const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

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
    if (!pdfBytes) return;
    const filename = `Atomy_Withdrawal_Form_${formData.memberId || 'Form'}.pdf`;
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    // On iOS Safari, anchor download is often ignored, so window.open provides a reliable fallback
    const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isIOS) {
      window.open(url, '_blank');
      return;
    }

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1000);
  };

  const handleShare = async () => {
    if (!pdfBytes) return;
    try {
      const filename = `Atomy_Withdrawal_Form_${formData.memberId || 'Form'}.pdf`;
      // Pass the Uint8Array directly into File constructor (avoiding .buffer offset corruption)
      const file = new File([pdfBytes], filename, { type: 'application/pdf' });

      // Clean file sharing payload for iOS/Android without conflicting text parameters
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({
          title: `Atomy Withdrawal Form - ${formData.memberId || ''}`,
          url: pdfBlobUrl || window.location.href,
        });
      } else {
        handleDownload();
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Share not completed:', err);
      }
    }
  };

  const handleOpenFullscreen = () => {
    if (pdfBlobUrl) {
      window.open(pdfBlobUrl, '_blank');
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
          <div className="w-full bg-slate-100 flex flex-col items-center justify-center p-3">
            {isGenerating ? (
              <div className="h-64 flex items-center justify-center gap-2 text-xs text-slate-500">
                <RefreshCw className="w-4 h-4 animate-spin text-slate-600" />
                <span>Compiling PDF...</span>
              </div>
            ) : pdfBlobUrl ? (
              <>
                {/* Mobile-Friendly Fullscreen Notice & Button */}
                {isMobile ? (
                  <div className="py-6 px-4 text-center space-y-3 w-full bg-white rounded-lg border border-slate-200">
                    <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
                      <Eye className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-800">Mobile PDF Ready</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Mobile browsers display PDFs in their native viewer.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenFullscreen}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium shadow-2xs hover:bg-slate-800 transition active:scale-95 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Form in Full Screen</span>
                    </button>
                  </div>
                ) : (
                  <iframe
                    src={`${pdfBlobUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                    title="Atomy Withdrawal Form"
                    className="w-full h-96 rounded-lg border border-slate-200 bg-white"
                  />
                )}
              </>
            ) : (
              <span className="text-xs text-slate-400 py-12">Preview not available</span>
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
