import React, { createContext, useContext, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './WalletContext';
import { useToast } from './ToastContext';

// Contract addresses
const PROXY_ADDRESS = "0x8315f1eb449Dd4B779495C3A0b05e5d194446c6e";
const CALCULATOR_ADDRESS = "0xBE3F25BF9Bc1bDae9238f3c9153Da93Fd4E7B927";
// const NEW_PROXY_ADDRESS = "0x8157DaC6A671CECe2bA57e3554224BECf2c6B5D7";
const SELL_CONTRACT_ADDRESS = "0x8315f1eb449Dd4B779495C3A0b05e5d194446c6e";
const SLIPPAGE_PERCENT = 1;

// ABIs
const ABI_CALCULATE = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "avaxAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "_tokenId", "type": "uint256" }
    ],
    "name": "calculatePurchaseAmountAndPrice",
    "outputs": [
      { "internalType": "uint256", "name": "tokenAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "price", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const ABI_BUY = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "_tokenId", "type": "uint256" }
    ],
    "name": "buyAndCreateLpIfPossible",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

const SELL_CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "_tokenId", "type": "uint256" }
    ],
    "name": "sell",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "tokenBalanceOf",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

interface TradingContextType {
  buyToken: (tokenAddress: string, avaxAmount: number) => Promise<void>;
  sellToken: (tokenAddress: string, percentage: number) => Promise<void>;
  getTokenBalance: (tokenAddress: string) => Promise<string>;
  getTokenPrice: (tokenAddress: string, avaxAmount: number) => Promise<string>;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

// Helper function to get token ID
const getTokenId = async (contractAddress: string): Promise<number> => {
  try {
    const response = await fetch(`https://api.arena.trade/groups_plus?token_contract_address=eq.${contractAddress.toLowerCase()}`, {
      headers: {
        'accept': '*/*',
        'origin': 'https://arena.trade',
        'referer': 'https://arena.trade/'
      }
    });
    
    const data = await response.json();
    if (!data || data.length === 0) {
      throw new Error("Token information not found");
    }
    
    return data[0].group_id;
  } catch (error) {
    console.error("Error getting Token ID:", error);
    throw error;
  }
};

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { walletAddress, isConnected } = useWallet();
  const { showToast } = useToast();

  const getProvider = useCallback(() => {
    return new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
  }, []);

  const getSigner = useCallback(() => {
    const provider = getProvider();
    const privateKey = localStorage.getItem('wallet_private_key');
    if (!privateKey) throw new Error('No wallet connected');
    return new ethers.Wallet(privateKey, provider);
  }, [getProvider]);

