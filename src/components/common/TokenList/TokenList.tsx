import React, { useState, useEffect } from 'react';
import { useToast } from '../../../context/ToastContext';
import { useWallet } from '../../../context/WalletContext';
import { useSoundNotification } from '../../../context/SoundNotificationContext';
import WalletTokensSidebar from '../../common/WalletTokensSidebar';
import TradeDrawer from '../TradeDrawer';
import { useTrading } from '../../../context/TradingContext';

interface Token {
  token_contract_address: string;
  creator_address: string;
  creator_twitter_handle: string | null;
  creator_twitter_followers: number | null;
  create_time: number;
  token_name: string;
  token_symbol: string;
  analysis?: any;
  risky?: string;
  rugged_tokens_count?: number;
  bonding_percent?: number;
  sniped?: boolean;
  photo_url?: string;
}


const ARENA_API_URL = 'https://api.arena.trade/groups_plus?is_official=eq.false&limit=30&offset=0&order=create_time.desc.nullslast&select=token_contract_address%2Ccreator_address%2Ccreate_time%2Ctoken_name%2Ctoken_symbol%2Ccreator_twitter_handle%2Ccreator_twitter_followers%2Ctoken_name%2Cphoto_url';

const TokenList: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [creatorAnalyses, setCreatorAnalyses] = useState<Record<string, any>>({});
  const { showToast } = useToast();
  const { isConnected, isWebSocketConnected, socket } = useWallet();
  const { playNotificationSound, settings } = useSoundNotification();
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [tradeType, setTradeType] = useState<'buy' | 'sell' | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const { buyToken, sellToken, getTokenBalance } = useTrading();

  // Fetch tokens iniciales si hay private key
  useEffect(() => {
    const fetchInitialTokens = async () => {
      const privateKey = localStorage.getItem('wallet_private_key');
      if (!privateKey) {
        setInitialLoading(false);
        return;
      }
      try {
        const response = await fetch(ARENA_API_URL, {
          headers: {
            'accept': '*/*',
            'origin': 'https://arenabook.xyz',
            'referer': 'https://arenabook.xyz/',
            'user-agent': navigator.userAgent,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch initial tokens');
        const data = await response.json();
        setTokens(data);
      } catch (error) {
        console.error('Error fetching initial tokens:', error);
        showToast({ type: 'error', message: 'Error fetching initial tokens' });
      } finally {
        setInitialLoading(false);
      }
    };
    fetchInitialTokens();
  }, [showToast]);

  useEffect(() => {
    if (initialLoading) return; // Esperar a que termine el fetch inicial
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

        return [newToken, ...prevTokens];
      });
    };

    const handleCreatorAnalysis = (analysis: any) => {
      setCreatorAnalyses(prev => ({
        ...prev,
        [analysis.creator_address]: analysis
      }));

      setTokens(prevTokens => {
        return prevTokens.map(token => {
          if (token.creator_address === analysis.creator_address) {
            // ¿Está este token en rugged_tokens?
            // const isRugged = Array.isArray(analysis.rugged_tokens) && analysis.rugged_tokens.some((rugged: any) => rugged.token_address === token.token_contract_address);
            const ruggedCount = Array.isArray(analysis.rugged_tokens) ? analysis.rugged_tokens.length : 0;
            return {
              ...token,
              analysis,
              risky:  analysis.rugged_tokens.length === 0 ? 'safe' : 'risky',
              rugged_tokens_count: ruggedCount
            };
          }
          return token;
        });
      });
    };

    const handleBondingUpdate = (update: { token_contract_address: string; bonding_percent: number; sniped: boolean }) => {
      setTokens(prevTokens =>
        prevTokens.map(token =>
          token.token_contract_address === update.token_contract_address
            ? { ...token, bonding_percent: update.bonding_percent, sniped: update.sniped }
            : token
        )
      );
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

  // Add this new useEffect to fetch token balance when selected token changes
  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (selectedToken && isConnected) {
        try {
          const balance = await getTokenBalance(selectedToken.token_contract_address);
          setTokenBalance(balance);
        } catch (error) {
          console.error('Error fetching token balance:', error);
          setTokenBalance('0');
        }
      }
    };

    fetchTokenBalance();
  }, [selectedToken, isConnected, getTokenBalance]);

  const handleBuy = async (avaxAmount: number) => {
    if (!selectedToken) return;
    await buyToken(selectedToken.token_contract_address, avaxAmount);
    // No cerrar el drawer automáticamente
    // setSelectedToken(null);
    // setTradeType(null);
  };

  const handleSell = async (percentage: number) => {
    if (!selectedToken) return;
    await sellToken(selectedToken.token_contract_address, percentage);
    // No cerrar el drawer automáticamente
    // setSelectedToken(null);
    // setTradeType(null);
  };

  const getRiskBadgeClass = (risky:  string) => {
    if(risky === 'pending') return 'bg-yellow-900 text-yellow-400';
    if (risky === 'safe') return 'bg-green-900 text-green-400';
   return 'bg-red-900 text-red-400';
   
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
    <div className="h-screen flex flex-col md:flex-row gap-6">
      {/* Sidebar de tokens de la wallet */}
      <div className="w-full md:w-1/4 h-full">
        <WalletTokensSidebar />
      </div>
      {/* Lista de tokens detectados */}
      <div className="w-full md:w-3/5 h-5/6 flex flex-col">
        <div className="bg-black rounded-lg shadow-lg flex-1 flex flex-col overflow-hidden">
          {/* Header de la tabla */}
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          {/* Tabla scrolleable */}
          <div className="flex-1 overflow-y-auto">
            <table className="min-w-full">
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
                    <tr key={token.token_contract_address} className="hover:bg-gray-900 transition-colors duration-100">
                      {/* TOKEN */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {token.photo_url && (
                            <img
                              src={token.photo_url}
                              alt={token.token_name}
                              className="w-8 h-8 rounded-full object-cover border border-gray-700"
                            />
                          )}
                          <div className="flex flex-col">
                            <span className="text-white font-semibold">{token.token_name}</span>
                            <span className="text-xs text-gray-400">{token.token_symbol}</span>
                          </div>
                        </div>
                      </td>
                      {/* CREATOR */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col">
                          <a
                            href={
                              token.creator_twitter_handle
                                ? `https://x.com/${token.creator_twitter_handle}`
                                : `https://arenabook.xyz/user/${token.creator_address}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white font-semibold"
                          >
                            {token.creator_twitter_handle || formatAddress(token.creator_address)}
                          </a>
                          <span className="text-blue-500 font-semibold">{token.creator_twitter_followers ? `${token.creator_twitter_followers} followers` : ''}</span>
                        </div>
                      </td>
                      {/* CONTRACT */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <a  href={`https://arenabook.xyz/token/${token.token_contract_address}`} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-300 font-mono hover:text-blue-400">{formatAddress(token.token_contract_address)}</a>
                      </td>
                      {/* DATE */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs text-gray-300">{formatDate(token.create_time)}</span>
                      </td>
                      {/* RISKY */}
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-1 text-xs rounded ${getRiskBadgeClass(token.risky || 'pending')}`}>
                          {token.analysis && Array.isArray(token.analysis.rugged_tokens)
                            ? (token.analysis.rugged_tokens.length === 0
                                ? 'Safe'
                                : `Potential rug${token.analysis.rugged_tokens.length > 1 ? ` (${token.analysis.rugged_tokens.length})` : ''}`)
                            : 'Pending'}
                        </span>
                      </td>
            
                      {/* BONDING */}
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-1 text-xs rounded ${getBondingBadgeClass(token.bonding_percent)}`}>
                          {token.bonding_percent !== undefined ? `${token.bonding_percent.toFixed(2)}%` : '-'}
                        </span>
                      </td>
                      {/* SNIPED */}
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-1 text-xs rounded ${getSnipedBadgeClass(token.sniped)}`}>
                          {token.sniped ? 'Yes' : 'No'}
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
                          <button
                            onClick={() => {
                              setSelectedToken(token);
                              setTradeType('buy');
                            }}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                            disabled={!isConnected}
                            title={!isConnected ? "Connect wallet to trade" : "Buy token"}
                          >
                            Buy
                          </button>
                          <button
                            onClick={() => {
                              setSelectedToken(token);
                              setTradeType('sell');
                            }}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                            disabled={!isConnected}
                            title={!isConnected ? "Connect wallet to trade" : "Sell token"}
                          >
                            Sell
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <TradeDrawer
        open={!!selectedToken && !!tradeType}
        onClose={() => {
          setSelectedToken(null);
          setTradeType(null);
        }}
        token={selectedToken}
        type={tradeType || 'buy'}
        onBuy={handleBuy}
        onSell={handleSell}
        balance={tokenBalance}
      />
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