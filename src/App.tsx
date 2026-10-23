/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Step1Documents } from './components/Step1Documents';
import { Step2Details } from './components/Step2Details';
import { Step3Signature } from './components/Step3Signature';
import { Step4PreviewAndGenerate } from './components/Step4PreviewAndGenerate';
import { Step5EmailDrafter } from './components/Step5EmailDrafter';
import { WithdrawalFormData } from './types';

export default function App() {
  const today = new Date();
  const todayFormatted = `${String(today.getDate()).padStart(2, '0')}/${String(
    today.getMonth() + 1
  ).padStart(2, '0')}/${today.getFullYear()}`;

  const [currentStep, setCurrentStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);

  const [formData, setFormData] = useState<WithdrawalFormData>({
    applicantName: '',
    memberId: '',
    panNumber: '',
    mobileNumber: '',
    emailId: '',
    aadhaarNumber: '',
    otherIdProof: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    reason: 'Personal reasons',
    date: todayFormatted,
    place: '',
    panImageWebP: null,
    aadhaarImageWebP: null,
    aadhaarBackImageWebP: null,
    signatureImageWebP: null,
  });

  const updateFormData = (updates: Partial<WithdrawalFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNextStep = (nextStep: number) => {
    setCurrentStep(nextStep);
    if (nextStep > maxStepReached) {
      setMaxStepReached(nextStep);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadSampleData = () => {
    // Generate sample signature WebP
    const sigCanvas = document.createElement('canvas');
    sigCanvas.width = 300;
    sigCanvas.height = 100;
    const ctx = sigCanvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(30, 60);
      ctx.bezierCurveTo(70, 20, 110, 80, 150, 40);
      ctx.bezierCurveTo(180, 20, 210, 70, 260, 50);
      ctx.stroke();
    }
    const sampleSigWebP = sigCanvas.toDataURL('image/webp', 0.95);

    // Generate sample PAN card WebP
    const panCanvas = document.createElement('canvas');
    panCanvas.width = 600;
    panCanvas.height = 380;
    const pctx = panCanvas.getContext('2d');
    if (pctx) {
      pctx.fillStyle = '#f8fafc';
      pctx.fillRect(0, 0, 600, 380);
      pctx.fillStyle = '#0284c7';
      pctx.fillRect(0, 0, 600, 50);
      pctx.fillStyle = '#ffffff';
      pctx.font = 'bold 18px sans-serif';
      pctx.fillText('INCOME TAX DEPARTMENT - GOVT OF INDIA', 80, 32);

      pctx.fillStyle = '#0f172a';
      pctx.font = 'bold 20px monospace';
      pctx.fillText('ABCDE1234F', 240, 120);

      pctx.font = 'bold 16px sans-serif';
      pctx.fillText('NAME: ANAND VERMA', 240, 170);
      pctx.fillText("FATHER'S NAME: RAMESH VERMA", 240, 210);
      pctx.fillText('DOB: 15/08/1990', 240, 250);

      pctx.fillStyle = '#cbd5e1';
      pctx.fillRect(30, 80, 160, 200);
      pctx.fillStyle = '#64748b';
      pctx.font = '14px sans-serif';
      pctx.fillText('[PHOTO]', 80, 190);
    }
    const samplePanWebP = panCanvas.toDataURL('image/webp', 0.95);

    updateFormData({
      applicantName: 'ANAND VERMA',
      memberId: 'IND8492015',
      panNumber: 'ABCDE1234F',
      mobileNumber: '+91 98765 43210',
      emailId: 'anand.verma@example.com',
      aadhaarNumber: 'XXXX XXXX 8912',
      otherIdProof: 'Aadhaar Card: XXXX XXXX 8912',
      address: 'Flat 402, Sunshine Heights, Golf Course Road',
      city: 'Gurugram',
      state: 'Haryana',
      pinCode: '122011',
      place: 'Gurugram',
      reason: 'Personal and family reasons',
      panImageWebP: samplePanWebP,
      signatureImageWebP: sampleSigWebP,
    });
    setMaxStepReached(5);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans antialiased selection:bg-sky-500 selection:text-white">
      <Navbar
        currentStep={currentStep}
        setStep={setCurrentStep}
        maxStepReached={maxStepReached}
        onLoadDemo={loadSampleData}
      />
      <OfflineIndicator />

      {/* Responsive Container: Fluid mobile padding, expanding up to 3xl / 4xl on desktop screens */}
      <main className="flex-1 w-full max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 transition-all">
        {currentStep === 1 && (
          <Step1Documents
            formData={formData}
            updateFormData={updateFormData}
            onNext={() => handleNextStep(2)}
          />
        )}

        {currentStep === 2 && (
          <Step2Details
            formData={formData}
            updateFormData={updateFormData}
            onNext={() => handleNextStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <Step3Signature
            formData={formData}
            updateFormData={updateFormData}
            onNext={() => handleNextStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <Step4PreviewAndGenerate
            formData={formData}
            onNext={() => handleNextStep(5)}
            onBack={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 5 && (
          <Step5EmailDrafter
            formData={formData}
            onBack={() => setCurrentStep(4)}
          />
        )}
      </main>

      <footer className="mt-auto py-5 text-center text-xs text-slate-400 border-t border-slate-100 bg-white/50 backdrop-blur-xs">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Atomy Membership Withdrawal Form Assistant</span>
          <span className="text-[11px] text-slate-400">Mobile & Desktop Cross-Platform Compatible</span>
        </div>
      </footer>
    </div>
  );
}
