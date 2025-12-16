const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Chain configurations
const CHAINS = {
  sepolia: {
    id: '0xaa36a7',
    name: 'Ethereum Sepolia',
    rpc: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    usdcAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    circleMessageTransmitter: '0x7865fAfC2db2093669d92c0F33AeEF291086BEFD',
    cctp: true
  },
  arc: {
    id: '0x5afe',
    name: 'Arc Testnet',
    rpc: 'https://arc-testnet-rpc.example.com',
    usdcAddress: '0xArcUSDCAddress',
    circleMessageTransmitter: '0xArcTransmitter',
    cctp: false 
  }
};

const LIQUIDITY_POOLS = {
  sepolia: {
    USDC: 500000,
    EURC: 250000
  },
  arc: {
    USDC: 300000,
    EURC: 150000
  }
};

// Fee structure - simulate for now
const FEES = {
  CCTP: 0.001, // 0.1%
  BridgeKit: 0.002 // 0.2%
};

// ============= ROUTE OPTIMIZATION =============
app.post('/api/route/optimize', async (req, res) => {
  try {
    const { sourceWallet, token, amount, destinationWallet, sourceChain } = req.body;

    // Validate inputs
    if (!ethers.isAddress(sourceWallet) || !ethers.isAddress(destinationWallet)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Determine source and destination chains
    const sourceChainConfig = Object.values(CHAINS).find(c => c.id === sourceChain);
    if (!sourceChainConfig) {
      return res.status(400).json({ error: 'Unsupported source chain' });
    }

    // Calculate optimal route
    const routes = [];

    // Route 1: CCTP (if both chains support it)
    const destChain = sourceChainConfig.name === 'Ethereum Sepolia' ? CHAINS.arc : CHAINS.sepolia;
    
    if (sourceChainConfig.cctp && destChain.cctp && token === 'USDC') {
      const cctpFee = amountNum * FEES.CCTP;
      routes.push({
        method: 'CCTP',
        destinationChain: destChain.name,
        estimatedFee: `${cctpFee.toFixed(4)} ${token}`,
        estimatedTime: '5-10 minutes',
        totalCost: cctpFee,
        liquidity: 'High',
        score: 100 - cctpFee // Higher score is better
      });
    }

    // Route 2: Bridge Kit
    const bridgeFee = amountNum * FEES.BridgeKit;
    routes.push({
      method: 'Bridge Kit',
      destinationChain: destChain.name,
      estimatedFee: `${bridgeFee.toFixed(4)} ${token}`,
      estimatedTime: '10-15 minutes',
      totalCost: bridgeFee,
      liquidity: LIQUIDITY_POOLS[destChain.name.toLowerCase().includes('sepolia') ? 'sepolia' : 'arc'][token] > amountNum * 10 ? 'High' : 'Medium',
      score: 90 - bridgeFee
    });

    // Sort by score (best route first)
    routes.sort((a, b) => b.score - a.score);

    const optimalRoute = routes[0];

    res.json({
      success: true,
      ...optimalRoute,
      alternatives: routes.slice(1)
    });

  } catch (error) {
    console.error('Route optimization error:', error);
    res.status(500).json({ error: 'Failed to calculate optimal route' });
  }
});

// ============= TRANSFER EXECUTION =============
app.post('/api/transfer/execute', async (req, res) => {
  try {
    const { sourceWallet, token, amount, destinationWallet, route } = req.body;

    if (!ethers.isAddress(sourceWallet) || !ethers.isAddress(destinationWallet)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // determine which method to use
    if (route.method === 'CCTP') {
      const result = await executeCCTPTransfer(sourceWallet, destinationWallet, token, amountNum);
      return res.json(result);
    } else if (route.method === 'Bridge Kit') {
      const result = await executeBridgeKitTransfer(sourceWallet, destinationWallet, token, amountNum);
      return res.json(result);
    } else {
      return res.status(400).json({ error: 'Invalid transfer method' });
    }

  } catch (error) {
    console.error('Transfer execution error:', error);
    res.status(500).json({ error: 'Failed to execute transfer' });
  }
});

// ============= CCTP TRANSFER =============
async function executeCCTPTransfer(sourceWallet, destinationWallet, token, amount) {
  try {

    console.log('Executing CCTP transfer:', {
      from: sourceWallet,
      to: destinationWallet,
      token,
      amount
    });

    const txHash = '0x' + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

    return {
      success: true,
      txHash,
      method: 'CCTP',
      estimatedCompletion: Date.now() + 600000, 
      message: 'Transfer initiated via CCTP'
    };

  } catch (error) {
    console.error('CCTP transfer error:', error);
    return { success: false, error: error.message };
  }
}

// ============= BRIDGE KIT TRANSFER =============
async function executeBridgeKitTransfer(sourceWallet, destinationWallet, token, amount) {
  try {

    console.log('Executing Bridge Kit transfer:', {
      from: sourceWallet,
      to: destinationWallet,
      token,
      amount
    });

    const txHash = '0x' + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

    // In production:
    const bridgeKit = new BridgeKit({
      apiKey: process.env.CIRCLE_API_KEY
    });
    // const transfer = await bridgeKit.transfer({...});

    // return {
    //   success: true,
    //   txHash,
    //   method: 'Bridge Kit',
    //   estimatedCompletion: Date.now() + 900000, // 15 minutes
    //   message: 'Transfer initiated via Bridge Kit'
    // };

  } catch (error) {
    console.error('Bridge Kit transfer error:', error);
    return { success: false, error: error.message };
  }
}

app.get('/api/transfer/status/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;


    res.json({
      txHash,
      status: 'completed',
      confirmations: 12,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check status' });
  }
});

app.get('/api/liquidity/:chain/:token', (req, res) => {
  try {
    const { chain, token } = req.params;
    
    const chainKey = chain.toLowerCase().includes('sepolia') ? 'sepolia' : 'arc';
    const liquidity = LIQUIDITY_POOLS[chainKey]?.[token.toUpperCase()];

    if (liquidity === undefined) {
      return res.status(404).json({ error: 'Chain or token not found' });
    }

    res.json({
      chain,
      token,
      liquidity,
      utilizationRate: 0.5
    });

  } catch (error) {
    console.error('Liquidity info error:', error);
    res.status(500).json({ error: 'Failed to fetch liquidity info' });
  }
});

// ============= HEALTH CHECK =============
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});


app.listen(PORT, () => {
  console.log(`LiqueDeFi backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;