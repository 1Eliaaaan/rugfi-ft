import React, { useState, useRef, useEffect } from 'react';
import { useSoundNotification } from '../../../context/SoundNotificationContext';

interface NotificationSettingsProps {
  className?: string;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { settings, toggleSafeTokens, toggleRugTokens } = useSoundNotification();

  // Cerrar el dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 text-gray-400 hover:text-white rounded-full transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white ${
          isOpen ? 'bg-gray-700 text-white' : 'hover:bg-gray-700/50'
        }`}
      >
        <span className="sr-only">Notificaciones</span>
        <svg
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9v5.5c0 1.1-.9 2-2 2h18c-1.1 0-2-.9-2-2V9c0-3.87-3.13-7-7-7z" />
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z" />
          <path 
            d="M16 9c0-2.21-1.79-4-4-4S8 6.79 8 9" 
            className="animate-pulse"
            strokeDasharray="4 2"
          />
          <path 
            d="M18 9c0-3.31-2.69-6-6-6S6 5.69 6 9" 
            className="animate-pulse"
            strokeDasharray="4 2"
            style={{ animationDelay: '0.2s' }}
          />
        </svg>
      </button>

      <div
        className={`absolute right-0 mt-2 w-64 bg-black rounded-lg shadow-lg py-1 z-50 border border-gray-700 transform transition-all duration-300 ease-in-out ${
          isOpen 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="px-4 py-2 border-b border-gray-700">
          <h3 className="text-sm font-medium text-white">Notification Settings</h3>
        </div>
        
        {/* Safe Tokens Toggle */}
        <div className="px-4 py-3 flex items-center justify-between hover:bg-gray-700/50 transition-colors duration-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-white">Safe Tokens</span>
            <span className="text-xs text-green-400">✓</span>
          </div>
          <button
            onClick={toggleSafeTokens}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white ${
              settings.safeTokens ? 'bg-green-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ease-in-out ${
                settings.safeTokens ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Rug Tokens Toggle */}
        <div className="px-4 py-3 flex items-center justify-between hover:bg-gray-700/50 transition-colors duration-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-white">Rug Tokens</span>
            <span className="text-xs text-red-400">⚠</span>
          </div>
          <button
            onClick={toggleRugTokens}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white ${
              settings.rugTokens ? 'bg-green-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ease-in-out ${
                settings.rugTokens ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings; 