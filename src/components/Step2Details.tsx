import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { WithdrawalFormData } from '../types';

interface Step2Props {
  formData: WithdrawalFormData;
  updateFormData: (updates: Partial<WithdrawalFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2Details: React.FC<Step2Props> = ({
  formData,
  updateFormData,
  onNext,
  onBack,
}) => {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const commonReasons = [
    'Personal reasons',
    'Inactivity / lack of time',
    'Relocating abroad',
    'Financial considerations',
    'Registered by mistake',
  ];

  // Validation rules
  const isNameValid = formData.applicantName.trim().length >= 2;
  const isMemberIdValid = formData.memberId.trim().length >= 4;
  
  // Indian PAN format: 5 letters, 4 numbers, 1 letter (e.g., ABCDE1234F)
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const cleanPan = formData.panNumber.trim().toUpperCase();
  const isPanValid = panRegex.test(cleanPan);

  // Mobile number validation (10 digits, or with +91/0 prefix)
  const phoneDigits = formData.mobileNumber.replace(/\D/g, '');
  const isMobileValid =
    phoneDigits.length === 10 ||
    (phoneDigits.length === 12 && phoneDigits.startsWith('91')) ||
    (phoneDigits.length === 11 && phoneDigits.startsWith('0'));

  // Standard email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const isEmailValid = emailRegex.test(formData.emailId.trim());

  // 6-digit Indian PIN code validation (if provided)
  const pinDigits = formData.pinCode.trim();
  const isPinValid = !pinDigits || /^\d{6}$/.test(pinDigits);

  // Reason for withdrawal validation
  const isReasonValid = formData.reason.trim().length >= 3;

  // Overall Step 2 validity
  const isStep2Valid =
    isNameValid &&
    isMemberIdValid &&
    isPanValid &&
    isMobileValid &&
    isEmailValid &&
    isPinValid &&
    isReasonValid;

  // Validation feedback helper
  const getFieldState = (field: string, isValid: boolean) => {
    const isFieldTouched = touched[field] || Boolean(formData[field as keyof WithdrawalFormData]);
    if (!isFieldTouched) return 'neutral';
    return isValid ? 'valid' : 'invalid';
  };

  const getInputClasses = (state: 'neutral' | 'valid' | 'invalid') => {
    switch (state) {
      case 'valid':
        return 'border-emerald-300 focus:border-emerald-500 bg-emerald-50/20';
      case 'invalid':
        return 'border-rose-400 focus:border-rose-500 bg-rose-50/20';
      default:
        return 'border-slate-200 focus:border-slate-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="pb-1">
        <h2 className="text-base font-semibold text-slate-900">Member & Contact Information</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Verify your details extracted from documents. All required fields are validated in real time.
        </p>
      </div>

      <div className="space-y-3.5 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        {/* Applicant Name */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Applicant Name <span className="text-rose-500">*</span>
            </label>
            {getFieldState('applicantName', isNameValid) === 'valid' && (
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                <Check className="w-3 h-3" /> Valid
              </span>
            )}
          </div>
          <input
            type="text"
            value={formData.applicantName}
            onBlur={() => markTouched('applicantName')}
            onChange={(e) => updateFormData({ applicantName: e.target.value })}
            placeholder="Full Name as on PAN"
            className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold text-slate-900 outline-none uppercase transition ${getInputClasses(
              getFieldState('applicantName', isNameValid)
            )}`}
            required
          />
          {touched.applicantName && !isNameValid && (
            <p className="text-[10px] text-rose-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              Please enter the applicant full name (minimum 2 letters).
            </p>
          )}
        </div>

        {/* Member ID */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Atomy Member ID <span className="text-rose-500">*</span>
            </label>
            {getFieldState('memberId', isMemberIdValid) === 'valid' ? (
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                <Check className="w-3 h-3" /> Valid
              </span>
            ) : (
              <span className="text-[10px] text-slate-400">From Atomy App / SMS</span>
            )}
          </div>
          <input
            type="text"
            value={formData.memberId}
            onBlur={() => markTouched('memberId')}
            onChange={(e) => updateFormData({ memberId: e.target.value })}
            placeholder="e.g., 34567890 or IND123456"
            className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold text-slate-900 outline-none transition ${getInputClasses(
              getFieldState('memberId', isMemberIdValid)
            )}`}
            required
          />
          {touched.memberId && !isMemberIdValid && (
            <p className="text-[10px] text-rose-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              Please enter your valid Atomy Member ID (at least 4 characters).
            </p>
          )}
        </div>

        {/* PAN & Mobile in 2 columns on mobile */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* PAN Number */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                PAN Number <span className="text-rose-500">*</span>
              </label>
              {getFieldState('panNumber', isPanValid) === 'valid' && (
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                  <Check className="w-3 h-3" />
                </span>
              )}
            </div>
            <input
              type="text"
              value={formData.panNumber}
              onBlur={() => markTouched('panNumber')}
              onChange={(e) =>
                updateFormData({ panNumber: e.target.value.toUpperCase() })
              }
              placeholder="ABCDE1234F"
              maxLength={10}
              className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold text-slate-900 outline-none uppercase tracking-wider transition ${getInputClasses(
                getFieldState('panNumber', isPanValid)
              )}`}
              required
            />
            {touched.panNumber && !isPanValid && (
              <p className="text-[10px] text-rose-500 mt-1 flex items-start gap-1">
                <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                <span>Format: 5 letters, 4 numbers, 1 letter (e.g. ABCDE1234F)</span>
              </p>
            )}
          </div>

          {/* Mobile Number */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              {getFieldState('mobileNumber', isMobileValid) === 'valid' && (
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                  <Check className="w-3 h-3" />
                </span>
              )}
            </div>
            <input
              type="tel"
              value={formData.mobileNumber}
              onBlur={() => markTouched('mobileNumber')}
              onChange={(e) => updateFormData({ mobileNumber: e.target.value })}
              placeholder="9876543210"
              className={`w-full px-3 py-2.5 rounded-xl border text-xs font-medium text-slate-900 outline-none transition ${getInputClasses(
                getFieldState('mobileNumber', isMobileValid)
              )}`}
              required
            />
            {touched.mobileNumber && !isMobileValid && (
              <p className="text-[10px] text-rose-500 mt-1 flex items-start gap-1">
                <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                <span>Enter 10-digit mobile number</span>
              </p>
            )}
          </div>
        </div>

        {/* Email ID */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Email ID <span className="text-rose-500">*</span>
            </label>
            {getFieldState('emailId', isEmailValid) === 'valid' && (
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                <Check className="w-3 h-3" /> Valid Email
              </span>
            )}
          </div>
          <input
            type="email"
            value={formData.emailId}
            onBlur={() => markTouched('emailId')}
            onChange={(e) => updateFormData({ emailId: e.target.value })}
            placeholder="your.email@example.com"
            className={`w-full px-3 py-2.5 rounded-xl border text-xs font-medium text-slate-900 outline-none transition ${getInputClasses(
              getFieldState('emailId', isEmailValid)
            )}`}
            required
          />
          {touched.emailId && !isEmailValid && (
            <p className="text-[10px] text-rose-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              Please enter a valid email address (e.g. name@example.com).
            </p>
          )}
        </div>

        {/* Other ID Proof */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
            Other ID Proof (Aadhaar)
          </label>
          <input
            type="text"
            value={formData.otherIdProof}
            onChange={(e) => updateFormData({ otherIdProof: e.target.value })}
            placeholder="e.g., Aadhaar Card: 1234 5678 9012"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-slate-800 text-xs font-medium text-slate-900 outline-none transition"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
            Residential Address
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => updateFormData({ address: e.target.value })}
            placeholder="Street address line"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-slate-800 text-xs font-medium text-slate-900 outline-none transition"
          />
        </div>

        {/* City, State, PIN */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] text-slate-400 mb-0.5">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => updateFormData({ city: e.target.value })}
              placeholder="City"
              className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 mb-0.5">State</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => updateFormData({ state: e.target.value })}
              placeholder="State"
              className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs outline-none"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <label className="block text-[10px] text-slate-400">PIN Code</label>
              {pinDigits && isPinValid && (
                <span className="text-[9px] text-emerald-600 font-bold">✓</span>
              )}
            </div>
            <input
              type="text"
              value={formData.pinCode}
              onBlur={() => markTouched('pinCode')}
              onChange={(e) =>
                updateFormData({ pinCode: e.target.value.replace(/\D/g, '').slice(0, 6) })
              }
              placeholder="6 digits"
              maxLength={6}
              className={`w-full px-2.5 py-2 rounded-lg border text-xs outline-none transition ${getInputClasses(
                getFieldState('pinCode', isPinValid)
              )}`}
            />
          </div>
        </div>
        {touched.pinCode && !isPinValid && (
          <p className="text-[10px] text-rose-500 mt-0.5 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            PIN code must be exactly 6 digits.
          </p>
        )}

        {/* Reason for withdrawal */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">
            Reason for Withdrawal <span className="text-rose-500">*</span>
          </label>
          {/* Horizontally scrollable chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
            {commonReasons.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  updateFormData({ reason: r });
                  markTouched('reason');
                }}
                className={`text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap transition cursor-pointer ${
                  formData.reason === r
                    ? 'bg-slate-900 text-white font-medium'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={formData.reason}
            onBlur={() => markTouched('reason')}
            onChange={(e) => updateFormData({ reason: e.target.value })}
            placeholder="Reason for withdrawal"
            className={`w-full px-3 py-2.5 rounded-xl border text-xs font-medium text-slate-900 outline-none transition mt-1.5 ${getInputClasses(
              getFieldState('reason', isReasonValid)
            )}`}
            required
          />
          {touched.reason && !isReasonValid && (
            <p className="text-[10px] text-rose-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              Please provide a reason for withdrawal.
            </p>
          )}
        </div>

        {/* Date & Place */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div>
            <label className="block text-[10px] text-slate-400 mb-0.5">Date</label>
            <input
              type="text"
              value={formData.date}
              onChange={(e) => updateFormData({ date: e.target.value })}
              className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 mb-0.5">Place</label>
            <input
              type="text"
              value={formData.place}
              onChange={(e) => updateFormData({ place: e.target.value })}
              placeholder="City/Town"
              className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs outline-none"
            />
          </div>
        </div>
      </div>

      {/* Validation status notice if incomplete */}
      {!isStep2Valid && (
        <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Complete required fields marked with * to proceed</span>
          </span>
          <span className="font-semibold text-slate-800">
            {[isNameValid, isMemberIdValid, isPanValid, isMobileValid, isEmailValid, isReasonValid].filter(Boolean).length}/6 Complete
          </span>
        </div>
      )}

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
          disabled={!isStep2Valid}
          className={`flex-2 py-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition ${
            isStep2Valid
              ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs active:scale-[0.99] cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
          title={
            isStep2Valid
              ? 'Continue to signature'
              : 'Please enter valid Name, Member ID, PAN (10 chars), Mobile, Email, and Reason'
          }
        >
          <span>Continue to Signature</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
