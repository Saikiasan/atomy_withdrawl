import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, ChevronUp, Key } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { ApiKeyModal } from './ApiKeyModal';
import { hasApiKey } from '../utils/geminiClient';

interface NavbarProps {
  currentStep: number;
  setStep: (step: number) => void;
  maxStepReached: number;
  onLoadDemo?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStep,
  setStep,
  maxStepReached,
  onLoadDemo,
}) => {
  const [showStepList, setShowStepList] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyConfigured, setKeyConfigured] = useState(false);

  useEffect(() => {
    setKeyConfigured(hasApiKey());
  }, []);

  const refreshKeyStatus = () => {
    setKeyConfigured(hasApiKey());
  };

  const steps = [
    { num: 1, title: 'Upload Documents', short: 'Documents' },
    { num: 2, title: 'Member Details', short: 'Details' },
    { num: 3, title: 'Signature', short: 'Signature' },
    { num: 4, title: 'Review Form PDF', short: 'Review' },
    { num: 5, title: 'Draft & Send Email', short: 'Email' },
  ];

  const totalSteps = steps.length;
  const remainingSteps = totalSteps - currentStep;
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  // SVG circular progress calculation
  // Radius: 14, strokeWidth: 2.8, center: 18, 18
  const radius = 14;
  const circumference = 2 * Math.PI * radius; // ~87.96
  const strokeDashoffset = circumference - (currentStep / totalSteps) * circumference;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-2xs">
      <div className="max-w-md sm:max-w-xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between">
          {/* Left: Compact Circular Progress Stepper & Title */}
          <button
            type="button"
            onClick={() => setShowStepList(!showStepList)}
            className="flex items-center gap-3 text-left group cursor-pointer"
            title="Click to view all steps"
          >
            {/* Circular Progress Gauge */}
            <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
              <svg className="w-10 h-10 -rotate-90 transform" viewBox="0 0 36 36">
                {/* Background Ring */}
                <circle
                  cx="18"
                  cy="18"
                  r={radius}
                  className="stroke-slate-100"
                  strokeWidth="3"
                  fill="none"
                />
                {/* Dynamic Progress Arc */}
                <circle
                  cx="18"
                  cy="18"
                  r={radius}
                  className="stroke-slate-900 transition-all duration-500 ease-out"
                  strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>

              {/* Center Counter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[11px] font-bold tracking-tight text-slate-900 leading-none">
                  {currentStep}
                </span>
                <span className="text-[8px] font-medium text-slate-400 leading-none mt-0.5">
                  of {totalSteps}
                </span>
              </div>
            </div>

            {/* Title & Remaining Steps Notice */}
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs font-semibold tracking-tight text-slate-900">
                  Withdrawal Form
                </h1>
                {showStepList ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition" />
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <span className="text-slate-800 font-semibold truncate max-w-[120px] sm:max-w-none">
                  {steps[currentStep - 1].title}
                </span>
                <span>•</span>
                <span className="text-slate-400 text-[10px]">
                  {remainingSteps === 0
                    ? 'Final Step'
                    : `${remainingSteps} remaining`}
                </span>
              </div>
            </div>
          </button>

          {/* Right side actions: API Key, Demo & Install */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setShowKeyModal(true)}
              className={`text-[11px] font-medium px-2 py-1 rounded-md border flex items-center gap-1 transition-colors cursor-pointer ${
                keyConfigured
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
              title="Configure Google Gemini API Key"
            >
              <Key className="w-3 h-3" />
              <span className="hidden sm:inline">{keyConfigured ? 'AI Key Set' : 'AI Key'}</span>
            </button>
            {onLoadDemo && (
              <button
                onClick={onLoadDemo}
                className="text-[11px] font-medium text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md hover:bg-slate-100 transition active:scale-95 cursor-pointer"
              >
                Demo
              </button>
            )}
            <PWAInstallButton />
          </div>
        </div>

        {/* Compact Circular Nodes Row: visually indicates current and remaining steps */}
        <div className="flex items-center justify-between pt-2.5 px-1">
          {steps.map((step, idx) => {
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;
            const isAccessible = step.num <= maxStepReached;

            return (
              <React.Fragment key={step.num}>
                {/* Node */}
                <button
                  type="button"
                  onClick={() => isAccessible && setStep(step.num)}
                  disabled={!isAccessible}
                  className={`group relative flex flex-col items-center transition-all ${
                    isAccessible ? 'cursor-pointer' : 'cursor-default'
                  }`}
                  aria-label={`Step ${step.num}: ${step.title}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-200 ${
                      isCurrent
                        ? 'bg-slate-900 text-white shadow-xs ring-2 ring-slate-900 ring-offset-2'
                        : isCompleted
                        ? 'bg-sky-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : step.num}
                  </div>
                  <span
                    className={`text-[9px] mt-1 font-medium transition-colors hidden sm:block ${
                      isCurrent
                        ? 'text-slate-900 font-semibold'
                        : isCompleted
                        ? 'text-sky-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.short}
                  </span>
                </button>

                {/* Connector line between steps */}
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1.5 transition-colors duration-300 ${
                      currentStep > idx + 1 ? 'bg-sky-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Expandable Step Overview Sheet (Tap on header to toggle) */}
        {showStepList && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium px-1 pb-1">
              <span>Process Checklist</span>
              <span>{progressPercent}% Complete</span>
            </div>
            {steps.map((step) => {
              const isCompleted = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              const isAccessible = step.num <= maxStepReached;

              return (
                <button
                  key={step.num}
                  onClick={() => {
                    if (isAccessible) {
                      setStep(step.num);
                      setShowStepList(false);
                    }
                  }}
                  disabled={!isAccessible}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                    isCurrent
                      ? 'bg-slate-900 text-white font-semibold'
                      : isCompleted
                      ? 'bg-sky-50 text-sky-900 hover:bg-sky-100 cursor-pointer'
                      : isAccessible
                      ? 'text-slate-600 hover:bg-slate-50 cursor-pointer'
                      : 'text-slate-300 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                        isCurrent
                          ? 'bg-white text-slate-900'
                          : isCompleted
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isCompleted ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : step.num}
                    </span>
                    <span>{step.title}</span>
                  </div>
                  <span className="text-[10px] opacity-75">
                    {isCurrent ? 'In Progress' : isCompleted ? 'Completed' : 'Upcoming'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <ApiKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onKeySaved={refreshKeyStatus}
      />
    </header>
  );
};
