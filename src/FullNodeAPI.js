import axios from 'axios';

const FULLNODE_URL = 'http://YOUR_FULL_NODE_IP:5000'; // replace with your full node IP

class FullNodeAPI {
  static async getMiningTemplate() {
    try {
      const res = await axios.get(`${FULLNODE_URL}/getminingtemplate`);
      return res.data;
    } catch (err) {
      console.log("Error fetching mining template:", err.message);
      return {};
    }
  }

  static async submitBlock(block) {
    try {
      const res = await axios.post(`${FULLNODE_URL}/submitblock`, block);
      return res.data;
    } catch (err) {
      console.log("Error submitting block:", err.message);
      return null;
    }
  }

  static async getBalance(address) {
    try {
      const res = await axios.get(`${FULLNODE_URL}/balance/${address}`);
      return res.data.balance || 0;
    } catch (err) {
      console.log("Error fetching balance:", err.message);
      return 0;
    }
  }

  static async sendTransaction(tx) {
    try {
      const res = await axios.post(`${FULLNODE_URL}/transaction`, tx);
      return res.data;
    } catch (err) {
      console.log("Error sending transaction:", err.message);
      return null;
    }
  }
}

export default FullNodeAPI;
