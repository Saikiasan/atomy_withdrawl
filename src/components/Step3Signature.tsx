import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Upload, Eraser, Check, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { processSignaturePhoto } from '../utils/imageUtils';
import { WithdrawalFormData } from '../types';

interface Step3Props {
  formData: WithdrawalFormData;
  updateFormData: (updates: Partial<WithdrawalFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step3Signature: React.FC<Step3Props> = ({
  formData,
  updateFormData,
  onNext,
  onBack,
}) => {
  // Mobile-first default to 'draw' since phones have touch screens
  const [activeTab, setActiveTab] = useState<'draw' | 'upload'>('draw');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const webpCleaned = await processSignaturePhoto(file);
      updateFormData({ signatureImageWebP: webpCleaned });
    } catch {
      setErrorMsg('Failed to process image. Try a clearer photo or sign on screen.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
  }, [activeTab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const webpUrl = canvas.toDataURL('image/webp', 0.95);
    updateFormData({ signatureImageWebP: webpUrl });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    updateFormData({ signatureImageWebP: null });
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="pb-1">
        <h2 className="text-base font-semibold text-slate-900">Applicant Signature</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Sign directly using your finger/stylus or upload a photo of your signature on paper.
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3.5">
        {/* Minimal Tab Switcher */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('draw')}
            className={`flex-1 py-1.5 rounded-md font-medium transition cursor-pointer ${
              activeTab === 'draw'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign on Screen
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-1.5 rounded-md font-medium transition cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Upload Paper Photo
          </button>
        </div>

        {/* Tab 1: Screen Touch Pad */}
        {activeTab === 'draw' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Sign within the box below</span>
              <button
                type="button"
                onClick={clearCanvas}
                className="text-slate-600 hover:text-rose-600 flex items-center gap-1 transition cursor-pointer"
              >
                <Eraser className="w-3 h-3" />
                Clear
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl bg-slate-50/50 overflow-hidden relative touch-none h-40">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full cursor-crosshair"
              />
              {!hasDrawn && !formData.signatureImageWebP && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-300 text-xs">
                  Draw signature here
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Upload Photo */}
        {activeTab === 'upload' && (
          <div className="space-y-2">
            <label className="border border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-5 text-center cursor-pointer flex flex-col items-center justify-center gap-1.5 bg-slate-50/50 hover:bg-slate-50 transition active:scale-[0.99] h-36">
              <Upload className="w-5 h-5 text-slate-400" />
              <span className="text-xs font-medium text-slate-700">
                {isProcessing ? 'Cleaning background...' : 'Upload Signature Photo'}
              </span>
              <span className="text-[10px] text-slate-400">Written on blank white paper</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleSignatureUpload}
                disabled={isProcessing}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Saved Signature Feedback */}
        {formData.signatureImageWebP && (
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
            <span className="text-[11px] font-medium text-slate-700 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" /> Signature ready
            </span>
            <div className="h-8 max-w-[120px] bg-white rounded px-2 flex items-center justify-center border border-slate-200">
              <img
                src={formData.signatureImageWebP}
                alt="Signature preview"
                className="max-h-full object-contain"
              />
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
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
          disabled={!formData.signatureImageWebP}
          className={`flex-2 py-3 rounded-xl text-xs font-medium shadow-xs flex items-center justify-center gap-1.5 transition ${
            formData.signatureImageWebP
              ? 'bg-slate-900 hover:bg-slate-800 text-white active:scale-[0.99] cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          <span>Generate Form PDF</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
