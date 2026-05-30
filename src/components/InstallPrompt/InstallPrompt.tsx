import React, { useState, useEffect } from 'react';
import styles from './InstallPrompt.module.css';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOSPrompt, setIsIOSPrompt] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (isStandalone) return;

    // Check if iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    if (isIOS) {
      const isIOSDismissed = localStorage.getItem('folio_ios_install_dismissed');
      if (!isIOSDismissed) {
        setIsIOSPrompt(true);
        setIsVisible(true);
      }
      return;
    }

    // Android / Desktop Chrome handler
    const isDismissed = localStorage.getItem('folio_install_dismissed');
    
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredPWAInstallPrompt = e;
      window.dispatchEvent(new CustomEvent('pwa-before-install-prompt-available'));
      if (!isDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    const promptObj = deferredPrompt || (window as any).deferredPWAInstallPrompt;
    if (!promptObj) return;
    
    promptObj.prompt();
    const { outcome } = await promptObj.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    (window as any).deferredPWAInstallPrompt = null;
    window.dispatchEvent(new CustomEvent('pwa-before-install-prompt-dismissed'));
    setIsVisible(false);
  };

  const handleDismiss = () => {
    if (isIOSPrompt) {
      localStorage.setItem('folio_ios_install_dismissed', 'true');
    } else {
      localStorage.setItem('folio_install_dismissed', 'true');
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const SafariShareIcon = () => (
    <svg 
      className="inline-block w-4.5 h-4.5 mx-1.5 align-text-bottom text-accent" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8m-4-6l-4-4m0 0L8 6m4-4v14" />
    </svg>
  );

  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        {isIOSPrompt ? (
          <div className="space-y-1 bg-transparent p-0 border-none m-0">
            <div className="font-semibold text-accent mb-1 tracking-tight text-sm">Add to Home Screen</div>
            <p className={styles.text}>
              Tap the Safari share button <SafariShareIcon /> in the bottom navigation bar and select <strong className="text-accent underline">Add to Home Screen</strong> for a fully native fullscreen experience.
            </p>
          </div>
        ) : (
          <p className={styles.text}>
            Install <strong>Folio</strong> on your device for immediate offline access, local notebook storage, and a polished fullscreen canvas.
          </p>
        )}
        <div className={styles.actions}>
          {!isIOSPrompt && (
            <button onClick={handleInstall} className={styles.installBtn}>
              Install
            </button>
          )}
          <button onClick={handleDismiss} className={styles.dismissBtn}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
