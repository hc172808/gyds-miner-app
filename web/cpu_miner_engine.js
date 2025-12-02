class Wallet {
  constructor() {
    this.address = localStorage.getItem('gyds_wallet') || this.generateAddress();
    localStorage.setItem('gyds_wallet', this.address);
  }

  generateAddress() {
    return Math.random().toString(36).substr(2, 40);
  }

  sign(message) {
    return btoa(this.address + message);
  }
}

class MinerEngine {
  constructor(minerAddress) {
    this.minerAddress = minerAddress;
    this.running = false;
    this.difficulty = 2;
    this.blockTarget = 120;
  }

  async getTemplate() {
    try {
      const res = await fetch('http://YOUR_FULL_NODE_IP:5000/getminingtemplate');
      return await res.json();
    } catch {
      return { difficulty: this.difficulty, pendingTx: [] };
    }
  }

  async getPrice() {
    try {
      const res = await fetch('http://YOUR_PRICE_ORACLE:6000/price/GYDS');
      const data = await res.json();
      return data.price || 0.00001;
    } catch {
      return 0.00001;
    }
  }

  async getBalance() {
    try {
      const res = await fetch(`http://YOUR_FULL_NODE_IP:5000/balance/${this.minerAddress}`);
      const data = await res.json();
      return data.balance || 0;
    } catch {
      return 0;
    }
  }

  async submitBlock(block) {
    try {
      await fetch('http://YOUR_FULL_NODE_IP:5000/submitblock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(block)
      });
    } catch (err) {
      console.log("Error submitting block:", err.message);
    }
  }

  async start(callback) {
    this.running = true;
    while (this.running) {
      const template = await this.getTemplate();
      template.miner = this.minerAddress;

      let nonce = 0;
      let blockMined = false;

      while (!blockMined && this.running) {
        template.nonce = nonce++;
        template.price = await this.getPrice();
        const hash = sha256(JSON.stringify(template));

        if (hash.startsWith('0'.repeat(template.difficulty || this.difficulty))) {
          blockMined = true;
          await this.submitBlock(template);
          callback({ hash, reward: template.pendingTx?.find(tx => tx.from === "COINBASE")?.amount || 0 });
          break;
        }

        if (nonce % 100 === 0) await new Promise(r => setTimeout(r, 5));
      }
    }
  }

  stop() {
    this.running = false;
  }
}

// Simple SHA256 implementation for browser
function sha256(message) {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(message))
    .then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join(''))
    .catch(() => '0');
}
