"use client";

import { ethers } from "ethers";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// Application binary interface
const abi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount)  returns (bool)",
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
    <div className="space-y-4 pt-6">
      <h2 className="text-xl font-serif font-semibold text-amber-500 tracking-wide">
        🔁 Transfer Tokens
      </h2>
      <input
        type="text"
        placeholder="Recipient address"
        className="w-full px-4 py-3 rounded-lg border border-amber-400 bg-gradient-to-br from-black/5 to-black/10
                   placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-800 font-semibold transition"
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />
      <input
        type="text"
        placeholder="Amount (e.g. 10)"
        className="w-full px-4 py-3 rounded-lg border border-amber-400 bg-gradient-to-br from-black/5 to-black/10
                   placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-800 font-semibold transition"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button
        className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500
                   text-gray-900 font-bold rounded-lg py-3 shadow-lg hover:brightness-110 transition"
        onClick={() => onTransfer(to, amount)}
      >
        🚀 Send
      </button>
    </div>
  );
}

export default function Home() {
  const [wallet, setWallet] = useState("");
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [token, setToken] = useState<ethers.Contract | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [symbol, setSymbol] = useState<string>("");
  const [totalSupply, setTotalSupply] = useState<string>("");

  useEffect(() => {
    if (provider && wallet && token) {
      updateBalance();

      token.on("Transfer", (from, to, value, event) => {
        if (from === wallet || to === wallet) {
          updateBalance();
          console.log("🔄 Transfer detected");
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
      const id = toast.loading("⏳ Waiting for transaction to confirm...");
      await tx.wait();
      toast.success(`✅ Sent ${amount} ${symbol} tokens!`, { id });
      updateBalance();
    } catch (err) {
      console.error(err);
      toast.error("❌ Transfer failed: " + (err.message ?? "Unknown erro"));
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-tr from-gray-900 via-black to-gray-800 text-amber-50 antialiased font-serif flex items-center justify-center px-6">
      <div className="max-w-3xl w-full bg-gradient-to-br from-black/80 via-gray-900/90 to-black/80 rounded-3xl shadow-2xl p-12 space-y-8 border border-amber-700/70">
        <header className="space-y-2 text-center">
          <h1 className="text-4xl font-extrabold tracking-wider drop-shadow-lg">
            🪙 <span className="text-amber-400">MAT Token Dashboard</span>
          </h1>
          <p className="italic text-amber-300/80 font-medium">
            Manage and transfer your tokens with style
          </p>
        </header>

        <div className="flex justify-center">
          <button
            onClick={connect}
            className={`px-8 py-3 rounded-full font-semibold tracking-wide shadow-md transition
              ${
                wallet
                  ? "bg-amber-600 text-black lowercase cursor-default select-none opacity-90"
                  : "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black hover:brightness-110 cursor-pointer"
              }
            `}
            disabled={!!wallet}
            aria-label="Connect Wallet"
          >
            {wallet
              ? `Connected: ${wallet.slice(0, 6)}...${wallet.slice(-4)}`
              : "🔌 Connect Wallet"}
          </button>
        </div>

        {wallet && (
          <>
            <div className="flex justify-end">
              <button
                onClick={disconnect}
                className="rounded-full bg-red-700 px-5 py-2 font-semibold hover:bg-red-600 transition shadow-lg text-amber-100"
                aria-label="Disconnect Wallet"
              >
                ❌ Disconnect
              </button>
            </div>

            <section className="bg-gradient-to-bl from-amber-900/80 via-amber-800/70 to-amber-900/50 rounded-xl p-8 shadow-lg space-y-6 border border-amber-700/80">
              <div className="space-y-1 font-semibold text-amber-100">
                <p>
                  💼 <span className="font-serif tracking-wide">{wallet}</span>
                </p>
                <p>
                  📦 Token: <span className="text-amber-400">{symbol}</span>
                </p>
                <p>
                  💰 Balance:{" "}
                  <span className="text-yellow-300 font-bold">{balance}</span>{" "}
                  {symbol}
                </p>
                <p>
                  🧾 Total Supply:{" "}
                  <span className="text-yellow-300 font-bold">
                    {totalSupply}
                  </span>{" "}
                  {symbol}
                </p>
              </div>

              <TransferForm onTransfer={transfer} />
            </section>
          </>
        )}
        <footer className="text-center text-sm text-amber-400/60 font-serif pt-4">
          &copy; {new Date().getFullYear()} MAT Token Dashboard — All Rights
          Reserved
        </footer>
      </div>
    </main>
  );
}
