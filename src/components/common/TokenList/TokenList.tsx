import React, { useState, useEffect } from 'react';
import { useToast } from '../../../context/ToastContext';
import { useWallet } from '../../../context/WalletContext';
import { useSoundNotification } from '../../../context/SoundNotificationContext';

interface Token {
  token_contract_address: string;
  creator_address: string;
  creator_twitter_handle: string | null;
  creator_twitter_followers: number | null;
  create_time: number;
  token_name: string;
  token_symbol: string;
  analysis?: CreatorAnalysis;
  risky?: string;
}

interface CreatorAnalysis {
  address: string;
  isRug: boolean;
  riskLevel: number;
  // ... otros campos de análisis
}

const TokenList: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [creatorAnalyses, setCreatorAnalyses] = useState<Record<string, CreatorAnalysis>>({});
  const { showToast } = useToast();
  const { isConnected, isWebSocketConnected, socket } = useWallet();
  const { playNotificationSound, settings } = useSoundNotification();

  useEffect(() => {
    if (!isConnected || !isWebSocketConnected || !socket) {
      return;
    }

    const handleNewToken = (tokenData: Omit<Token, 'analysis' | 'risky'>) => {
      setTokens(prevTokens => {
        const existingToken = prevTokens.find(t => t.token_contract_address === tokenData.token_contract_address);
        if (existingToken) {
          return prevTokens;
        }

        const newToken: Token = {
          ...tokenData,
          risky: 'pending'
        };

        // Play notification sound if enabled
        if (settings.safeTokens || settings.rugTokens) {
          playNotificationSound();
        }

        return [...prevTokens, newToken];
      });
    };

    const handleCreatorAnalysis = (analysis: CreatorAnalysis) => {
      setCreatorAnalyses(prev => ({
        ...prev,
        [analysis.address]: analysis
      }));

      setTokens(prevTokens => {
        return prevTokens.map(token => {
          if (token.token_contract_address === analysis.address) {
            const riskStatus = calculateRiskStatus(analysis);
            
            // Play notification sound if enabled and status matches preferences
            if ((riskStatus === 'safe' && settings.safeTokens) || 
                (riskStatus === 'rug' && settings.rugTokens)) {
              playNotificationSound();
            }

            return {
              ...token,
              analysis,
              risky: riskStatus
            };
          }
          return token;
        });
      });
    };

    const handleBondingUpdate = (update: any) => {
      // Handle bonding curve updates if needed
      console.log('Bonding update:', update);
    };

    socket.on('newToken', handleNewToken);
    socket.on('creatorAnalysis', handleCreatorAnalysis);
    socket.on('bonding_update', handleBondingUpdate);

    return () => {
      socket.off('newToken', handleNewToken);
      socket.off('creatorAnalysis', handleCreatorAnalysis);
      socket.off('bonding_update', handleBondingUpdate);
    };
  }, [isConnected, isWebSocketConnected, socket, showToast, creatorAnalyses, playNotificationSound, settings]);

  const calculateRiskStatus = (analysis: CreatorAnalysis): string => {
    if (!analysis) return 'pending';
    return analysis.isRug ? 'rug' : 'safe';
  };

  const getRiskBadgeClass = (risky: string) => {
    if (risky === 'Safe') return 'bg-green-900 text-green-400';
    if (risky.startsWith('Potential rug')) return 'bg-red-900 text-red-400';
    return 'bg-yellow-900 text-yellow-400';
  };

  const formatAddress = (address?: string) =>
    address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const getBondingBadgeClass = (percent?: number) => {
    if (percent === undefined) return 'bg-gray-800 text-gray-400';
    if (percent >= 10) return 'bg-green-900 text-green-400';
    if (percent >= 5) return 'bg-yellow-900 text-yellow-400';
    return 'bg-red-900 text-red-400';
  };

  const getSnipedBadgeClass = (sniped?: boolean) => {
    if (sniped === undefined) return 'bg-gray-800 text-gray-400';
    return sniped ? 'bg-purple-900 text-purple-400' : 'bg-gray-800 text-gray-400';
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="bg-black rounded-lg shadow-lg overflow-x-auto">
        <div className="px-4 py-3  flex justify-between items-center">
       
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        <table className="min-w-full overflow-y-scroll">
          <thead>
            <tr className="">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">TOKEN</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">CREATOR</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">CONTRACT</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">DATE</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">RISKY</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">BONDING</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">SNIPED</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="bg-black divide-y divide-gray-800">
            {tokens.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  Waiting for token activity...
                </td>
              </tr>
            ) : (
              tokens.map((token) => (
                <tr key={token.token_contract_address} className="hover:bg-gray-800 transition-colors duration-100">
                  {/* TOKEN */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-white font-semibold">{token.token_name}</span>
                      <span className="text-xs text-gray-400">{token.token_symbol}</span>
                    </div>
                  </td>
                  {/* CREATOR */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-white font-semibold">{formatAddress(token.creator_address)}</span>
                    </div>
                  </td>
                  {/* CONTRACT */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <a  href={`https://arenabook.xyz/token/${token.token_contract_address}`} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-300 font-mono hover:text-blue-400">{formatAddress(token.token_contract_address)}</a>
                  </td>
                  {/* DATE */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs text-gray-300">{formatDate(Date.now())}</span>
                  </td>
                  {/* RISKY */}
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-1 text-xs rounded ${getRiskBadgeClass(token.risky || 'pending')}`}>
                      {token.risky === 'safe' ? 'Safe' : token.risky === 'rug' ? 'Potential rug' : 'Pending'}
                    </span>
                  </td>
        
                  {/* BONDING */}
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-1 text-xs rounded ${getBondingBadgeClass(token.risky === 'safe' ? 100 : token.risky === 'rug' ? 50 : undefined)}`}>
                      {token.risky === 'safe' ? '100%' : token.risky === 'rug' ? '50%' : '-'}
                    </span>
                  </td>
                  {/* SNIPED */}
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-1 text-xs rounded ${getSnipedBadgeClass(token.risky === 'rug')}`}>
                      {token.risky === 'rug' ? 'Yes' : 'No'}
                    </span>
                  </td>
                            {/* ACTIONS */}
                            <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(token.token_contract_address)}
                        className="text-gray-400 hover:text-white"
                        title="Copy contract address"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                      </button>
                      <a
                        href={`https://arenabook.xyz/token/${token.token_contract_address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                        title="View on Snowtrace"
                      >
                        Explorer
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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