import React, { useState, useEffect } from 'react';
import { useWallet } from '../../context/WalletContext';

const getRouteScanUrl = (address: string) =>
  `https://cdn.routescan.io/api/evm/all/address/${address}/erc20-holdings?ecosystem=avalanche&limit=100`;

function formatBalance(balance: string, decimals: number) {
  if (!balance) return '0';
  return (Number(balance) / Math.pow(10, decimals)).toLocaleString(undefined, { maximumFractionDigits: 6 });
}

const WalletTokensSidebar: React.FC = () => {
  const { walletAddress, isConnected } = useWallet();
  const [tokens, setTokens] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = async () => {
    if (!walletAddress) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getRouteScanUrl(walletAddress));
      if (!res.ok) throw new Error('Failed to fetch tokens');
      const data = await res.json();
      setTokens(data.items || []);
    } catch (err: any) {
      setError('Error fetching tokens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && walletAddress) {
      fetchTokens();
    } else {
      setTokens([]);
    }
    // eslint-disable-next-line
  }, [walletAddress, isConnected]);

  const filteredTokens = tokens.filter(token =>
    (token.token.symbol && token.token.symbol.toLowerCase().includes(search.toLowerCase())) ||
    (token.token.name && token.token.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="bg-black border border-gray-800 rounded-lg p-4 shadow-md w-full max-w-xs mx-auto mb-6 max-h-[600px] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Your Wallet Tokens</h2>
        <button
  className="p-2 rounded-full hover:bg-gray-800 transition-colors text-red-500 hover:text-red-600 focus:outline-none disabled:opacity-50"
  onClick={fetchTokens}
  title="Refresh"
  disabled={loading}
>
  <svg
    className={`w-7 h-7 ${loading ? 'animate-spin' : ''}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 4v5h5M20 20v-5h-5M4 9a8 8 0 0113.657-3.032M20 15a8 8 0 01-13.657 3.032"
    />
  </svg>
</button>
      </div>
      <input
        type="text"
        placeholder="Search token..."
        className="w-full mb-3 px-3 py-2 rounded bg-black text-white border border-gray-700"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {error && <div className="text-red-400 text-xs mb-2">{error}</div>}
      {!isConnected ? (
        <div className="text-gray-400 text-center py-8">Connect your wallet to see your tokens.</div>
      ) : loading ? (
        <div className="text-gray-400 text-center py-8">Loading...</div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-scroll">
          {filteredTokens.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No tokens found.</div>
          ) : (
            filteredTokens.map(token => (
              <div key={token.tokenAddress} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-800 transition">
                <img src={token.token.detail?.icon || token.token.detail?.iconUrls?.['32']} alt={token.token.symbol} className="w-7 h-7 rounded-full border border-gray-700" />
                <div className="flex-1">
                  <div className="text-white font-semibold text-sm">{token.token.symbol}</div>
                  <div className="text-xs text-gray-400">{token.token.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">{formatBalance(token.holderBalance, token.token.decimals)}</div>
                  {token.valueInUsd && <div className="text-xs text-green-400">${Number(token.valueInUsd).toFixed(2)}</div>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default WalletTokensSidebar; 