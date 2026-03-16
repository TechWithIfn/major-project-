import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerServiceWorker } from './lib/sw-register';
import { primeOfflineStudyLibrary } from './lib/db';
import { offlineStudySeed } from './data/offline-study-seed';
import { initializeOfflineStudySync } from './lib/offline-sync';

registerServiceWorker();
initializeOfflineStudySync();

// Prime the IndexedDB library so subjects, chapters, notes, and quiz data load locally.
primeOfflineStudyLibrary(offlineStudySeed).catch((error) => {
  console.error('Failed to seed offline study library:', error);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);