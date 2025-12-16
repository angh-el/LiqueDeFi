const { ethers } = require('ethers');

class CCTPService {
  constructor(sourceChainConfig, destChainConfig, privateKey) {
    this.sourceProvider = new ethers.JsonRpcProvider(sourceChainConfig.rpc);
    this.destProvider = new ethers.JsonRpcProvider(destChainConfig.rpc);
    this.wallet = new ethers.Wallet(privateKey, this.sourceProvider);
    this.sourceChain = sourceChainConfig;
    this.destChain = destChainConfig;
  }

  async depositForBurn(amount, destinationAddress) {
    const usdcABI = [
      "function approve(address spender, uint256 amount) public returns (bool)",
      "function balanceOf(address owner) view returns (uint256)"
    ];

    const messengerABI = [
      "function depositForBurn(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken) external returns (uint64)"
    ];

    const usdcContract = new ethers.Contract(
      this.sourceChain.usdcAddress,
      usdcABI,
      this.wallet
    );

    const messengerContract = new ethers.Contract(
      this.sourceChain.circleMessageTransmitter,
      messengerABI,
      this.wallet
    );

    // approve
    const amountInWei = ethers.parseUnits(amount.toString(), 6); // USDC has 6 decimals
    const approveTx = await usdcContract.approve(
      this.sourceChain.circleMessageTransmitter,
      amountInWei
    );
    await approveTx.wait();

    // convert to bytes32
    const mintRecipient = ethers.zeroPadValue(destinationAddress, 32);

    //deposit for burn
    const burnTx = await messengerContract.depositForBurn(
      amountInWei,
      this.destChain.domainId,
      this.sourceChain.usdcAddress
    );

    const receipt = await burnTx.wait();
    return receipt.hash;
  }

  async getAttestation(messageHash) {
    // poll Circle attestation service
    const attestationUrl = `https://iris-api-sandbox.circle.com/attestations/${messageHash}`;
    
    for (let i = 0; i < 30; i++) {
      try {
        const response = await fetch(attestationUrl);
        const data = await response.json();
        
        if (data.status === 'complete') {
          return data.attestation;
        }
      } catch (error) {
        console.error('Attestation check error:', error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10s
    }
    
    throw new Error('Attestation timeout');
  }

  async receiveMessage(message, attestation) {
    const receiverABI = [
      "function receiveMessage(bytes message, bytes attestation) external returns (bool)"
    ];

    const receiverContract = new ethers.Contract(
      this.destChain.circleMessageTransmitter,
      receiverABI,
      new ethers.Wallet(this.wallet.privateKey, this.destProvider)
    );

    const tx = await receiverContract.receiveMessage(message, attestation);
    await tx.wait();
    return tx.hash;
  }
}

module.exports = CCTPService;