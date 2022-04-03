import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function Home() {
  const [loadingState, setLoadingState] = useState(0);
  const [txError, setTxError] = useState(null);
  const [currentAccount, setCurrentAccount] = useState("");
  const [correctNetwork, setCorrectNetwork] = useState(false);
  const [cDaiBalance, setcDaiBalance] = useState(null);

  const minABI = [
    // balanceOf
    {
      constant: true,
      inputs: [{ name: "_owner", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "balance", type: "uint256" }],
      type: "function",
    },
  ];
  const options = {
    address: "00x59a3A34C45064E92fE540CC8a6a3929d1Db23261", // your (target) address
    provider: ethers.getDefaultProvider("kovan"), // network = mainnet/testnet/etc (you can omit network if your target is mainnet)
  };
  const { Contract } = require("ethers");
  const tokenAddress = "0xF0d0EB522cfa50B716B3b1604C4F0fA6f04376AD";

  const getBalance = async () => {
    const contract = new Contract(tokenAddress, minABI, options.provider);
    const balance = await contract.balanceOf(currentAccount);
    setcDaiBalance(balance.toString());
  };

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (ethereum) {
      console.log("Got the ethereum obejct: ", ethereum);
    } else {
      console.log("No Wallet found. Connect Wallet");
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      console.log("Found authorized Account: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } else {
      console.log("No authorized account found");
    }
  };

  // Calls Metamask to connect wallet on clicking Connect Wallet button
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Metamask not detected");
        return;
      }
      let chainId = await ethereum.request({ method: "eth_chainId" });
      console.log("Connected to chain:" + chainId);

      const kovanChainId = "0x2a";

      if (chainId !== kovanChainId) {
        alert("You are not connected to the Kovan Testnet!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Found account", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log("Error connecting to metamask", error);
    }
  };

  // Checks if wallet is connected to the correct network
  const checkCorrectNetwork = async () => {
    const { ethereum } = window;
    let chainId = await ethereum.request({ method: "eth_chainId" });
    console.log("Connected to chain:" + chainId);

    const kovanChainId = "0x2a";

    if (chainId !== kovanChainId) {
      setCorrectNetwork(false);
    } else {
      setCorrectNetwork(true);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    checkCorrectNetwork();
  }, []);
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        la mejor Dapp del mundo
        <h2 className=" ">CONECT</h2>
        <button className="" onClick={getBalance}>
          GET cDAI Balance
        </button>
        <h3 className=" ">{cDaiBalance}</h3>
        {currentAccount === "" ? (
          <button className="" onClick={connectWallet}>
            Connect Wallet
          </button>
        ) : correctNetwork ? (
          <div> </div>
        ) : (
          <div className="">
            <div>----------------------------------------</div>
            <div>Please connect to the Kovan Testnet</div>
            <div>and reload the page</div>
            <div>----------------------------------------</div>
          </div>
        )}
      </main>
      <footer className={styles.footer}>viva peron</footer>
    </div>
  );
}
