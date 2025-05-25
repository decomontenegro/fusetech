const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🚀 Starting FUSE Token deployment...');

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log('📝 Deploying contracts with account:', deployer.address);

  // Check balance
  const balance = await deployer.getBalance();
  console.log('💰 Account balance:', ethers.utils.formatEther(balance), 'ETH');

  if (balance.lt(ethers.utils.parseEther('0.01'))) {
    throw new Error('❌ Insufficient balance for deployment');
  }

  // Deploy FUSE Token
  console.log('\n📦 Deploying FUSE Token...');
  
  const FUSEToken = await ethers.getContractFactory('FUSEToken');
  const fuseToken = await FUSEToken.deploy(
    'FUSE Token',           // name
    'FUSE',                 // symbol
    deployer.address        // admin
  );

  await fuseToken.deployed();
  console.log('✅ FUSE Token deployed to:', fuseToken.address);

  // Wait for confirmations
  console.log('⏳ Waiting for confirmations...');
  await fuseToken.deployTransaction.wait(5);

  // Verify contract on Basescan
  if (process.env.BASESCAN_API_KEY) {
    console.log('\n🔍 Verifying contract on Basescan...');
    try {
      await hre.run('verify:verify', {
        address: fuseToken.address,
        constructorArguments: [
          'FUSE Token',
          'FUSE',
          deployer.address
        ],
      });
      console.log('✅ Contract verified on Basescan');
    } catch (error) {
      console.log('⚠️ Verification failed:', error.message);
    }
  }

  // Setup initial configuration
  console.log('\n⚙️ Setting up initial configuration...');

  // Set marketplace item prices
  const itemPrices = [
    { id: 'whey_protein_1', price: ethers.utils.parseEther('150') },
    { id: 'running_shoes_1', price: ethers.utils.parseEther('400') },
    { id: 'gym_membership_1', price: ethers.utils.parseEther('200') },
    { id: 'smartwatch_1', price: ethers.utils.parseEther('800') },
    { id: 'yoga_mat_1', price: ethers.utils.parseEther('80') },
  ];

  for (const item of itemPrices) {
    const tx = await fuseToken.setItemPrice(item.id, item.price);
    await tx.wait();
    console.log(`💰 Set price for ${item.id}: ${ethers.utils.formatEther(item.price)} FUSE`);
  }

  // Grant minter role to backend service
  if (process.env.BACKEND_WALLET_ADDRESS) {
    console.log('\n👤 Granting minter role to backend service...');
    const MINTER_ROLE = await fuseToken.MINTER_ROLE();
    const tx = await fuseToken.grantRole(MINTER_ROLE, process.env.BACKEND_WALLET_ADDRESS);
    await tx.wait();
    console.log('✅ Minter role granted to:', process.env.BACKEND_WALLET_ADDRESS);
  }

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    contractAddress: fuseToken.address,
    deployerAddress: deployer.address,
    deploymentBlock: fuseToken.deployTransaction.blockNumber,
    deploymentHash: fuseToken.deployTransaction.hash,
    timestamp: new Date().toISOString(),
    gasUsed: (await fuseToken.deployTransaction.wait()).gasUsed.toString(),
    contractABI: JSON.parse(fuseToken.interface.format('json')),
  };

  // Save to file
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log('📄 Deployment info saved to:', deploymentFile);

  // Update environment variables template
  const envTemplate = `
# Blockchain Configuration (${hre.network.name})
FUSE_TOKEN_CONTRACT_ADDRESS=${fuseToken.address}
NEXT_PUBLIC_BASE_RPC_URL=${process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'}
NEXT_PUBLIC_CHAIN_ID=${(await ethers.provider.getNetwork()).chainId}

# Contract Admin
CONTRACT_ADMIN_ADDRESS=${deployer.address}
CONTRACT_ADMIN_PRIVATE_KEY=${process.env.PRIVATE_KEY || 'your-private-key'}

# Backend Service
BACKEND_WALLET_ADDRESS=${process.env.BACKEND_WALLET_ADDRESS || 'your-backend-wallet'}
`;

  fs.writeFileSync(path.join(__dirname, '..', '.env.blockchain'), envTemplate);
  console.log('📝 Environment template saved to .env.blockchain');

  // Display summary
  console.log('\n🎉 Deployment completed successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 DEPLOYMENT SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌐 Network:', hre.network.name);
  console.log('🔗 Chain ID:', (await ethers.provider.getNetwork()).chainId);
  console.log('📍 Contract Address:', fuseToken.address);
  console.log('👤 Deployer:', deployer.address);
  console.log('⛽ Gas Used:', deploymentInfo.gasUsed);
  console.log('🔍 Block Explorer:', getBlockExplorerUrl(fuseToken.address));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Next steps
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Add contract address to .env.local');
  console.log('2. Update frontend configuration');
  console.log('3. Test token minting functionality');
  console.log('4. Configure backend service permissions');
  console.log('5. Set up monitoring and alerts');

  return {
    fuseToken: fuseToken.address,
    deployer: deployer.address,
    network: hre.network.name,
  };
}

function getBlockExplorerUrl(address) {
  const network = hre.network.name;
  switch (network) {
    case 'base':
      return `https://basescan.org/address/${address}`;
    case 'base-sepolia':
      return `https://sepolia.basescan.org/address/${address}`;
    default:
      return `https://etherscan.io/address/${address}`;
  }
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
