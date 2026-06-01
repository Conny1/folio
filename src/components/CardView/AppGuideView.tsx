import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Share2, Layers, ShieldCheck, Check, BookOpen, ChevronRight, Info } from 'lucide-react';

export const AppGuideView: React.FC = () => {
  const [isPWAInstallable, setIsPWAInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // Check PWA and platform status
  useEffect(() => {
    const checkStatus = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
      setIsStandalone(standalone);

      const promptExists = !!(window as any).deferredPWAInstallPrompt;
      setIsPWAInstallable(promptExists);

      const posIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      setIsIOS(posIOS);
    };

    checkStatus();

    // Listen to our custom event or status updates
    window.addEventListener('pwa-before-install-prompt-available', checkStatus);
    window.addEventListener('pwa-before-install-prompt-dismissed', checkStatus);

    return () => {
      window.removeEventListener('pwa-before-install-prompt-available', checkStatus);
      window.removeEventListener('pwa-before-install-prompt-dismissed', checkStatus);
    };
  }, []);

  // Trigger PWA Prompt installation
  const installPWAApp = async () => {
    const deferredPrompt = (window as any).deferredPWAInstallPrompt;
    if (!deferredPrompt) {
      alert('To download Folio to your device:\n\n• For Android / Chrome: Click the three dots (menu) in your browser and choose "Install App" or "Add to Home screen".\n• For iOS / Safari: Tap the Share button and select "Add to Home Screen".');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User installed PWA successfully');
      setIsPWAInstallable(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Intro Header */}
      <div className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-bold uppercase tracking-wider text-accent">
          <BookOpen size={13} />
          <span>Application Dashboard</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-text">
          How Folio Works
        </h1>
        <p className="text-muted-text max-w-2xl text-sm leading-relaxed">
          Folio is an elegant, structured journaling notebook. It gives you deep spatial nested cards 
          linked directly to local fast-loading storage. You can secure it natively on your device shell as an app widget.
        </p>
      </div>

      {/* Main App Download Station */}
      <div className="bg-card border border-border/80 rounded-card p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-border/40">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isStandalone ? 'bg-progress-fill' : 'bg-accent animate-pulse'}`} />
              <h3 className="text-lg font-bold text-text">Native Standalone App Platform</h3>
            </div>
            <p className="text-xs text-muted-text leading-relaxed max-w-xl">
              Applying modern W3C standards, you can install Folio as a lightweight standalone web app. 
              It strips away standard browser navigation controls, starts in a fullscreen secure view, and runs fully responsive on tablets and smartphones.
            </p>
          </div>

          <div className="shrink-0">
            {isStandalone ? (
              <div className="px-4 py-2 border border-progress-fill/40 text-progress-fill bg-progress-fill/5 text-xs font-bold rounded-small uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <Check size={14} className="text-progress-fill" />
                App runs in stand-alone
              </div>
            ) : (
              <button 
                onClick={installPWAApp}
                className="px-6 py-3 cursor-pointer bg-accent hover:opacity-90 text-active-text text-xs font-bold uppercase tracking-widest rounded-small transition-all inline-flex items-center gap-2 shadow-xs"
              >
                <Download size={14} />
                Download App to Device
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Instruction Walkthrough panels */}
        {!isStandalone && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-muted-text">
            <div className="space-y-1.5 p-4 bg-bg border border-border/50 rounded-small">
              <div className="font-bold text-accent uppercase tracking-wider flex items-center gap-1.5 mb-1 text-[11px]">
                <Smartphone size={13} />
                <span>Android / Chrome</span>
              </div>
              <p className="leading-relaxed">
                Click the <strong className="text-text">Download App to Device</strong> button above OR tap Chrome's three-dot menu and select <strong className="text-text">"Install app"</strong>.
              </p>
            </div>

            <div className="space-y-1.5 p-4 bg-bg border border-border/50 rounded-small">
              <div className="font-bold text-accent uppercase tracking-wider flex items-center gap-1.5 mb-1 text-[11px]">
                <Share2 size={13} />
                <span>iOS / Safari</span>
              </div>
              <p className="leading-relaxed">
                Tap Safari's bottom <strong className="text-text">Share button</strong> (square with up arrow) and scroll to select <strong className="text-text">"Add to Home Screen"</strong>.
              </p>
            </div>

            <div className="space-y-1.5 p-4 bg-bg border border-border/50 rounded-small">
              <div className="font-bold text-accent uppercase tracking-wider flex items-center gap-1.5 mb-1 text-[11px]">
                <ShieldCheck size={13} />
                <span>Instant Launcher Icon</span>
              </div>
              <p className="leading-relaxed">
                A custom curated brand logo will instantly be pinned to your device's drawer and load and work on local storage.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Feature Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Nesting Hierarchy */}
        <div className="bg-card border border-border/80 rounded-card p-6 flex flex-col gap-4">
          <div className="p-3 w-min rounded-small bg-[#7A9A50]/10 text-progress-fill">
            <Layers size={22} />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-text">Infinite Tree Nesting</h3>
            <p className="text-xs text-muted-text leading-relaxed">
              Every item is a Card. Sub-cards live inside parents infinitely. 
              Instead of hundreds of files stacked in nested directories, 
              simply double-click or tap items to focus down into specialized sub-areas.
            </p>
          </div>
          <div className="mt-auto pt-3 border-t border-border/20 flex items-center justify-between text-[11px] font-bold text-accent uppercase tracking-widest">
            <span>Spatial Zoom Navigation</span>
            <ChevronRight size={14} />
          </div>
        </div>

        {/* Card 2: 100% Offline Integrity */}
        <div className="bg-card border border-border/80 rounded-card p-6 flex flex-col gap-4">
          <div className="p-3 w-min rounded-small bg-[#8B6A3E]/10 text-accent">
            <ShieldCheck size={22} />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-text">Offline Privacy Engine</h3>
            <p className="text-xs text-muted-text leading-relaxed">
              Your journal is personal. We store your entire trees inside the secure browser-managed 
              <strong> IndexedDB </strong> storage. Data never leaves your device — resulting in instant local loading 
              with completely zero cloud sync latencies or sign-ups required.
            </p>
          </div>
          <div className="mt-auto pt-3 border-t border-border/20 flex items-center justify-between text-[11px] font-bold text-accent uppercase tracking-widest">
            <span>IndexedDB Secure Store</span>
            <ChevronRight size={14} />
          </div>
        </div>

        {/* Card 3: Intelligent Progress */}
        <div className="bg-card border border-border/80 rounded-card p-6 flex flex-col gap-4">
          <div className="p-3 w-min rounded-small bg-progress-fill/10 text-progress-fill">
            <Check size={22} />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-text">Bubbling Progress Metrics</h3>
            <p className="text-xs text-muted-text leading-relaxed">
              Switch any card between being a raw **Text Note**, a structured **Tasks Checklist**, or a **Mixed** card. 
              Sub-checklists automatically summarize progress and bubble those scores up to visual indicators in parent cards.
            </p>
          </div>
          <div className="mt-auto pt-3 border-t border-border/20 flex items-center justify-between text-[11px] font-bold text-accent uppercase tracking-widest">
            <span>Dynamic Percentages</span>
            <ChevronRight size={14} />
          </div>
        </div>

        {/* Card 4: High-Performance PWA */}
        <div className="bg-card border border-border/80 rounded-card p-6 flex flex-col gap-4">
          <div className="p-3 w-min rounded-small bg-accent/10 text-accent">
            <Smartphone size={22} />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-text">Mobile-Native App Shell</h3>
            <p className="text-xs text-muted-text leading-relaxed">
              Equipped with service worker caching via `Vite PWA`, browser frames are completely stripped.
              No complex reload flickering, responsive touch targets, safe area spacing, and support for home screen launch.
            </p>
          </div>
          <div className="mt-auto pt-3 border-t border-border/20 flex items-center justify-between text-[11px] font-bold text-accent uppercase tracking-widest">
            <span>W3C Compliant Shell</span>
            <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};
