import 'react-native-get-random-values';
import { randomBytes, createHash } from 'crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

class Wallet {
  constructor(seed = null) {
    this.seed = seed || Wallet.generateSeed();
    this.privateKey = Wallet.generatePrivateKey(this.seed);
    this.address = Wallet.generateAddress(this.privateKey);
    this.nonce = 0;
  }

  static generateSeed() {
    // 12-word mnemonic seed (simplified)
    const bytes = randomBytes(16); // 128 bits
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  static generatePrivateKey(seed) {
    return createHash('sha256').update(seed).digest('hex');
  }

  static generateAddress(privateKey) {
    return createHash('ripemd160').update(privateKey).digest('hex');
  }

  sign(message) {
    return createHash('sha256').update(this.privateKey + message).digest('hex');
  }

  async save() {
    try {
      await AsyncStorage.setItem('wallet_seed', this.seed);
      await AsyncStorage.setItem('wallet_nonce', this.nonce.toString());
    } catch (err) {
      console.log("Wallet save error:", err.message);
    }
  }

  async load() {
    try {
      const seed = await AsyncStorage.getItem('wallet_seed');
      const nonceStr = await AsyncStorage.getItem('wallet_nonce');
      if (seed) {
        this.seed = seed;
        this.privateKey = Wallet.generatePrivateKey(seed);
        this.address = Wallet.generateAddress(this.privateKey);
        this.nonce = parseInt(nonceStr || '0', 10);
      }
    } catch (err) {
      console.log("Wallet load error:", err.message);
    }
  }

  getNextNonce() {
    this.nonce++;
    this.save();
    return this.nonce;
  }

  static async loadOrCreate() {
    const wallet = new Wallet();
    await wallet.load();
    await wallet.save();
    return wallet;
  }
}

export default Wallet;
