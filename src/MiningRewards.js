import AsyncStorage from '@react-native-async-storage/async-storage';

class MiningRewards {
  static async addReward(reward) {
    try {
      const rewards = JSON.parse(await AsyncStorage.getItem('mining_rewards') || '[]');
      rewards.push({
        reward,
        timestamp: Date.now()
      });
      await AsyncStorage.setItem('mining_rewards', JSON.stringify(rewards));
    } catch (err) {
      console.log("Error adding reward:", err.message);
    }
  }

  static async getRewards() {
    try {
      const rewards = JSON.parse(await AsyncStorage.getItem('mining_rewards') || '[]');
      return rewards.reduce((sum, r) => sum + r.reward, 0);
    } catch (err) {
      console.log("Error getting rewards:", err.message);
      return 0;
    }
  }

  static async getAllRewards() {
    try {
      const rewards = JSON.parse(await AsyncStorage.getItem('mining_rewards') || '[]');
      return rewards;
    } catch (err) {
      console.log("Error getting all rewards:", err.message);
      return [];
    }
  }
}

export default MiningRewards;
