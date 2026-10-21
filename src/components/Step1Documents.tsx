import React, { useState } from 'react';
import { Upload, Camera, Check, AlertCircle, ArrowRight, RefreshCw, FileText, Key, Sparkles } from 'lucide-react';
import { fileToWebPDataUrl } from '../utils/imageUtils';
import { DocumentExtractionResult, WithdrawalFormData } from '../types';
import { extractDocumentsWithUserKey, hasApiKey } from '../utils/geminiClient';
import { ApiKeyModal } from './ApiKeyModal';

interface Step1Props {
  formData: WithdrawalFormData;
  updateFormData: (updates: Partial<WithdrawalFormData>) => void;
  onNext: () => void;
}

export const Step1Documents: React.FC<Step1Props> = ({
  formData,
  updateFormData,
  onNext,
}) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractedInfo, setExtractedInfo] = useState<string | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);

  const handlePanUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const webpUrl = await fileToWebPDataUrl(file);
      updateFormData({ panImageWebP: webpUrl });
      setExtractError(null);
    } catch {
      setExtractError('Could not process PAN card image.');
    }
  };

  const handleAadhaarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const webpUrl = await fileToWebPDataUrl(file);
      updateFormData({ aadhaarImageWebP: webpUrl });
      setExtractError(null);
    } catch {
      setExtractError('Could not process Aadhaar card image.');
    }
  };

  const handleAadhaarBackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const webpUrl = await fileToWebPDataUrl(file);
      updateFormData({ aadhaarBackImageWebP: webpUrl });
    } catch {
      setExtractError('Could not process Aadhaar back image.');
    }
  };

  const runGeminiExtraction = async () => {
    if (!formData.panImageWebP && !formData.aadhaarImageWebP) {
      setExtractError('Please upload your PAN card or Aadhaar card first.');
      return;
    }

    if (!hasApiKey()) {
      setShowKeyModal(true);
      return;
    }

    setIsExtracting(true);
    setExtractError(null);
    setExtractedInfo(null);

    try {
      const ext = await extractDocumentsWithUserKey({
        panImage: formData.panImageWebP,
        aadhaarImage: formData.aadhaarImageWebP,
        aadhaarBackImage: formData.aadhaarBackImageWebP,
      });

      updateFormData({
        applicantName: ext.applicantName || formData.applicantName,
        panNumber: ext.panNumber || formData.panNumber,
        aadhaarNumber: ext.aadhaarNumber || formData.aadhaarNumber,
        mobileNumber: ext.mobileNumber || formData.mobileNumber,
        emailId: ext.emailId || formData.emailId,
        address: ext.address || formData.address,
        city: ext.city || formData.city,
        state: ext.state || formData.state,
        pinCode: ext.pinCode || formData.pinCode,
        otherIdProof: ext.aadhaarNumber
          ? `Aadhaar Card: ${ext.aadhaarNumber}`
          : formData.otherIdProof,
      });

      setExtractedInfo(
        `Extracted: ${ext.applicantName || ''} ${ext.panNumber ? `(${ext.panNumber})` : ''}`.trim()
      );
    } catch (err: any) {
      setExtractError(err.message || 'Error processing documents.');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Minimal Subheading */}
      <div className="pb-1">
        <h2 className="text-base font-semibold text-slate-900">Upload ID Proofs</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Upload your PAN and Aadhaar cards. AI will read your details and paste your PAN photo onto the official form.
        </p>
      </div>

      {/* Upload Cards: Mobile-first stacked layout */}
      <div className="space-y-3">
        {/* PAN Card Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-semibold text-slate-900">
                PAN Card <span className="text-rose-500">*</span>
              </span>
              <p className="text-[11px] text-slate-400">Pasted into withdrawal form</p>
            </div>
            {formData.panImageWebP && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                <Check className="w-3 h-3" /> Ready
              </span>
            )}
          </div>

          {formData.panImageWebP ? (
            <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900 h-36 flex items-center justify-center">
              <img
                src={formData.panImageWebP}
                alt="PAN Card"
                className="w-full h-full object-contain"
              />
              <label className="absolute bottom-2 right-2 bg-black/70 hover:bg-black text-white text-[10px] font-medium px-2 py-1 rounded-md cursor-pointer transition">
                Change
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePanUpload}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <label className="border border-dashed border-slate-300 hover:border-slate-400 rounded-lg p-4 text-center cursor-pointer flex flex-col items-center justify-center gap-1.5 bg-slate-50/50 hover:bg-slate-50 transition active:scale-[0.99] h-28">
              <Camera className="w-5 h-5 text-slate-400" />
              <span className="text-xs font-medium text-slate-700">Take Photo or Upload PAN</span>
              <span className="text-[10px] text-slate-400">Front side only (WebP)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePanUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Aadhaar Card Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-semibold text-slate-900">Aadhaar Card</span>
              <p className="text-[11px] text-slate-400">For name and address verification</p>
            </div>
            {(formData.aadhaarImageWebP || formData.aadhaarBackImageWebP) && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                <Check className="w-3 h-3" /> Added
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Front */}
            {formData.aadhaarImageWebP ? (
              <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900 h-24 flex items-center justify-center">
                <img
                  src={formData.aadhaarImageWebP}
                  alt="Aadhaar Front"
                  className="w-full h-full object-contain"
                />
                <label className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded cursor-pointer">
                  Replace
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAadhaarUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <label className="border border-dashed border-slate-300 hover:border-slate-400 rounded-lg p-3 text-center cursor-pointer flex flex-col items-center justify-center gap-1 bg-slate-50/50 hover:bg-slate-50 transition active:scale-[0.99] h-24">
                <Upload className="w-4 h-4 text-slate-400" />
                <span className="text-[11px] font-medium text-slate-700">Aadhaar Front</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAadhaarUpload}
                  className="hidden"
                />
              </label>
            )}

            {/* Back (Address) */}
            {formData.aadhaarBackImageWebP ? (
              <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900 h-24 flex items-center justify-center">
                <img
                  src={formData.aadhaarBackImageWebP}
                  alt="Aadhaar Back"
                  className="w-full h-full object-contain"
                />
                <label className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded cursor-pointer">
                  Replace
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAadhaarBackUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <label className="border border-dashed border-slate-300 hover:border-slate-400 rounded-lg p-3 text-center cursor-pointer flex flex-col items-center justify-center gap-1 bg-slate-50/50 hover:bg-slate-50 transition active:scale-[0.99] h-24">
                <Upload className="w-4 h-4 text-slate-400" />
                <span className="text-[11px] font-medium text-slate-700">Aadhaar Back</span>
                <span className="text-[9px] text-slate-400">Optional</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAadhaarBackUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* AI Extraction Button & Manual Skip */}
      <div className="space-y-2">
        <button
          onClick={runGeminiExtraction}
          disabled={isExtracting || (!formData.panImageWebP && !formData.aadhaarImageWebP)}
          className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-[0.99] ${
            isExtracting
              ? 'bg-slate-100 text-slate-400 cursor-wait'
              : !formData.panImageWebP && !formData.aadhaarImageWebP
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 cursor-pointer'
          }`}
        >
          {isExtracting ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-600" />
              <span>Extracting with AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>{extractedInfo ? 'Re-scan with AI (Free Gemini)' : 'Auto-fill Details with AI (Free Gemini)'}</span>
            </>
          )}
        </button>

        {!hasApiKey() && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowKeyModal(true)}
              className="text-[11px] text-slate-500 hover:text-blue-600 inline-flex items-center gap-1 cursor-pointer"
            >
              <Key className="w-3 h-3" />
              <span>Set your free Gemini API key to enable AI auto-fill</span>
            </button>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {extractError && (
        <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{extractError}</span>
        </div>
      )}

      {extractedInfo && (
        <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{extractedInfo}. You can edit all fields in the next step.</span>
        </div>
      )}

      {/* Primary Action Button & Skip Option */}
      <div className="space-y-2 pt-1">
        <button
          onClick={onNext}
          disabled={!formData.panImageWebP && !formData.aadhaarImageWebP}
          className={`w-full py-3 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition ${
            formData.panImageWebP || formData.aadhaarImageWebP
              ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs active:scale-[0.99] cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          <span>Continue to Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onNext}
          className="w-full py-2 text-center text-xs text-slate-500 hover:text-slate-800 font-medium transition cursor-pointer"
        >
          Skip photo upload & enter all details manually →
        </button>
      </div>

      <ApiKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onKeySaved={() => {
          if (formData.panImageWebP || formData.aadhaarImageWebP) {
            runGeminiExtraction();
          }
        }}
      />
    </div>
  );
};
