import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { SoundNotificationProvider } from './context/SoundNotificationContext';
import { WalletProvider } from './context/WalletContext';
import Home from './pages/Home/Home';
import BuyRugFiButton from './components/common/BuyRugFiButton';
import Footer from './components/layout/Footer/Footer';

const App: React.FC = () => {
  return (
    <Router>
      <ToastProvider>
        <WalletProvider>
          <SoundNotificationProvider>
            <div className=" bg-black flex flex-col">
              <div className="flex-1">
                <Home />
              </div>
              <BuyRugFiButton />
            </div>
            <Footer />
          </SoundNotificationProvider>
        </WalletProvider>
    
      </ToastProvider>

    </Router>
  );
};

export default App;
