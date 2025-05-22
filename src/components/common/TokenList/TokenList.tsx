import React, { useState, useEffect } from 'react';
import { useToast } from '../../../context/ToastContext';
import { useWebSocket } from '../../../context/WebSocketContext';

interface Token {
  token_contract_address: string;
  creator_address: string;
  creator_twitter_handle: string | null;
  creator_twitter_followers: number | null;
  create_time: number;
  token_name: string;
  token_symbol: string;
  analysis?: CreatorAnalysis;
  risky: string;
  bonding_percent?: number;
  sniped?: boolean;
}

interface CreatorAnalysis {
  creator_twitter: string;
  creator_address: string;
  created_tokens: Record<string, {
    name: string;
    symbol: string;
    initial_funding: number;
    initial_funding_usd: number;
    rug_amount: number;
    rug_amount_usd: number;
    created_at: number;
  }>;
  rugged_tokens: string[];
  last_updated: string;
}

interface BondingUpdate {
  token_contract_address: string;
  bonding_percent: number;
  sniped: boolean;
}

const TokenList: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [creatorAnalyses, setCreatorAnalyses] = useState<Record<string, CreatorAnalysis>>({});
  const { showToast } = useToast();
  const { socket, isConnected } = useWebSocket();

  useEffect(() => {
    if (!socket) return;

    const handleNewToken = (tokenData: Omit<Token, 'analysis' | 'risky'>) => {
      try {
        setTokens(prevTokens => {
          // Check if token already exists
          if (prevTokens.some(t => t.token_contract_address.toLowerCase() === tokenData.token_contract_address.toLowerCase())) {
            return prevTokens;
          }

          // Create new token with default risky status
          const newToken: Token = {
            ...tokenData,
            risky: 'Unknown',
            analysis: creatorAnalyses[tokenData.creator_address.toLowerCase()]
          };

          // If we have analysis for this creator, update risky status
          if (newToken.analysis) {
            newToken.risky = calculateRiskStatus(newToken.analysis);
          }

          return [newToken, ...prevTokens].slice(0, 100);
        });
      } catch (error) {
        console.error('Error processing token data:', error);
        showToast({ type: 'error', message: 'Error processing token data' });
      }
    };

    const handleCreatorAnalysis = (analysis: CreatorAnalysis) => {
      try {
        const creatorAddress = analysis.creator_address.toLowerCase();
        
        // Store the analysis
        setCreatorAnalyses(prev => ({
          ...prev,
          [creatorAddress]: analysis
        }));

        // Update all tokens from this creator
        setTokens(prevTokens => 
          prevTokens.map(token => {
            if (token.creator_address.toLowerCase() === creatorAddress) {
              return {
                ...token,
                analysis,
                risky: calculateRiskStatus(analysis)
              };
            }
            return token;
          })
        );
      } catch (error) {
        console.error('Error processing creator analysis:', error);
        showToast({ type: 'error', message: 'Error processing creator analysis' });
      }
    };

    const handleBondingUpdate = (update: BondingUpdate) => {
      try {
        setTokens(prevTokens => 
          prevTokens.map(token => {
            if (token.token_contract_address.toLowerCase() === update.token_contract_address.toLowerCase()) {
              return {
                ...token,
                bonding_percent: update.bonding_percent,
                sniped: update.sniped
              };
            }
            return token;
          })
        );
      } catch (error) {
        console.error('Error processing bonding update:', error);
        showToast({ type: 'error', message: 'Error processing bonding update' });
      }
    };

    socket.on('newToken', handleNewToken);
    socket.on('creatorAnalysis', handleCreatorAnalysis);
    socket.on('bonding_update', handleBondingUpdate);

    return () => {
      socket.off('newToken', handleNewToken);
      socket.off('creatorAnalysis', handleCreatorAnalysis);
      socket.off('bonding_update', handleBondingUpdate);
    };
  }, [socket, showToast, creatorAnalyses]);

  const calculateRiskStatus = (analysis: CreatorAnalysis): string => {
    if (!analysis.rugged_tokens) return 'Unknown';
    return analysis.rugged_tokens.length === 0 
      ? 'Safe' 
      : `Potential rug (${analysis.rugged_tokens.length})`;
  };

  const getRiskBadgeClass = (risky: string) => {
    if (risky === 'Safe') return 'bg-green-900 text-green-400';
    if (risky.startsWith('Potential rug')) return 'bg-red-900 text-red-400';
    return 'bg-yellow-900 text-yellow-400';
  };

  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const formatBondingPercent = (percent?: number) => {
    if (percent === undefined) return '-';
    return `${percent.toFixed(2)}%`;
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
        <table className="min-w-full">
          <thead>
            <tr className="">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">TOKEN</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">CREATOR</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">CONTRACT</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">DATE</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">RISKY</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">ACTIONS</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">BONDING</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">SNIPED</th>
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
                <tr key={token.token_contract_address} className="hover:bg-gray-800 transition-colors duration-200">
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
                      <span className="text-white font-semibold">{token.creator_twitter_handle ? `@${token.creator_twitter_handle}` : formatAddress(token.creator_address)}</span>
                      {token.creator_twitter_followers && (
                        <span className="text-xs text-blue-400">{token.creator_twitter_followers.toLocaleString()} followers</span>
                      )}
                    </div>
                  </td>
                  {/* CONTRACT */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs text-gray-300 font-mono">{formatAddress(token.token_contract_address)}</span>
                  </td>
                  {/* DATE */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs text-gray-300">{formatDate(token.create_time)}</span>
                  </td>
                  {/* RISKY */}
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-1 text-xs rounded ${getRiskBadgeClass(token.risky)}`}>
                      {token.risky}
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
                  {/* BONDING */}
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-1 text-xs rounded ${getBondingBadgeClass(token.bonding_percent)}`}>
                      {formatBondingPercent(token.bonding_percent)}
                    </span>
                  </td>
                  {/* SNIPED */}
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-1 text-xs rounded ${getSnipedBadgeClass(token.sniped)}`}>
                      {token.sniped ? 'Yes' : 'No'}
                    </span>
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