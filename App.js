import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, ScrollView } from "react-native";

import MinerEngine from "./src/MinerEngine";
import Wallet from "./src/Wallet";
import FullNodeAPI from "./src/FullNodeAPI";
import PriceOracle from "./src/PriceOracle";
import MiningRewards from "./src/MiningRewards";

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [price, setPrice] = useState(0);
  const [mining, setMining] = useState(false);
  const [hashrate, setHashrate] = useState(0);
  const [rewards, setRewards] = useState(0);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    async function init() {
      const w = await Wallet.loadOrCreate();
      setWallet(w);

      const p = await PriceOracle.getPrice();
      setPrice(p);

      const b = await FullNodeAPI.getBalance(w.address);
      setBalance(b);

      const r = await MiningRewards.getRewards();
      setRewards(r);
    }
    init();
  }, []);

  async function startMining() {
    if (!wallet) return;

    setMining(true);

    MinerEngine.start(wallet.address, async (stats) => {
      setHashrate(stats.hashrate);

      if (stats.blockMined) {
        await MiningRewards.addReward(stats.reward);
        setRewards(await MiningRewards.getRewards());
      }
    });
  }

  function stopMining() {
    MinerEngine.stop();
    setMining(false);
    setHashrate(0);
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>GYDS Mobile Miner</Text>

      {wallet && (
        <>
          <Text style={styles.label}>Wallet Address:</Text>
          <Text style={styles.value}>{wallet.address}</Text>
        </>
      )}

      <Text style={styles.label}>GYDS Live Price:</Text>
      <Text style={styles.value}>${price}</Text>

      <Text style={styles.label}>Balance:</Text>
      <Text style={styles.value}>{balance} GYDS</Text>

      <Text style={styles.label}>Total Mining Rewards:</Text>
      <Text style={styles.value}>{rewards} GYDS</Text>

      <Text style={styles.label}>Hashrate:</Text>
      <Text style={styles.value}>{hashrate} H/s</Text>

      {mining ? (
        <Button title="Stop Mining" onPress={stopMining} color="red" />
      ) : (
        <Button title="Start Mining" onPress={startMining} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, marginTop: 40 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 16, marginTop: 10, fontWeight: "bold" },
  value: { fontSize: 16, marginBottom: 5 }
});
