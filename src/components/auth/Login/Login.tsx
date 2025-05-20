import React from 'react';
import { usePrivyAuth } from '../../../context/PrivyContext';

const Login: React.FC = () => {
  const { isAuthenticated, handleLogin, handleLogout, user } = usePrivyAuth();

  // Función para obtener el identificador del usuario (email o dirección de wallet)
  const getUserIdentifier = () => {
    if (!user) return 'User';

    // Verificar si el usuario tiene email
    const email = user.email;
    if (email && typeof email === 'string' && email.length > 0) {
      return email;
    }

    // Verificar si el usuario tiene wallet
    const walletAddress = user.wallet?.address;
    if (walletAddress && typeof walletAddress === 'string' && walletAddress.length > 0) {
      return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
    }

    return 'User';
  };

  // Función para obtener la inicial del usuario
  const getUserInitial = () => {
    if (!user) return 'U';

    // Verificar si el usuario tiene email
    const email = user.email;
    if (email && typeof email === 'string' && email.length > 0) {
      return email.charAt(0).toUpperCase();
    }

    // Verificar si el usuario tiene wallet
    const walletAddress = user.wallet?.address;
    if (walletAddress && typeof walletAddress === 'string' && walletAddress.length > 0) {
      return 'W'; // W para Wallet
    }

    return 'U';
  };

  return (
    <div className="flex items-center gap-4">
      {!isAuthenticated ? (
        <button
          onClick={handleLogin}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
          Login with Privy
        </button>
      ) : (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
              {getUserInitial()}
            </div>
            <span className="text-sm text-gray-300">
              {getUserIdentifier()}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Login; 