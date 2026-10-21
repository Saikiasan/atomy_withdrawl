import React, { useState } from 'react';
import { Download, Share2, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-slate-800 transition active:scale-95 cursor-pointer"
        title="Install as App"
      >
        <Download className="w-3 h-3" />
        <span>Install</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200 transition active:scale-95 cursor-pointer"
          title="Install on iPhone"
        >
          <Smartphone className="w-3 h-3" />
          <span>Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-xl border border-slate-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-900">Install on iOS</span>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 space-y-2 text-xs text-slate-600">
                <p>1. Tap <strong className="text-slate-900">Share</strong> <Share2 className="inline w-3 h-3 text-sky-600" /> in Safari toolbar.</p>
                <p>2. Scroll and tap <strong className="text-slate-900">Add to Home Screen</strong>.</p>
                <p>3. Tap <strong className="text-slate-900">Add</strong> to complete.</p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-slate-900 py-2 text-xs font-medium text-white transition active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
