import React, { useState } from 'react';
import Logo from '../../common/Logo/Logo';
import SearchBar from '../../common/SearchBar/SearchBar';
import NotificationSettings from '../../common/NotificationSettings/NotificationSettings';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          {/* Notificaciones a la derecha */}
          <div className="flex-shrink-0 flex items-center justify-end w-1/4">
            <NotificationSettings />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <div className="mb-4">
                <SearchBar
                  onSearch={handleSearch}
                  placeholder="Enter token contract address..."
                />
              </div>
              <div className="flex flex-col space-y-2">
                <NotificationSettings />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 