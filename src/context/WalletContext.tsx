import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { io, Socket } from 'socket.io-client';
import { useToast } from './ToastContext';

const RUGFI_CONTRACT = '0xe4C1FC4D3A0f67fE9AC583C92Dd3C460df0C15Fe';
const MIN_RUGFI_BALANCE = ethers.utils.parseUnits('15000000', 18); // 15M RUGFI

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  rugfiBalance: string | null;
  isWebSocketConnected: boolean;
  socket: Socket | null;
  connectWallet: (privateKey: string) => Promise<boolean>;
  disconnectWallet: () => void;
  checkRugfiBalance: (address: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// ABI mínimo para el token ERC20
const RUGFI_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
];

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [rugfiBalance, setRugfiBalance] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const { showToast } = useToast();

  const connectWebSocket = useCallback(() => {
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
        setIsWebSocketConnected(true);
        reconnectAttempts.current = 0;
        showToast({ type: 'success', message: 'Socket.IO connected' });
        console.log('Connected to server:', socketInstance.id);
      });

      socketInstance.on('disconnect', () => {
        setIsWebSocketConnected(false);
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
      });

      socketInstance.on('creatorAnalysis', (analysis) => {
        console.log('Creator analysis received:', analysis);
      });

      socketInstance.on('bonding_update', (analysis) => {
        console.log('bonding_update:', analysis);
      });

      setSocket(socketInstance);
    } catch (error) {
      console.error('Error connecting to Socket.IO:', error);
      showToast({ type: 'error', message: 'Failed to connect to server' });
    }
  }, [showToast]);

  const disconnectWebSocket = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsWebSocketConnected(false);
      reconnectAttempts.current = 0;
    }
  }, [socket]);

  const checkRugfiBalance = useCallback(async (address: string): Promise<string> => {
    try {
      const provider = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
      const tokenContract = new ethers.Contract(RUGFI_CONTRACT, RUGFI_ABI, provider);
      const balance = await tokenContract.balanceOf(address);
      const formattedBalance = ethers.utils.formatUnits(balance, 18);
      setRugfiBalance(formattedBalance);
      return formattedBalance;
    } catch (error) {
      console.error('Error checking RUGFI balance:', error);
      throw error;
    }
  }, []);

  const connectWallet = useCallback(async (privateKey: string): Promise<boolean> => {
    try {
      const provider = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
      const wallet = new ethers.Wallet(privateKey, provider);
      const address = await wallet.getAddress();

      // Verificar balance de RUGFI
      const balance = await checkRugfiBalance(address);
      const balanceBN = ethers.utils.parseUnits(balance, 18);

      if (balanceBN.lt(MIN_RUGFI_BALANCE)) {
        showToast({
          type: 'error',
          message: 'You need at least 15M RUGFI tokens to start trading and sniping'
        });
        return false;
      }

      // Guardar en localStorage
      localStorage.setItem('wallet_private_key', privateKey);
      setWalletAddress(address);
      setIsConnected(true);

      // Conectar WebSocket
      connectWebSocket();

      showToast({
        type: 'success',
        message: 'Wallet connected successfully'
      });

      return true;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      showToast({
        type: 'error',
        message: 'Failed to connect wallet. Please check your private key.'
      });
      return false;
    }
  }, [connectWebSocket, showToast, checkRugfiBalance]);

  const disconnectWallet = useCallback(() => {
    localStorage.removeItem('wallet_private_key');
    setWalletAddress(null);
    setRugfiBalance(null);
    setIsConnected(false);
    disconnectWebSocket();
    showToast({
      type: 'info',
      message: 'Wallet disconnected'
    });
    // Recargar la aplicación
    window.location.reload();
  }, [disconnectWebSocket, showToast]);

  // Verificar wallet al cargar
  useEffect(() => {
    const storedWallet = localStorage.getItem('wallet_private_key');
    if (storedWallet) {
      connectWallet(storedWallet).catch(console.error);
    }
  }, [connectWallet]);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        walletAddress,
        rugfiBalance,
        isWebSocketConnected,
        socket,
        connectWallet,
        disconnectWallet,
        checkRugfiBalance
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}; 