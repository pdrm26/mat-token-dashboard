"use client";

import { ethers } from "ethers";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const abi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

function TransferForm({
  onTransfer,
}: {
  onTransfer: (to: string, amount: string) => void;
}) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-blue-700">Transfer Tokens</h2>
      <input
        type="text"
        placeholder="Recipient address"
        className="w-full px-4 py-2 border rounded-md focus:ring-2 ring-blue-400 transition text-gray-700"
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />
      <input
        type="text"
        placeholder="Amount (e.g. 10)"
        className="w-full px-4 py-2 border rounded-md focus:ring-2 ring-blue-400 transition text-gray-700"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button
        onClick={() => onTransfer(to, amount)}
        className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition"
      >
        Send
      </button>
    </div>
  );
}

export default function Home() {
  const [wallet, setWallet] = useState("");
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [token, setToken] = useState<ethers.Contract | null>(null);
  const [balance, setBalance] = useState("0");
  const [symbol, setSymbol] = useState("");
  const [totalSupply, setTotalSupply] = useState("");

  useEffect(() => {
    if (provider && wallet && token) {
      updateBalance();

      token.on("Transfer", (from, to) => {
        if (from === wallet || to === wallet) {
          updateBalance();
        }
      });

      return () => token.removeAllListeners();
    }
  }, [token, wallet]);

  function disconnect() {
    setWallet("");
    setProvider(null);
    setToken(null);
    setBalance("0");
    setSymbol("");
    setTotalSupply("");
  }

  async function connect() {
    if (!window.ethereum) return alert("Install MetaMask first");

    const _provider = new ethers.BrowserProvider(window.ethereum);
    await _provider.send("eth_requestAccounts", []);
    const signer = await _provider.getSigner();
    const _wallet = await signer.getAddress();

    const _token = new ethers.Contract(
      process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "0x99f101719FF87959e202a720e559ed39760B2c54",
      abi,
      signer
    );
    const _symbol = await _token.symbol();
    const _supply = await _token.totalSupply();

    setProvider(_provider);
    setWallet(_wallet);
    setToken(_token);
    setSymbol(_symbol);
    setTotalSupply(ethers.formatUnits(_supply, 18));
  }

  async function updateBalance() {
    if (token && wallet) {
      const bal = await token.balanceOf(wallet);
      setBalance(ethers.formatUnits(bal, 18));
    }
  }

  async function transfer(to: string, amount: string) {
    if (!token || !wallet) return;
    try {
      const tx = await token.transfer(to, ethers.parseUnits(amount, 18));
      const id = toast.loading("Waiting for confirmation...");
      await tx.wait();
      toast.success(`Sent ${amount} ${symbol}`, { id });
      updateBalance();
    } catch (err: any) {
      toast.error("Transfer failed: " + (err.message || "Unknown error"));
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-100 to-blue-50 px-6 py-12">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-10 space-y-6 border border-blue-100">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-blue-700">MAT Token Dashboard</h1>
          <p className="text-sm text-gray-500">Manage and transfer your tokens with ease</p>
        </header>

        <div className="flex justify-center">
          <button
            onClick={connect}
            disabled={!!wallet}
            className={`px-6 py-2 font-medium rounded-md transition ${
              wallet
                ? "bg-gray-200 text-gray-500 cursor-default"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {wallet
              ? `Connected: ${wallet.slice(0, 6)}...${wallet.slice(-4)}`
              : "Connect Wallet"}
          </button>
        </div>

        {wallet && (
          <>
            <div className="flex justify-end">
              <button
                onClick={disconnect}
                className="text-sm text-red-500 hover:underline"
              >
                Disconnect Wallet
              </button>
            </div>

            <div className="bg-blue-50 rounded-md p-6 space-y-2 text-gray-700 border border-blue-100">
              <p>💼 Address: <span className="font-mono">{wallet}</span></p>
              <p>📦 Token: <strong>{symbol}</strong></p>
              <p>💰 Balance: <strong>{balance}</strong> {symbol}</p>
              <p>🧾 Total Supply: <strong>{totalSupply}</strong> {symbol}</p>
            </div>

            <TransferForm onTransfer={transfer} />
          </>
        )}

        <footer className="text-center text-xs text-gray-400 pt-4">
          &copy; {new Date().getFullYear()} MAT Token Dashboard
        </footer>
      </div>
    </main>
  );
}
