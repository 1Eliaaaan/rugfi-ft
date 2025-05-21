import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from './ToastContext';

interface WebSocketContextType {
  isConnected: boolean;
  socket: Socket | null;
  connect: () => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const { showToast } = useToast();

  const connect = () => {
    if (reconnectAttempts.current >= 3) {
      showToast({ type: 'error', message: 'Maximum reconnection attempts reached' });
      return;
    }

    try {
      const socketInstance = io('https://web-production-c0567.up.railway.app', {
        reconnectionAttempts: 3,
        reconnectionDelay: 5000,
        timeout: 10000,
      });

      socketInstance.on('connect', () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;
        showToast({ type: 'success', message: 'Socket.IO connected' });
        console.log('Connected to server:', socketInstance.id);
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
        reconnectAttempts.current += 1;
        
        if (reconnectAttempts.current < 3) {
          showToast({ type: 'error', message: `Socket.IO disconnected. Attempt ${reconnectAttempts.current} of 3` });
        } else {
          showToast({ type: 'error', message: 'Maximum reconnection attempts reached' });
        }
        console.log('Disconnected from server');
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
        showToast({ type: 'error', message: 'Connection error occurred' });
      });

      // Eventos específicos de la aplicación
      socketInstance.on('newToken', (token) => {
        console.log('New token detected:', token);
        // Aquí puedes emitir un evento personalizado o usar un callback
      });

      socketInstance.on('creatorAnalysis', (analysis) => {
        console.log('creatorAnalysis!', analysis);
      });

      setSocket(socketInstance);
    } catch (error) {
      console.error('Error connecting to Socket.IO:', error);
      showToast({ type: 'error', message: 'Failed to connect to server' });
    }
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      reconnectAttempts.current = 0;
    }
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ isConnected, socket, connect, disconnect }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}; 