  const getTokenBalance = useCallback(async (tokenAddress: string): Promise<string> => {
    if (!walletAddress) throw new Error('No wallet connected');
    
    const provider = getProvider();
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'],
      provider
    );

    const [balance, decimals] = await Promise.all([
      tokenContract.balanceOf(walletAddress),
      tokenContract.decimals()
    ]);

    return ethers.utils.formatUnits(balance, decimals);
  }, [walletAddress, getProvider]);

  const getTokenPrice = useCallback(async (tokenAddress: string, avaxAmount: number): Promise<string> => {
    try {
      const provider = getProvider();
      const calculatorContract = new ethers.Contract(CALCULATOR_ADDRESS, ABI_CALCULATE, provider);
      const tokenId = await getTokenId(tokenAddress);
      const avaxAmountWei = ethers.utils.parseUnits(avaxAmount.toString(), 18);
      
      const [tokenAmount] = await calculatorContract.calculatePurchaseAmountAndPrice(avaxAmountWei, tokenId);
      return ethers.utils.formatUnits(tokenAmount, 18);
    } catch (error) {
      console.error('Error getting token price:', error);
      throw error;
    }
  }, [getProvider]);

  const buyToken = useCallback(async (tokenAddress: string, avaxAmount: number) => {
    if (!isConnected || !walletAddress) {
      showToast({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }

    try {
      const signer = getSigner();
      const provider = getProvider();
      const privateKey = localStorage.getItem('wallet_private_key');
      if (!privateKey) throw new Error('No wallet connected');

      // Get token ID
      const tokenId = await getTokenId(tokenAddress);
      console.log("Token ID:", tokenId);

      // Calculate tokens to receive
      const calculatorContract = new ethers.Contract(CALCULATOR_ADDRESS, ABI_CALCULATE, provider);
      const avaxAmountWei = ethers.utils.parseUnits(avaxAmount.toString(), 18);
      
      const [tokenAmount, price] = await calculatorContract.calculatePurchaseAmountAndPrice(avaxAmountWei, tokenId);
      console.log("Tokens calculados:", tokenAmount.toString());

      // Calcular slippage y redondear como en el ejemplo
      const tokensWithSlippage = Number(ethers.utils.formatUnits(tokenAmount, 18)) * (1 - SLIPPAGE_PERCENT / 100);
      console.log("Tokens con slippage:", tokensWithSlippage.toFixed(0));

      // Preparar la compra
      const wallet = new ethers.Wallet(privateKey, provider);
      const buyContract = new ethers.Contract(PROXY_ADDRESS, ABI_BUY, wallet);

      // Convertir valores
      const amount = ethers.utils.parseUnits(tokensWithSlippage.toFixed(0), 18);
      const valueToSend = ethers.utils.parseUnits(avaxAmount.toString(), 18);

      showToast({ type: 'info', message: 'Procesando transacción de compra...' });
      console.log("Enviando transacción...", { amount: amount.toString(), tokenId, valueToSend: valueToSend.toString() });

      // Ejecutar la compra
      const tx = await buyContract.buyAndCreateLpIfPossible(amount, tokenId, {
        value: valueToSend,
        gasLimit: 300000,
      });

      showToast({ type: 'info', message: 'Transacción enviada. Esperando confirmación...' });
      console.log("Hash de la transacción:", tx.hash);
      const receipt = await tx.wait();
      showToast({ type: 'success', message: `Transacción confirmada en bloque ${receipt.blockNumber}` });
      console.log("Transacción confirmada en bloque:", receipt.blockNumber);

      // Refrescar balance
      const newBalance = await getTokenBalance(tokenAddress);
      console.log("Nuevo balance del token:", newBalance);

    } catch (error: any) {
      console.error('Error al comprar:', error);
      let errorMessage = 'Error al realizar la compra. Intenta de nuevo.';
      if (error.code === 'CALL_EXCEPTION') {
        errorMessage = 'La transacción fue revertida. Puede ser por falta de liquidez o impacto de precio.';
      } else if (error.message && error.message.includes('insufficient funds')) {
        errorMessage = 'Saldo de AVAX insuficiente para la transacción.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      showToast({ type: 'error', message: errorMessage });
    }
  }, [isConnected, walletAddress, getSigner, getProvider, getTokenBalance, showToast]);

  const sellToken = useCallback(async (tokenAddress: string, percentage: number) => {
    if (!isConnected || !walletAddress) {
      showToast({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }

    try {
      const signer = getSigner();
      const provider = getProvider();

      // Get token ID
      const tokenId = await getTokenId(tokenAddress);
      console.log("Token ID:", tokenId);

      // Get token balance
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function balanceOf(address) view returns (uint256)'],
        provider
      );

      const balance = await tokenContract.balanceOf(walletAddress);
      console.log("Token balance:", ethers.utils.formatUnits(balance, 18));

      if (balance.isZero()) {
        throw new Error(`You have no tokens ${tokenAddress} to sell.`);
      }

      // Calculate amount to sell
      const formattedBalance = ethers.utils.formatUnits(balance, 18);
      const balanceInteger = formattedBalance.split('.')[0];
      const sellAmount = Math.floor(Number(balanceInteger) * percentage / 100).toString();

      if (sellAmount === '0') {
        throw new Error(`The calculated amount to sell (${percentage}%) is 0.`);
      }

      const amountToSell = ethers.utils.parseUnits(sellAmount, 18);

      // Execute sell
      const sellContract = new ethers.Contract(SELL_CONTRACT_ADDRESS, SELL_CONTRACT_ABI, signer);
      
      showToast({ type: 'info', message: 'Processing sell transaction...' });
      
      const tx = await sellContract.sell(amountToSell, tokenId, { 
        gasLimit: 500000
      });

      showToast({ type: 'info', message: `Sell transaction sent (${percentage}%). Hash: ${tx.hash}` });
      const receipt = await tx.wait();
      
      showToast({ type: 'success', message: `${percentage}% sell confirmed in block ${receipt.blockNumber}` });
    } catch (error: any) {
      console.error('Error selling token:', error);
      showToast({ 
        type: 'error', 
        message: error.message || 'Error selling token. Please try again.' 
      });
    }
  }, [isConnected, walletAddress, getSigner, getProvider, showToast]);

  return (
    <TradingContext.Provider
      value={{
        buyToken,
        sellToken,
        getTokenBalance,
        getTokenPrice
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (context === undefined) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
}; 