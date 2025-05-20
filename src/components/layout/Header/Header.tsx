import React, { useState } from 'react';
import Logo from '../../common/Logo/Logo';
import SearchBar from '../../common/SearchBar/SearchBar';
import NotificationSettings from '../../common/NotificationSettings/NotificationSettings';
import Login from '../../auth/Login/Login';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Desktop Layout */}
          <div className="hidden md:flex md:items-center md:space-x-8 flex-1">
            <Logo />
            <div className="flex-1 max-w-2xl mx-4">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Enter token contract address..."
              />
            </div>
            <div className="flex items-center space-x-4">
              <NotificationSettings />
              <Login />
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden flex items-center justify-between w-full">
            <Logo />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
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
                <Login />

              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 