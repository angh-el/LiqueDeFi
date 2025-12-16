class BridgeKitService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.circle.com/v2/bridge';
  }

  async initiateTransfer(sourceChain, destChain, token, amount, fromAddress, toAddress) {
    const response = await fetch(`${this.baseUrl}/transfers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sourceChain,
        destinationChain: destChain,
        token,
        amount,
        fromAddress,
        toAddress
      })
    });

    const data = await response.json();
    return data;
  }

  async getTransferStatus(transferId) {
    const response = await fetch(`${this.baseUrl}/transfers/${transferId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    const data = await response.json();
    return data;
  }
}

module.exports = BridgeKitService;