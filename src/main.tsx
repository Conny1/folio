import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    const toast = document.createElement('div');
    toast.id = 'pwa-update-toast';
    toast.innerHTML = `
      <div style="
        background: #EDE7D9; 
        border: 0.5px solid #C9BFA8; 
        border-radius: 10px; 
        padding: 12px 16px; 
        font-size: 13px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      ">
        <span>A new version of Folio is available</span>
        <button id="pwa-update-btn" style="
          background: #8B6A3E;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 6px 12px;
          cursor: pointer;
          font-weight: 500;
        ">Update now</button>
      </div>
    `;
    
    // Styling the container to match "absolute inside a fixed-height footer area"
    // Since we don't have a footer yet, I'll append it to the body for now, 
    // but the prompt says "Use normal document flow with position absolute inside a fixed-height footer area".
    // I'll create a container for it.
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.left = '50%';
    container.style.transform = 'translateX(-50%)';
    container.style.width = '100%';
    container.style.maxWidth = '320px';
    container.style.zIndex = '9999';
    container.appendChild(toast);
    document.body.appendChild(container);

    document.getElementById('pwa-update-btn')?.addEventListener('click', () => {
      updateSW(true);
    });
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
