'use client'

import { createConfig, http } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors'
import { createPublicClient, createWalletClient } from 'viem'

// Wagmi configuration
export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    metaMask(),
    coinbaseWallet({
      appName: 'FUSEtech',
      appLogoUrl: 'https://fusetech.app/logo.png',
    }),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
      metadata: {
        name: 'FUSEtech',
        description: 'Transforme exercícios em recompensas',
        url: 'https://fusetech.app',
        icons: ['https://fusetech.app/logo.png'],
      },
    }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
})

// Public client for reading blockchain data
export const publicClient = createPublicClient({
  chain: base,
  transport: http(),
})

// Wallet connection utilities
export interface WalletInfo {
  address: string
  chainId: number
  isConnected: boolean
  connector?: string
}

export interface NetworkInfo {
  chainId: number
  name: string
  currency: string
  rpcUrl: string
  blockExplorer: string
}

export const supportedNetworks: NetworkInfo[] = [
  {
    chainId: base.id,
    name: 'Base',
    currency: 'ETH',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
  },
  {
    chainId: baseSepolia.id,
    name: 'Base Sepolia',
    currency: 'ETH',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
  },
]

// Wallet connection hooks and utilities
export class WalletManager {
  // Check if wallet is installed
  static isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && 
           typeof window.ethereum !== 'undefined' && 
           window.ethereum.isMetaMask
  }

  static isCoinbaseWalletInstalled(): boolean {
    return typeof window !== 'undefined' && 
           typeof window.ethereum !== 'undefined' && 
           window.ethereum.isCoinbaseWallet
  }

  // Add network to wallet
  static async addNetwork(network: NetworkInfo): Promise<boolean> {
    if (typeof window === 'undefined' || !window.ethereum) {
      return false
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${network.chainId.toString(16)}`,
          chainName: network.name,
          nativeCurrency: {
            name: network.currency,
            symbol: network.currency,
            decimals: 18,
          },
          rpcUrls: [network.rpcUrl],
          blockExplorerUrls: [network.blockExplorer],
        }],
      })
      return true
    } catch (error) {
      console.error('Error adding network:', error)
      return false
    }
  }

  // Switch to network
  static async switchNetwork(chainId: number): Promise<boolean> {
    if (typeof window === 'undefined' || !window.ethereum) {
      return false
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      })
      return true
    } catch (error: any) {
      // If network is not added, try to add it
      if (error.code === 4902) {
        const network = supportedNetworks.find(n => n.chainId === chainId)
        if (network) {
          return await this.addNetwork(network)
        }
      }
      console.error('Error switching network:', error)
      return false
    }
  }

  // Request account access
  static async requestAccounts(): Promise<string[]> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('Wallet not available')
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })
      return accounts
    } catch (error) {
      console.error('Error requesting accounts:', error)
      throw error
    }
  }

  // Get current accounts
  static async getAccounts(): Promise<string[]> {
    if (typeof window === 'undefined' || !window.ethereum) {
      return []
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      })
      return accounts
    } catch (error) {
      console.error('Error getting accounts:', error)
      return []
    }
  }

  // Get current chain ID
  static async getChainId(): Promise<number> {
    if (typeof window === 'undefined' || !window.ethereum) {
      return 0
    }

    try {
      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      })
      return parseInt(chainId, 16)
    } catch (error) {
      console.error('Error getting chain ID:', error)
      return 0
    }
  }

  // Listen for account changes
  static onAccountsChanged(callback: (accounts: string[]) => void): () => void {
    if (typeof window === 'undefined' || !window.ethereum) {
      return () => {}
    }

    const handler = (accounts: string[]) => {
      callback(accounts)
    }

    window.ethereum.on('accountsChanged', handler)

    return () => {
      window.ethereum?.removeListener('accountsChanged', handler)
    }
  }

  // Listen for chain changes
  static onChainChanged(callback: (chainId: string) => void): () => void {
    if (typeof window === 'undefined' || !window.ethereum) {
      return () => {}
    }

    const handler = (chainId: string) => {
      callback(chainId)
    }

    window.ethereum.on('chainChanged', handler)

    return () => {
      window.ethereum?.removeListener('chainChanged', handler)
    }
  }

  // Disconnect wallet
  static async disconnect(): Promise<void> {
    if (typeof window === 'undefined' || !window.ethereum) {
      return
    }

    try {
      // For MetaMask, we can't actually disconnect, but we can clear permissions
      if (window.ethereum.isMetaMask) {
        await window.ethereum.request({
          method: 'wallet_revokePermissions',
          params: [{
            eth_accounts: {},
          }],
        })
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
    }
  }
}

// Transaction utilities
export interface TransactionParams {
  to: string
  value?: string
  data?: string
  gasLimit?: string
  gasPrice?: string
}

export async function sendTransaction(params: TransactionParams): Promise<string> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Wallet not available')
  }

  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [params],
    })
    return txHash
  } catch (error) {
    console.error('Error sending transaction:', error)
    throw error
  }
}

// Sign message
export async function signMessage(message: string, account: string): Promise<string> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Wallet not available')
  }

  try {
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, account],
    })
    return signature
  } catch (error) {
    console.error('Error signing message:', error)
    throw error
  }
}

// Verify signature
export async function verifySignature(
  message: string,
  signature: string,
  address: string
): Promise<boolean> {
  try {
    // This would typically be done on the backend
    // For demo purposes, we'll return true
    return true
  } catch (error) {
    console.error('Error verifying signature:', error)
    return false
  }
}

// Format address for display
export function formatAddress(address: string, length = 4): string {
  if (!address) return ''
  return `${address.slice(0, 2 + length)}...${address.slice(-length)}`
}

// Check if address is valid
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}
