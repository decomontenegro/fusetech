import { ethers } from 'ethers'
import { createPublicClient, createWalletClient, http, parseEther, formatEther } from 'viem'
import { base } from 'viem/chains'

// FUSE Token ABI (ERC-20 with minting capabilities)
const FUSE_TOKEN_ABI = [
  // ERC-20 Standard
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
  
  // FUSE-specific functions
  'function mint(address to, uint256 amount) returns (bool)',
  'function burn(uint256 amount) returns (bool)',
  'function burnFrom(address from, uint256 amount) returns (bool)',
  'function mintForActivity(address user, uint256 activityId, uint256 amount) returns (bool)',
  'function redeemTokens(address user, uint256 amount, string memory itemId) returns (bool)',
  
  // Admin functions
  'function setMinter(address minter, bool enabled)',
  'function pause()',
  'function unpause()',
  
  // FUSE-specific events
  'event ActivityReward(address indexed user, uint256 indexed activityId, uint256 amount)',
  'event TokenRedemption(address indexed user, uint256 amount, string itemId)',
] as const

export interface TokenBalance {
  balance: string
  formatted: string
}

export interface TransactionResult {
  hash: string
  success: boolean
  error?: string
}

export interface ActivityReward {
  user: string
  activityId: string
  amount: string
  timestamp: number
  transactionHash: string
}

class FUSETokenContract {
  private provider: ethers.Provider
  private contract: ethers.Contract
  private contractAddress: string

  constructor() {
    this.contractAddress = process.env.FUSE_TOKEN_CONTRACT_ADDRESS || ''
    
    // Initialize provider for Base L2
    this.provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'
    )
    
    // Initialize contract
    this.contract = new ethers.Contract(
      this.contractAddress,
      FUSE_TOKEN_ABI,
      this.provider
    )
  }

  // Get token information
  async getTokenInfo() {
    try {
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        this.contract.name(),
        this.contract.symbol(),
        this.contract.decimals(),
        this.contract.totalSupply(),
      ])

      return {
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: formatEther(totalSupply),
        contractAddress: this.contractAddress,
      }
    } catch (error) {
      console.error('Error fetching token info:', error)
      throw error
    }
  }

  // Get user balance
  async getBalance(userAddress: string): Promise<TokenBalance> {
    try {
      const balance = await this.contract.balanceOf(userAddress)
      
      return {
        balance: balance.toString(),
        formatted: formatEther(balance),
      }
    } catch (error) {
      console.error('Error fetching balance:', error)
      throw error
    }
  }

  // Mint tokens for activity (admin function)
  async mintForActivity(
    userAddress: string,
    activityId: string,
    amount: number,
    signerPrivateKey: string
  ): Promise<TransactionResult> {
    try {
      // Create wallet from private key
      const wallet = new ethers.Wallet(signerPrivateKey, this.provider)
      const contractWithSigner = this.contract.connect(wallet)

      // Convert amount to wei (18 decimals)
      const amountWei = parseEther(amount.toString())

      // Execute transaction
      const tx = await contractWithSigner.mintForActivity(
        userAddress,
        activityId,
        amountWei
      )

      // Wait for confirmation
      const receipt = await tx.wait()

      return {
        hash: receipt.hash,
        success: receipt.status === 1,
      }
    } catch (error) {
      console.error('Error minting tokens:', error)
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Redeem tokens for marketplace items
  async redeemTokens(
    userAddress: string,
    amount: number,
    itemId: string,
    signerPrivateKey: string
  ): Promise<TransactionResult> {
    try {
      const wallet = new ethers.Wallet(signerPrivateKey, this.provider)
      const contractWithSigner = this.contract.connect(wallet)

      const amountWei = parseEther(amount.toString())

      const tx = await contractWithSigner.redeemTokens(
        userAddress,
        amountWei,
        itemId
      )

      const receipt = await tx.wait()

      return {
        hash: receipt.hash,
        success: receipt.status === 1,
      }
    } catch (error) {
      console.error('Error redeeming tokens:', error)
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Transfer tokens between users
  async transfer(
    fromPrivateKey: string,
    toAddress: string,
    amount: number
  ): Promise<TransactionResult> {
    try {
      const wallet = new ethers.Wallet(fromPrivateKey, this.provider)
      const contractWithSigner = this.contract.connect(wallet)

      const amountWei = parseEther(amount.toString())

      const tx = await contractWithSigner.transfer(toAddress, amountWei)
      const receipt = await tx.wait()

      return {
        hash: receipt.hash,
        success: receipt.status === 1,
      }
    } catch (error) {
      console.error('Error transferring tokens:', error)
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Get activity rewards history
  async getActivityRewards(userAddress: string, fromBlock = 0): Promise<ActivityReward[]> {
    try {
      const filter = this.contract.filters.ActivityReward(userAddress)
      const events = await this.contract.queryFilter(filter, fromBlock)

      const rewards: ActivityReward[] = []

      for (const event of events) {
        if (event.args) {
          const block = await this.provider.getBlock(event.blockNumber)
          
          rewards.push({
            user: event.args.user,
            activityId: event.args.activityId.toString(),
            amount: formatEther(event.args.amount),
            timestamp: block ? block.timestamp * 1000 : Date.now(),
            transactionHash: event.transactionHash,
          })
        }
      }

      return rewards.sort((a, b) => b.timestamp - a.timestamp)
    } catch (error) {
      console.error('Error fetching activity rewards:', error)
      return []
    }
  }

  // Get redemption history
  async getRedemptionHistory(userAddress: string, fromBlock = 0) {
    try {
      const filter = this.contract.filters.TokenRedemption(userAddress)
      const events = await this.contract.queryFilter(filter, fromBlock)

      const redemptions = []

      for (const event of events) {
        if (event.args) {
          const block = await this.provider.getBlock(event.blockNumber)
          
          redemptions.push({
            user: event.args.user,
            amount: formatEther(event.args.amount),
            itemId: event.args.itemId,
            timestamp: block ? block.timestamp * 1000 : Date.now(),
            transactionHash: event.transactionHash,
          })
        }
      }

      return redemptions.sort((a, b) => b.timestamp - a.timestamp)
    } catch (error) {
      console.error('Error fetching redemption history:', error)
      return []
    }
  }

  // Estimate gas for transactions
  async estimateGas(method: string, params: any[]): Promise<string> {
    try {
      const gasEstimate = await this.contract[method].estimateGas(...params)
      return gasEstimate.toString()
    } catch (error) {
      console.error('Error estimating gas:', error)
      return '0'
    }
  }

  // Get current gas price
  async getGasPrice(): Promise<string> {
    try {
      const gasPrice = await this.provider.getFeeData()
      return gasPrice.gasPrice?.toString() || '0'
    } catch (error) {
      console.error('Error fetching gas price:', error)
      return '0'
    }
  }
}

export const fuseTokenContract = new FUSETokenContract()

// Utility functions
export function formatTokenAmount(amount: string | number, decimals = 18): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })
}

export function parseTokenAmount(amount: string): string {
  return parseEther(amount).toString()
}

// Validate Ethereum address
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address)
}

// Generate wallet from mnemonic
export function generateWallet(mnemonic?: string): ethers.Wallet {
  if (mnemonic) {
    return ethers.Wallet.fromPhrase(mnemonic)
  }
  return ethers.Wallet.createRandom()
}
