import React from 'react';
import Logo from '../../common/Logo/Logo';
import SearchBar from '../../common/SearchBar/SearchBar';
import NotificationSettings from '../../common/NotificationSettings/NotificationSettings';
import WalletConnect from '../../common/WalletConnect/WalletConnect';

const Header: React.FC = () => {
  const handleSearch = (query: string) => {
    console.log('Search query:', query);
  };

  return (
    <header className="">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 w-full">
          {/* Logo a la izquierda */}
          <div className="flex-shrink-0 flex items-center w-1/4">
            <Logo />
          </div>
          {/* SearchBar centrado */}
          <div className="flex-1 flex justify-center items-center">
            <div className="w-full max-w-xl">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Enter token contract address..."
              />
            </div>
          </div>
          {/* Notificaciones y Wallet a la derecha */}
          <div className="flex-shrink-0 flex items-center w-1/4 space-x-4">
            <WalletConnect />
            <NotificationSettings />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 