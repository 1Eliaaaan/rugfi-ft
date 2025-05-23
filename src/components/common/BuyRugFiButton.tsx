import React from 'react';

const BuyRugFiButton: React.FC = () => (
  <a
    href="https://lfj.gg/avalanche/swap?outputCurrency=0xe4C1FC4D3A0f67fE9AC583C92Dd3C460df0C15Fe&inputCurrency=AVAX"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed z-50 bottom-6 right-6 flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-3 rounded-full shadow-lg transition-all duration-200 text-sm md:text-base animate-bounce"
    style={{ boxShadow: '0 4px 24px 0 rgba(255,0,0,0.15)' }}
  >
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M2 16l10-12 10 12-10 6-10-6z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 22V8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    BUY RUG-FI TOKEN
  </a>
);

export default BuyRugFiButton; 