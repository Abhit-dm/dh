import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { HospitalSettingsProvider } from './hooks/useHospitalSettings.jsx';

document.addEventListener(
  'error',
  (event) => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || image.dataset.imageFallbackApplied) return;
    image.dataset.imageFallbackApplied = 'true';
    image.src = '/images/hospital-cover.webp';
  },
  true,
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <HospitalSettingsProvider>
        <App />
      </HospitalSettingsProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
