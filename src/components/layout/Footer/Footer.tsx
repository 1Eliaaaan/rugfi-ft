import React from 'react';

const Footer: React.FC = () => (
  <footer className="w-full bg-gray-900 text-gray-400 py-6 px-4 text-xs flex flex-col items-center border-t border-gray-800">
    <div className="flex items-center gap-2 mb-1">
      <span className="font-semibold text-white">© 2025 RugFi</span>
      <span className="bg-gray-800 text-white text-[11px] px-2 py-1 rounded-full font-semibold">v(beta2.0)</span>
    </div>
    <div className="mb-1">
      Built by <a href="https://x.com/iThePoo" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold">@iThePoo</a> x <a href="https://x.com/1eliaaan" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold">@1eliaaan</a>
    </div>
    <div className="text-gray-400 text-[11px] text-center max-w-2xl">
      Disclaimer: Detection and categorization accuracy is not 100%. Errors may occur due to the speed required. Still, this tool is a good guide for the trenches of Arena.
    </div>
  </footer>
);

export default Footer; 