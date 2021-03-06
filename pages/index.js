import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { createClient } from "urql";

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [correctNetwork, setCorrectNetwork] = useState(false);
  const [cDaiBalance, setcDaiBalance] = useState(null);
  const [daiAmount, setdaiAmount] = useState("");
  const [graphDataMint, setGraphDataMint] = useState("");
  const [graphDataRedeem, setGraphDataRedeem] = useState("");
  const abi = require("./cTokenAbi.json");
  const erc20Abi = require("./erc20Abi.json");
  const cTokenAddress = "0xF0d0EB522cfa50B716B3b1604C4F0fA6f04376AD";
  const underlayingContractAddress =
    "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa";
  const { Contract } = require("ethers");

  const assetName = "DAI"; // for the log output lines
  const underlyingDecimals = 18; // Number of decimals defined in this ERC20 token's contract

  const options = {
    address: currentAccount, // your (target) address
    provider: ethers.getDefaultProvider("kovan"), // network = mainnet/testnet/etc (you can omit network if your target is mainnet)
  };
  const APIURL =
    "https://api.thegraph.com/subgraphs/name/juanigallo/cdai-kovan-subgraph";

  const getGraphData = async () => {
    const tokensQuery = `
    query {
      
      mintEntities(where:{address:"${currentAccount}"}) {
        id
        address
        amount
        tokens
      }
      redeemEntities(where:{address:"${currentAccount}"}) {
        id
        address
        amount
        tokens
      }
      
    }`;
    const client = createClient({
      url: APIURL,
    });

    const { data } = await client.query(tokensQuery).toPromise();
    if (data.mintEntities.length > 0) {
      setGraphDataMint(data.mintEntities);
    }
    if (data.redeemEntities.length > 0) {
      setGraphDataRedeem(data.redeemEntities);
      console.log("holas");
    }
  };

  const getBalance = async () => {
    const contract = new Contract(cTokenAddress, abi, options.provider);
    const balance = await contract.callStatic.balanceOfUnderlying(
      currentAccount
    );
    setcDaiBalance(balance.toString());
  };

  const depositDAI = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = provider.getSigner();
    const underlyingContract = new Contract(
      underlayingContractAddress,
      erc20Abi,
      signer
    );
    const cTokenContract = new Contract(cTokenAddress, abi, signer);
    const underlyingTokensToSupply =
      daiAmount * Math.pow(10, underlyingDecimals);
    let tx = await underlyingContract.approve(
      cTokenAddress,
      underlyingTokensToSupply.toString()
    );
    await tx.wait(1); // wait until the transaction has 1 confirmation on the blockchain

    console.log(`${assetName} contract "Approve" operation successful.`);
    console.log(`Supplying ${assetName} to the Compound Protocol...`, "\n");

    // Mint cTokens by supplying underlying tokens to the Compound Protocol
    tx = await cTokenContract.mint(underlyingTokensToSupply.toString());
    await tx.wait(1); // wait until the transaction has 1 confirmation on the blockchain
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
        <button className="button-54" onClick={getBalance}>
          GET cDAI Balance
        </button>
        <h3 className=" ">{cDaiBalance / Math.pow(10, underlyingDecimals)}</h3>
        <input
          className="inputs"
          maxlength="5"
          onKeyPress={(event) => {
            if (!/[0-9]/.test(event.key)) {
              event.preventDefault();
            }
          }}
          onInput={(e) => setdaiAmount(e.target.value)}
        />
        <button className="button-54" onClick={depositDAI}>
          deposit DAI
        </button>
        <button className="button-54" onClick={getGraphData}>
          GET graphData
        </button>
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
        {graphDataMint ? (
          <div className="tables">
            <div>
              DAI Deposits History
              <tr>
                <th>DAI AMOUNT</th>
                <th>Tokens AMOUNT</th>
              </tr>
              {graphDataMint.map((entiti) => (
                <tr style={{ color: "green" }}>
                  <th>{entiti.amount / Math.pow(10, underlyingDecimals)}</th>
                  <th>{entiti.tokens}</th>
                </tr>
              ))}{" "}
            </div>
          </div>
        ) : (
          <div></div>
        )}
        {graphDataRedeem ? (
          <div className="tables">
            <div>
              DAI Withdraws History
              {graphDataRedeem.map((entiti) => (
                <tr style={{ color: "red" }}>
                  <th>{entiti.amount / Math.pow(10, underlyingDecimals)}</th>
                  <th>{entiti.tokens}</th>
                </tr>
              ))}{" "}
            </div>
          </div>
        ) : (
          <div></div>
        )}
      </main>
      <footer className={styles.footer}>viva peron</footer>
    </div>
  );
}
