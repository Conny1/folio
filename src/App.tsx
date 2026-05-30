import { useState } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { CardView } from './components/CardView/CardView';
import { InstallPrompt } from './components/InstallPrompt/InstallPrompt';
import { Menu, X } from 'lucide-react';
import { cn } from './lib/utils';
import styles from './App.module.css';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={styles.appContainer}>
      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={styles.mobileMenuBtn}
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop for mobile */}
      <div 
        className={cn(styles.backdrop, isSidebarOpen && styles.backdropVisible)} 
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar Wrapper */}
      <div className={cn(styles.sidebarWrapper, isSidebarOpen && styles.sidebarWrapperOpen)}>
        <Sidebar onSelectCard={() => setIsSidebarOpen(false)} />
      </div>

      <main className={styles.mainContent}>
        <CardView />
        <InstallPrompt />
      </main>
    </div>
  );
}
