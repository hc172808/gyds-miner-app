import axios from 'axios';

const ORACLE_URL = 'http://YOUR_PRICE_ORACLE_IP:6000'; // replace with your price oracle URL

class PriceOracle {
  static async getPrice(symbol = 'GYDS') {
    try {
      const res = await axios.get(`${ORACLE_URL}/price/${symbol}`);
      return res.data.price || 0.00001;
    } catch (err) {
      console.log("Error fetching price:", err.message);
      return 0.00001;
    }
  }
}

export default PriceOracle;
