import React, { useState, useRef, useEffect } from 'react';
import { useWallet } from '../../../context/WalletContext';

interface WalletConnectProps {
  className?: string;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ className = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const { isConnected, walletAddress, rugfiBalance, isWebSocketConnected, connectWallet, disconnectWallet } = useWallet();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleConnect = async () => {
    if (!privateKey.trim()) {
      return;
    }

    setIsConnecting(true);
    try {
      const success = await connectWallet(privateKey);
      if (success) {
        setIsModalOpen(false);
        setPrivateKey('');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex items-center space-x-4">
      {/* RUGFI Balance */}
      <div className={`transition-all duration-300 ease-in-out transform ${
        isConnected && rugfiBalance ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
      }`}>
        <div className="bg-gray-800 px-3 py-1.5 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-200">
          <p className="text-xs text-gray-300 font-medium">
          RUGFI {parseFloat(rugfiBalance || '0').toLocaleString()} 
          </p>
        </div>
      </div>

      {/* Wallet Connect Button / Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => isConnected ? setIsDropdownOpen(!isDropdownOpen) : setIsModalOpen(true)}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            isConnected
              ? 'bg-gray-800 hover:bg-gray-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          } ${className}`}
        >
          {isConnected ? (
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                isWebSocketConnected ? 'bg-green-500' : 'bg-yellow-500'
              }`}></span>
              <span>{`${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}`}</span>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          ) : (
            'Connect Wallet'
          )}
        </button>

        {/* Dropdown Menu */}
        <div 
          className={`absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-50 transition-all duration-200 transform origin-top ${
            isDropdownOpen 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
          }`}
        >
          <div className="px-4 py-2 border-b border-gray-700">
            <p className="text-sm text-gray-400">Connected as</p>
            <p className="text-sm font-medium text-white truncate">{walletAddress}</p>
          </div>
          <button
            onClick={handleDisconnect}
            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2 group"
          >
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Disconnect Wallet</span>
          </button>
        </div>
      </div>

      {/* Connect Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4 transform transition-all duration-300 scale-100 animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-4">Connect Wallet</h2>
            
            <div className="bg-yellow-900/50 border border-yellow-700 rounded-lg p-4 mb-4 animate-fade-in">
              <h3 className="text-yellow-400 font-semibold mb-2">⚠️ Important Warning</h3>
              <p className="text-yellow-200 text-sm">
                Your private key will be stored locally in your browser. For security reasons:
              </p>
              <ul className="list-disc list-inside text-yellow-200 text-sm mt-2 space-y-1">
                <li>Do not store valuable tokens in this wallet</li>
                <li>Only deposit RUGFI tokens and trading funds</li>
                <li>Never share your private key with anyone</li>
              </ul>
            </div>

            <div className="mb-4">
              <label htmlFor="privateKey" className="block text-sm font-medium text-gray-300 mb-2">
                Private Key
              </label>
              <input
                type="password"
                id="privateKey"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                placeholder="Enter your private key"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConnect}
                disabled={isConnecting || !privateKey.trim()}
                className={`px-4 py-2 rounded-lg font-medium ${
                  isConnecting || !privateKey.trim()
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                } text-white transition-colors duration-200`}
              >
                {isConnecting ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Connecting...</span>
                  </span>
                ) : (
                  'Connect'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Animaciones
const animations = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
`;

// Agregar los estilos de animación al documento
const style = document.createElement('style');
style.textContent = animations;
document.head.appendChild(style);

export default WalletConnect; 