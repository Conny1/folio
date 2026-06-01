import { useState } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { CardView } from './components/CardView/CardView';
import { InstallPrompt } from './components/InstallPrompt/InstallPrompt';
import { Menu, X } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg text-text relative">
      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-3 left-4 z-50 p-2 bg-sidebar border border-border rounded-small text-accent shadow-sm flex items-center justify-center lg:hidden cursor-pointer"
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop for mobile */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/30 backdrop-blur-[2px] z-30 transition-opacity duration-300 pointer-events-none opacity-0 lg:hidden",
          isSidebarOpen && "opacity-100 pointer-events-auto"
        )} 
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar Wrapper */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-out -translate-x-full lg:relative lg:translate-x-0 lg:w-[280px] lg:shrink-0",
        isSidebarOpen && "translate-x-0"
      )}>
        <Sidebar onSelectCard={() => setIsSidebarOpen(false)} />
      </div>

      <main className="flex-1 min-w-0 h-full overflow-hidden relative">
        <CardView />
        <InstallPrompt />
      </main>
    </div>
  );
}
