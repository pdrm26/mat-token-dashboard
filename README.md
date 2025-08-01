# 🪙 Web3 Token Dashboard

A simple and modern Web3 DApp to connect MetaMask, check your token balance, send tokens, and listen for live transfers — built with **Next.js 14**, **TailwindCSS**, and **ethers.js v6**.

---

## ✨ Features

- 🔐 Connect / disconnect MetaMask wallet  
- 💰 View your ERC-20 token balance (MAT token)  
- 📤 Transfer tokens to another wallet  
- 📡 Listen for real-time `Transfer` events  
- 🔔 Clean UI with loading and toast notifications

---

## 🛠️ Tech Stack

- [Next.js 14 (App Router)](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [ethers.js v6](https://docs.ethers.org/v6/)
- [react-hot-toast](https://react-hot-toast.com/)
- [MetaMask](https://metamask.io/)
- [Infura (Sepolia Testnet)](https://www.infura.io/)

---

## 🧪 Environment Variables

Create a `.env.local` file in the root directory and add the following:

```env
NEXT_PUBLIC_TOKEN_ADDRESS=your_deployed_token_contract_address
