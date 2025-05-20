import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { PrivyContextProvider } from './context/PrivyContext';
import Home from './pages/Home/Home';

const App: React.FC = () => {
  return (
    <Router>
      <ToastProvider>
        <PrivyContextProvider>
          <WebSocketProvider>
            <div className="min-h-screen w-full bg-black text-white">
              <Home />
            </div>
          </WebSocketProvider>
        </PrivyContextProvider>
      </ToastProvider>
    </Router>
  );
};

export default App;
