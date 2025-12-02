import FullNodeAPI from './FullNodeAPI';

class Transactions {
  static async send(amount, toAddress, wallet) {
    if (!wallet) return null;

    const tx = {
      from: wallet.address,
      to: toAddress,
      amount,
      nonce: wallet.getNextNonce(),
      timestamp: Date.now(),
      signature: wallet.sign(amount + toAddress)
    };

    try {
      const res = await FullNodeAPI.sendTransaction(tx);
      return res;
    } catch (err) {
      console.log("Transaction error:", err.message);
      return null;
    }
  }

  static async getBalance(wallet) {
    if (!wallet) return 0;
    try {
      const balance = await FullNodeAPI.getBalance(wallet.address);
      return balance;
    } catch (err) {
      console.log("Error getting balance:", err.message);
      return 0;
    }
  }
}

export default Transactions;
