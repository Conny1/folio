import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Share2, Layers, ShieldCheck, Check, BookOpen, ChevronRight, Info } from 'lucide-react';

export const AppGuideView: React.FC = () => {
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    // Immediate checks on mount in case the prompt already fired
    if ((window as any).deferredPWAInstallPrompt) {
      setShowInstallBtn(true);
    }

    // Listen to updates broadcasted from our floating toast channel
    const handleStatusChange = (e: Event & { detail?: { available: boolean } }) => {
      if (e.detail) {
        setShowInstallBtn(e.detail.available);
      }
    };

    window.addEventListener('pwa-prompt-status-changed' as any, handleStatusChange);
    return () => window.removeEventListener('pwa-prompt-status-changed' as any, handleStatusChange);
  }, []);

  const handleInstallClick = async () => {
    const deferredPrompt = (window as any).deferredPWAInstallPrompt;
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      console.log("User installed via Main App Guide view button");
      // Clean up global state pointers
      (window as any).deferredPWAInstallPrompt = null;
      setShowInstallBtn(false);
      
      // Let the floating banner component know it can close up shop
      window.dispatchEvent(new CustomEvent('pwa-prompt-consumed'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Intro Header */}
      <div className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 border border-accent/20 text-xs font-bold uppercase tracking-wider text-accent">
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
      <div className="space-y-4 mt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {showInstallBtn ? (
            <button
              onClick={handleInstallClick}
              className="px-8 py-3 text-base font-bold text-active-text transition-all rounded-lg shadow-md bg-accent hover:opacity-90 active:scale-[0.98] inline-flex items-center gap-2"
            >
              <Download size={18} />
              Install App Version
            </button>
          ) : (
            <div className="px-5 py-3 border border-progress-fill/20 text-progress-fill bg-progress-fill/5 text-sm font-bold rounded-lg uppercase tracking-wider flex items-center gap-2">
              <Check size={16} />
              Application is running standalone / Already installed
            </div>
          )}
        </div>

        {/* Dynamic Context Browser Assistance Tip */}
        <div className="bg-card border border-border/60 rounded-card p-4 max-w-2xl flex gap-3 items-start">
          <Info size={18} className="text-accent shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-muted-text leading-relaxed">
            <p className="font-semibold text-text">Installation Note</p>
            <p>
              For the best native experience, we recommend using <strong className="text-text">Google Chrome</strong> or standard Chromium browsers to prompt instant installations. On iOS platforms, simply launch this workspace in <strong className="text-text">Safari</strong>, tap the primary share icon, and select <strong className="text-text">"Add to Home Screen"</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Nesting Hierarchy */}
        <div className="bg-card border border-border/80 rounded-card p-6 flex flex-col gap-4">
          <div className="p-3 w-min rounded-small bg-progress-fill/10 text-progress-fill">
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

        {/* Card 2: Offline Privacy */}
        <div className="bg-card border border-border/80 rounded-card p-6 flex flex-col gap-4">
          <div className="p-3 w-min rounded-small bg-accent/10 text-accent">
            <ShieldCheck size={22} />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-text">Offline Privacy Engine</h3>
            <p className="text-xs text-muted-text leading-relaxed">
              Your journal is personal. We store your entire trees inside the secure browser-managed 
              <strong> IndexedDB </strong> storage. Data never leaves your device — resulting in instant local loading 
              with completely zero cloud sync latencies.
            </p>
          </div>
          <div className="mt-auto pt-3 border-t border-border/20 flex items-center justify-between text-[11px] font-bold text-accent uppercase tracking-widest">
            <span>IndexedDB Secure Store</span>
            <ChevronRight size={14} />
          </div>
        </div>

        {/* Card 3: Metrics */}
        <div className="bg-card border border-border/80 rounded-card p-6 flex flex-col gap-4">
          <div className="p-3 w-min rounded-small bg-progress-fill/15 text-progress-fill">
            <Check size={22} />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-text">Bubbling Progress Metrics</h3>
            <p className="text-xs text-muted-text leading-relaxed">
              Switch any card between being a raw Text Note, a structured Tasks Checklist, or a Mixed card. 
              Sub-checklists automatically summarize progress and bubble those scores up.
            </p>
          </div>
          <div className="mt-auto pt-3 border-t border-border/20 flex items-center justify-between text-[11px] font-bold text-accent uppercase tracking-widest">
            <span>Dynamic Percentages</span>
            <ChevronRight size={14} />
          </div>
        </div>

        {/* Card 4: Shell */}
        <div className="bg-card border border-border/80 rounded-card p-6 flex flex-col gap-4">
          <div className="p-3 w-min rounded-small bg-accent/15 text-accent">
            <Smartphone size={22} />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-text">Mobile-Native App Shell</h3>
            <p className="text-xs text-muted-text leading-relaxed">
              Equipped with service worker caching via `Vite PWA`, browser frames are completely stripped.
              No complex reload flickering, responsive touch targets, and support for home screen launch.
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