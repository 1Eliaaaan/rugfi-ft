import React, { createContext, useContext, useEffect, useState } from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { useToast } from './ToastContext';

interface PrivyContextType {
  isAuthenticated: boolean;
  user: any;
  handleLogin: () => Promise<void>;
  handleLogout: () => Promise<void>;
}

const PrivyContext = createContext<PrivyContextType | undefined>(undefined);

export const usePrivyAuth = () => {
  const context = useContext(PrivyContext);
  if (!context) {
    throw new Error('usePrivyAuth must be used within a PrivyContextProvider');
  }
  return context;
};

// Componente que maneja la lógica de Privy
const PrivyContextContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { login, logout, authenticated, user } = usePrivy();
  const { showToast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  console.log('Privy App ID:', import.meta.env.VITE_PRIVY_APP_ID);

  useEffect(() => {
    setIsAuthenticated(authenticated);
  }, [authenticated]);

  const handleLogin = async () => {
    try {
      await login();
      showToast({
        type: 'success',
        message: 'Successfully logged in!',
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Failed to login. Please try again.',
      });
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast({
        type: 'info',
        message: 'Successfully logged out.',
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Failed to logout. Please try again.',
      });
      console.error('Logout error:', error);
    }
  };

  const value = {
    isAuthenticated,
    user,
    handleLogin,
    handleLogout,
  };

  return (
    <PrivyContext.Provider value={value}>
      {children}
    </PrivyContext.Provider>
  );
};

// Componente principal que proporciona el PrivyProvider
export const PrivyContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!import.meta.env.VITE_PRIVY_APP_ID) {
    console.error('VITE_PRIVY_APP_ID is not set in environment variables');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Configuration Error</h1>
          <p className="text-gray-400">
            Privy App ID is not configured. Please check your .env file.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#3B82F6',
        },
        loginMethods: ['email', 'wallet'],
        embeddedWallets: {
          createOnLogin: 'all-users',
        },
        defaultChain: {
          id: 1,
          name: 'Ethereum',
          rpcUrls: {
            http: ['https://eth-mainnet.g.alchemy.com/v2/demo'],
          },
          blockExplorer: 'https://etherscan.io',
          nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
          },
        } as any,
        supportedChains: [{
          id: 1,
          name: 'Ethereum',
          rpcUrls: {
            http: ['https://eth-mainnet.g.alchemy.com/v2/demo'],
          },
          blockExplorer: 'https://etherscan.io',
          nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
          },
        } as any],
      }}
    >
      <PrivyContextContent>
        {children}
      </PrivyContextContent>
    </PrivyProvider>
  );
}; 