
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader, ArrowRight, Wallet, Send } from 'lucide-react';

// Simulated MetaMask connection (in production, use ethers.js or web3.js)
const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState({ USDC: '0', EURC: '0' });

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const chain = await window.ethereum.request({ method: 'eth_chainId' });
        setAccount(accounts[0]);
        setChainId(chain);
        // Simulate balance fetch
        setBalance({ USDC: '1000.50', EURC: '500.25' });
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  return { account, chainId, balance, connectWallet };
};

const LiqueDeFi = () => {
  const { account, chainId, balance, connectWallet } = useWallet();
  const [token, setToken] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');
  const [optimalRoute, setOptimalRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState(null);
  const [history, setHistory] = useState([]);

  const chains = {
    '0xaa36a7': 'Ethereum Sepolia',
    '0x5afe': 'Arc Testnet'
  };

  const getOptimalRoute = async () => {
    if (!amount || !destination) {
      alert('Please enter amount and destination address');
      return;
    }

    setLoading(true);
    try {
      // Call backend API
      const response = await fetch('http://localhost:3001/api/route/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceWallet: account,
          token,
          amount,
          destinationWallet: destination,
          sourceChain: chainId
        })
      });
      
      const data = await response.json();
      setOptimalRoute(data);
    } catch (error) {
      console.error('Error fetching route:', error);
      alert('Failed to get optimal route');
    } finally {
      setLoading(false);
    }
  };

  const executeTransfer = async () => {
    if (!optimalRoute) return;

    setLoading(true);
    setTxStatus('pending');

    try {
      // Call backend to initiate transfer
      const response = await fetch('http://localhost:3001/api/transfer/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceWallet: account,
          token,
          amount,
          destinationWallet: destination,
          route: optimalRoute
        })
      });

      const data = await response.json();

      if (data.success) {
        setTxStatus('success');
        setHistory([...history, {
          token,
          amount,
          from: chains[chainId],
          to: optimalRoute.destinationChain,
          status: 'completed',
          timestamp: new Date().toISOString(),
          txHash: data.txHash
        }]);
        
        // Reset form
        setTimeout(() => {
          setAmount('');
          setDestination('');
          setOptimalRoute(null);
          setTxStatus(null);
        }, 3000);
      } else {
        setTxStatus('failed');
      }
    } catch (error) {
      console.error('Transfer error:', error);
      setTxStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-indigo-600">LiqueDeFi</h1>
              <p className="text-gray-600">Cross-Chain Transfer Protocol</p>
            </div>
            
            {!account ? (
              <button
                onClick={connectWallet}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Wallet size={20} />
                Connect Wallet
              </button>
            ) : (
              <div className="text-right">
                <div className="text-sm text-gray-600">Connected</div>
                <div className="font-mono text-sm">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </div>
                <div className="text-xs text-gray-500">
                  {chains[chainId] || 'Unknown Chain'}
                </div>
              </div>
            )}
          </div>

          {account && (
            <div className="mt-4 flex gap-4">
              <div className="bg-blue-50 rounded-lg p-3 flex-1">
                <div className="text-sm text-gray-600">USDC Balance</div>
                <div className="text-xl font-bold text-blue-600">{balance.USDC}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 flex-1">
                <div className="text-sm text-gray-600">EURC Balance</div>
                <div className="text-xl font-bold text-purple-600">{balance.EURC}</div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transfer Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Transfer</h2>

            {!account ? (
              <div className="text-center py-12 text-gray-500">
                Please connect your wallet to continue
              </div>
            ) : (
              <div className="space-y-4">
                {/* Token Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Token
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setToken('USDC')}
                      className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                        token === 'USDC'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      USDC
                    </button>
                    <button
                      onClick={() => setToken('EURC')}
                      className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                        token === 'EURC'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      EURC
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination Wallet Address
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Get Route Button */}
                {!optimalRoute && (
                  <button
                    onClick={getOptimalRoute}
                    disabled={loading || !amount || !destination}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Calculating...' : 'Get Optimal Route'}
                  </button>
                )}

                {/* Optimal Route Display */}
                {optimalRoute && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2 text-green-700 font-medium">
                      <CheckCircle size={20} />
                      Optimal Route Found
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-gray-600">Method</div>
                        <div className="font-medium">{optimalRoute.method}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Destination Chain</div>
                        <div className="font-medium">{optimalRoute.destinationChain}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Estimated Fee</div>
                        <div className="font-medium">{optimalRoute.estimatedFee}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Est. Time</div>
                        <div className="font-medium">{optimalRoute.estimatedTime}</div>
                      </div>
                    </div>

                    <button
                      onClick={executeTransfer}
                      disabled={loading}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 flex items-center justify-center gap-2 transition-colors"
                    >
                      {loading ? (
                        <>
                          <Loader className="animate-spin" size={20} />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          Execute Transfer
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Transaction Status */}
                {txStatus && (
                  <div className={`rounded-lg p-4 ${
                    txStatus === 'pending' ? 'bg-yellow-50 border border-yellow-200' :
                    txStatus === 'success' ? 'bg-green-50 border border-green-200' :
                    'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      {txStatus === 'pending' && (
                        <>
                          <Loader className="animate-spin text-yellow-600" size={20} />
                          <span className="text-yellow-700">Transaction pending...</span>
                        </>
                      )}
                      {txStatus === 'success' && (
                        <>
                          <CheckCircle className="text-green-600" size={20} />
                          <span className="text-green-700">Transfer completed successfully!</span>
                        </>
                      )}
                      {txStatus === 'failed' && (
                        <>
                          <AlertCircle className="text-red-600" size={20} />
                          <span className="text-red-700">Transfer failed. Please try again.</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Transfers</h2>
            
            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No transfers yet
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((tx, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">
                        {tx.amount} {tx.token}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        tx.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>{tx.from}</span>
                      <ArrowRight size={12} />
                      <span>{tx.to}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(tx.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiqueDeFi;















