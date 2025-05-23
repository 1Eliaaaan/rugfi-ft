import React, { useState, useEffect } from 'react';

interface TradeDrawerProps {
  open: boolean;
  onClose: () => void;
  token: any;
  type: 'buy' | 'sell';
  onBuy?: (avaxAmount: number) => void;
  onSell?: (percentage: number) => void;
  balance?: string;
}

const quickSell = [25, 50, 100];
const PRESETS_KEY = 'rugfi_quick_buy_presets';

const TradeDrawer: React.FC<TradeDrawerProps> = ({ open, onClose, token, type, onBuy, onSell, balance }) => {
  const [avaxAmount, setAvaxAmount] = useState('');
  const [sellPercent, setSellPercent] = useState('');
  const [buyPresets, setBuyPresets] = useState<number[]>([1, 2, 5]);
  const [newPreset, setNewPreset] = useState('');
  const [presetAdded, setPresetAdded] = useState(false);

  // Cargar presets desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem(PRESETS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.every(x => typeof x === 'number')) {
          setBuyPresets(parsed);
        }
      } catch {}
    }
  }, []);

  // Guardar presets en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(buyPresets));
  }, [buyPresets]);

  useEffect(() => {
    if (!open) {
      setAvaxAmount('');
      setSellPercent('');
    }
  }, [open]);

  const addPreset = () => {
    const val = parseFloat(newPreset);
    if (!isNaN(val) && val > 0 && !buyPresets.includes(val)) {
      setBuyPresets([...buyPresets, val].sort((a, b) => a - b));
      setNewPreset('');
      setPresetAdded(true);
      setTimeout(() => setPresetAdded(false), 800);
    }
  };

  const removePreset = (val: number) => {
    setBuyPresets(buyPresets.filter(p => p !== val));
  };

  if (!open || !token) return null;

  return (
    <div className={`fixed inset-0 z-50 flex justify-end transition-all duration-300 ${open ? '' : 'pointer-events-none'}`}>
      {/* Fondo oscuro */}
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose}></div>
      {/* Panel lateral */}
      <div className="relative w-full max-w-sm h-full bg-black  shadow-2xl flex flex-col p-6 animate-fade-in-right">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">×</button>
        <div className="flex items-center space-x-3 mb-6">
          {token.photo_url && <img src={token.photo_url} alt={token.token_name} className="w-10 h-10 rounded-full border border-gray-700" />}
          <div>
            <div className="text-lg font-bold text-white">{token.token_name}</div>
            <div className="text-xs text-gray-400">{token.token_symbol}</div>
          </div>
        </div>
        {type === 'buy' ? (
          <>
            <div className="mb-2 text-white font-semibold">Buy with AVAX</div>
            <div className="mb-2">
              <div className="flex flex-wrap gap-2 items-center">
                {buyPresets.map(val => (
                  <div
                    key={val}
                    className="group relative flex items-center bg-gray-800 rounded-full px-3 py-1 text-white text-sm cursor-pointer hover:bg-blue-700 transition"
                  >
                    <button
                      onClick={() => setAvaxAmount(val.toString())}
                      className="focus:outline-none"
                      title={`Comprar ${val} AVAX`}
                    >
                      {val} AVAX
                    </button>
                    <button
                      onClick={() => removePreset(val)}
                      className="ml-2 text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                      title="Eliminar preset"
                      tabIndex={-1}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <form
                  className="flex items-center gap-2 ml-2"
                  onSubmit={e => { e.preventDefault(); addPreset(); }}
                  title="Agregar nuevo preset"
                >
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    className={`w-24 px-2 py-2 rounded overflow-hidden bg-black text-white border border-gray-700 text-sm focus:border-blue-500 transition ${presetAdded ? 'border-green-500' : ''}`}
                    placeholder="+ Preset"
                    value={newPreset}
                    onChange={e => setNewPreset(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 bg-red-700 hover:bg-red-400 text-white rounded text-sm font-bold"
                    disabled={!newPreset || parseFloat(newPreset) <= 0 || buyPresets.includes(parseFloat(newPreset))}
                  >
                    +
                  </button>
                </form>
              </div>
              <div className="text-xs text-gray-500 mt-1">Click on a preset to use it. Delete with the X.</div>
            </div>
            <div className="mb-4">
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 rounded bg-black text-white border border-gray-700 mb-2"
                placeholder="Enter AVAX amount"
                value={avaxAmount}
                onChange={e => setAvaxAmount(e.target.value)}
              />
              <button
                className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition"
                onClick={() => onBuy && onBuy(Number(avaxAmount))}
                disabled={!avaxAmount || Number(avaxAmount) <= 0}
              >
                Buy
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-2 text-white font-semibold">Sell {token.token_symbol}</div>
            <div className="mb-2 text-xs text-gray-400">Balance: {balance || '0'}</div>
            <div className="flex space-x-2 mb-4">
              {quickSell.map(val => (
                <button key={val} onClick={() => setSellPercent(val.toString())} className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 text-white text-sm">{val}%</button>
              ))}
            </div>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              className="w-full mb-4 px-3 py-2 rounded bg-black text-white border border-gray-700"
              placeholder="Enter % to sell"
              value={sellPercent}
              onChange={e => setSellPercent(e.target.value)}
            />
            <button
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition"
              onClick={() => onSell && onSell(Number(sellPercent))}
              disabled={!sellPercent || Number(sellPercent) <= 0 || Number(sellPercent) > 100}
            >
              Sell
            </button>
          </>
        )}
      </div>
      {/* Animación CSS */}
      <style>{`
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in-right { animation: fadeInRight 0.3s ease; }
      `}</style>
    </div>
  );
};

export default TradeDrawer; 