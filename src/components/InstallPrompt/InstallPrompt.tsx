import React, { useState, useEffect } from 'react';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOSPrompt, setIsIOSPrompt] = useState(false);

  useEffect(() => {
    // 1. Silent exit if already installed and running standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (isStandalone) return;

    // 2. iOS Handlers (Manual Guide)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS) {
      const isIOSDismissed = localStorage.getItem('folio_ios_install_dismissed');
      if (!isIOSDismissed) {
        setIsIOSPrompt(true);
        setIsVisible(true);
      }
      return;
    }

    // 3. Android / Desktop Chrome Handler
    const isDismissed = localStorage.getItem('folio_install_dismissed');
    
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Share globally with AppGuideView
      (window as any).deferredPWAInstallPrompt = e;
      
      // Dispatch event letting AppGuideView know it can show its main button
      window.dispatchEvent(new CustomEvent('pwa-prompt-status-changed', { detail: { available: true } }));
      
      if (!isDismissed) {
        setIsVisible(true);
      }
    };

    // Listen for another component claiming and consuming the prompt
    const handlePromptConsumed = () => {
      setDeferredPrompt(null);
      setIsVisible(false);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('pwa-prompt-consumed', handlePromptConsumed);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('pwa-prompt-consumed', handlePromptConsumed);
    };
  }, []);

  const handleInstall = async () => {
    const promptObj = deferredPrompt || (window as any).deferredPWAInstallPrompt;
    if (!promptObj) return;
    
    promptObj.prompt();
    const { outcome } = await promptObj.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted via floating toast banner');
      (window as any).deferredPWAInstallPrompt = null;
      window.dispatchEvent(new CustomEvent('pwa-prompt-status-changed', { detail: { available: false } }));
    }
    
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(isIOSPrompt ? 'folio_ios_install_dismissed' : 'folio_install_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[360px] z-50 animate-fade-in">
      <div className="bg-card border border-border rounded-card p-4 text-[13px] flex flex-col gap-3 shadow-xl">
        {isIOSPrompt ? (
          <div className="space-y-1">
            <div className="font-semibold text-accent text-sm tracking-tight">Add to Home Screen</div>
            <p className="text-muted-text leading-relaxed">
              Tap the Safari share button at the bottom and select <strong className="text-accent underline">Add to Home Screen</strong> to run Folio natively.
            </p>
          </div>
        ) : (
          <p className="text-text leading-relaxed">
            Install <strong>Folio</strong> on your device dashboard for offline performance access and full screen real-estate.
          </p>
        )}
        <div className="flex gap-3 justify-end items-center">
          {!isIOSPrompt && (
            <button onClick={handleInstall} className="bg-accent text-active-text rounded-small px-4 py-1.5 font-bold text-[11px] uppercase tracking-wider hover:opacity-90">
              Install
            </button>
          )}
          <button onClick={handleDismiss} className="text-muted-text px-3 py-1.5 font-bold text-[11px] uppercase tracking-wider hover:text-text">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};