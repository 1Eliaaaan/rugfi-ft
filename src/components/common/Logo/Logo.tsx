import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-red-300 to-red-700 bg-clip-text text-transparent inline-block py-[0.1em] tracking-[0.02em]">Rug-Fi</span>
    </div>
  );
};

export default Logo; 