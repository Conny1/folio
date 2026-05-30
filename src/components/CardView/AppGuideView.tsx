import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Share2, Layers, ShieldCheck, Check, BookOpen, ChevronRight, Info, Sparkles, AlertCircle } from 'lucide-react';

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
      alert('PWA Installer is preparing or already installed. If you are on an iPhone/iPad, please use Safari\'s "Add to Home Screen" option instead!');
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
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Intro Header */}
      <div className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-bold uppercase tracking-wider text-accent">
          <BookOpen size={13} />
          <span>Mobile Native Application Hub</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-text">
          Folio Web App Guide
        </h1>
        <p className="text-muted-text max-w-2xl text-sm leading-relaxed">
          Folio merges structured task check-lists and journaling notes with deep spatial, nested trees. 
          Through Progressive Web App standards, Folio can be downloaded directly to your phone's home screen, gaining a native full-screen app icon alongside your day-to-day apps.
        </p>
      </div>

      {/* Dynamic PWA Installer Station */}
      <div className="bg-card border border-border rounded-card overflow-hidden shadow-sm">
        <div className="p-6 sm:p-8 bg-sidebar border-b border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isStandalone ? 'bg-progress-fill' : 'bg-accent animate-pulse'}`} />
              <h3 className="text-lg font-bold text-text">Native PWA Application Hub</h3>
            </div>
            <p className="text-xs text-muted-text max-w-xl leading-relaxed">
              {isStandalone 
                ? "✓ Folio is already installed and running standalone in fullscreen mode. Your mobile layout fits notches, strips navigation bounds, and loads instantaneously Offline." 
                : "Folio is built around Progressive Web App standards. Installing it adds it seamlessly to your phone app library alongside stock applications like WhatsApp or Telegram with full offline launch capabilities."}
            </p>
          </div>

          <div className="shrink-0">
            {isStandalone ? (
              <div className="px-4 py-2 border border-progress-fill/40 text-progress-fill bg-progress-fill/5 text-xs font-bold rounded-small uppercase tracking-wider flex items-center gap-1.5">
                <Check size={14} />
                Standalone App Active
              </div>
            ) : isPWAInstallable ? (
              <button 
                onClick={installPWAApp}
                className="px-5 py-3 cursor-pointer bg-accent hover:bg-accent/90 text-active-text text-xs font-extrabold uppercase tracking-widest rounded-small transition-all inline-flex items-center gap-2 shadow-lg shadow-accent/10"
              >
                <Download size={14} />
                Download App to Device
              </button>
            ) : isIOS ? (
              <div className="text-xs text-accent bg-accent/10 border border-accent/20 p-3 rounded-small">
                <span className="font-bold underline uppercase">iOS Safari:</span> Share <Share2 className="inline ml-1" size={13} /> → "Add to Home Screen"
              </div>
            ) : (
              <div className="text-xs text-muted-text italic flex items-center gap-1.5">
                <Info size={14} className="text-accent" />
                <span>Ready for standalone install using your browser's menu (e.g. Chrome's "Install App" option)</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Brand Presentation with Mobile PWA icon */}
          <div className="flex flex-col items-center justify-center p-6 bg-bg border border-border/60 rounded-card space-y-4">
            <div className="relative">
              <img 
                src="/pwa-512x512.png" 
                alt="Folio App Logo" 
                className="w-24 h-24 rounded-[22px] shadow-xl border border-border/80 object-cover" 
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-[-6px] right-[-6px] bg-progress-fill text-white p-1 rounded-full text-[10px] shadow-md border border-bg">
                <Smartphone size={12} />
              </span>
            </div>
            <div className="text-center">
              <h4 className="text-sm font-bold text-text">Custom Launcher Badge</h4>
              <p className="text-[11px] text-muted-text leading-normal max-w-xs mt-1">
                Your device will use our curated high-resolution icon (above) automatically for the home screen launcher graphic.
              </p>
            </div>
          </div>

          {/* Quick instructions path */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-accent">How to Install Offline App:</h4>
            
            <div className="space-y-4 text-xs">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/10 text-accent font-bold flex items-center justify-center shrink-0">1</div>
                <div>
                  <strong className="text-text block mb-0.5">Click the Download Button</strong>
                  <span className="text-muted-text leading-relaxed">If available above, click it to trigger the native installation prompt configured inside our PWA manifest.</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/10 text-accent font-bold flex items-center justify-center shrink-0">2</div>
                <div>
                  <strong className="text-text block mb-0.5">Safari & alternative browsers</strong>
                  <span className="text-muted-text leading-relaxed">If downloading directly doesn't launch, look for the browser's sharing/settings menu and select <strong className="text-accent underline">"Add to Home Screen"</strong> or <strong className="text-accent underline">"Install App"</strong>.</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/10 text-accent font-bold flex items-center justify-center shrink-0">3</div>
                <div>
                  <strong className="text-text block mb-0.5">Pre-cached Launch</strong>
                  <span className="text-muted-text leading-relaxed">Once added, Folio immediately executes like a local binary wrapper without address inputs, completely isolated from browser frame UI.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
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
