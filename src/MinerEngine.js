import { createHash } from 'crypto';
import FullNodeAPI from './FullNodeAPI';
import PriceOracle from './PriceOracle';

class MinerEngine {
  constructor() {
    this.running = false;
    this.difficulty = 2; // default difficulty
    this.blockTarget = 120; // seconds
    this.hashesPerCycle = 400;
    this.throttle = 10; // milliseconds
  }

  async start(minerAddress, callback) {
    this.running = true;
    while (this.running) {
      try {
        // fetch mining template from full node
        const template = await FullNodeAPI.getMiningTemplate();
        template.miner = minerAddress;

        // update difficulty from template
        if (template.difficulty) this.difficulty = template.difficulty;

        let nonce = 0;
        let blockMined = false;
        const startTime = Date.now();

        while (!blockMined && this.running) {
          template.nonce = nonce++;
          template.price = await PriceOracle.getPrice();

          const hash = createHash('sha256')
            .update(JSON.stringify(template))
            .digest('hex');

          if (hash.startsWith('0'.repeat(this.difficulty))) {
            blockMined = true;

            // submit mined block
            await FullNodeAPI.submitBlock(template);

            callback({
              blockMined: true,
              reward: template.pendingTx?.find(tx => tx.from === "COINBASE")?.amount || 0,
              hashrate: Math.round((nonce / ((Date.now() - startTime) / 1000)))
            });
            break;
          }

          if (nonce % this.hashesPerCycle === 0) {
            await new Promise(r => setTimeout(r, this.throttle));
          }
        }
      } catch (err) {
        console.log("Miner error:", err.message);
      }
    }
  }

  stop() {
    this.running = false;
  }
}

export default new MinerEngine();
