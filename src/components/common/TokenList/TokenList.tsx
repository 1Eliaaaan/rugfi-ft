import React, { useState, useEffect } from 'react';
import { useToast } from '../../../context/ToastContext';
import { useWebSocket } from '../../../context/WebSocketContext';

interface Token {
  token_contract_address: string;
  creator_address: string;
  creator_twitter_handle: string | null;
  creator_twitter_followers: number | null;
  created_at: number;
  token_name: string;
  token_symbol: string;
  creator_name: string;
  detected_at: string;
}

const TokenList: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const { showToast } = useToast();
  const { socket, isConnected } = useWebSocket();

  useEffect(() => {
    if (!socket) return;

    const handleNewToken = (tokenData: Token) => {
      try {
        setTokens(prevTokens => {
          // Evitar duplicados basados en la dirección del contrato
          if (prevTokens.some(t => 
            t.token_contract_address.toLowerCase() === tokenData.token_contract_address.toLowerCase()
          )) {
            return prevTokens;
          }
          // Agregar al inicio de la lista
          return [tokenData, ...prevTokens].slice(0, 100);
        });
      } catch (error) {
        console.error('Error processing token data:', error);
        showToast({ type: 'error', message: 'Error processing token data' });
      }
    };

    socket.on('newToken', handleNewToken);

    return () => {
      socket.off('newToken', handleNewToken);
    };
  }, [socket, showToast]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Live Token Activity</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <div className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto">
          {tokens.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-400">
              Waiting for token activity...
            </div>
          ) : (
            tokens.map((token) => (
              <div
                key={token.token_contract_address}
                className="px-4 py-3 hover:bg-gray-800 transition-colors duration-200 animate-fade-in"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {token.token_symbol.slice(0, 2)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-white font-medium">{token.token_name}</div>
                      <div className="text-sm text-gray-400">
                        Contract: {formatAddress(token.token_contract_address)}
                      </div>
                      <div className="text-sm text-gray-400">
                        Creator: {token.creator_name} ({formatAddress(token.creator_address)})
                      </div>
                      {token.creator_twitter_handle && (
                        <div className="text-sm text-blue-400">
                          Twitter: @{token.creator_twitter_handle}
                          {token.creator_twitter_followers && 
                            ` (${token.creator_twitter_followers.toLocaleString()} followers)`
                          }
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatDate(token.detected_at)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Animación para nuevos items
const fadeInAnimation = `
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
`;

// Agregar los estilos de animación al documento
const style = document.createElement('style');
style.textContent = fadeInAnimation;
document.head.appendChild(style);

export default TokenList; 