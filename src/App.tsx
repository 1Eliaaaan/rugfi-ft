import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { SoundNotificationProvider } from './context/SoundNotificationContext';
import { WalletProvider } from './context/WalletContext';
import Home from './pages/Home/Home';

const App: React.FC = () => {
  return (
    <Router>
      <ToastProvider>
        <WalletProvider>
          <SoundNotificationProvider>
            <div className="min-h-screen w-full bg-black text-white">
              <Home />
            </div>
          </SoundNotificationProvider>
        </WalletProvider>
      </ToastProvider>
    </Router>
  );
};

export default App;
