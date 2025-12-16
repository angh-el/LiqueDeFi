# 🌊 LiqueDeFi
Cross-chain stablecoin smart routing and non-custodial liquidity management

LiqueDeFi is an intelligent cross chain routing layer for stable coins. It automatically find the cheapest, fastest and safest path to move USDC or EURC across blockchains. Instead of users manually comparing bridges, gas fees, and liquidy, **LiqueDeFi does the thinking for you**.

---

## 🚨 The Problem

Cross-chain stablecoin transfers today are:
* ❌ **Expensive** — high gas + bridge fees
* ❌ **Confusing** — dozens of bridges, each with different trade offs
* ❌ **Risky** — wrapped assets, bridge liquidity risk
* ❌ **Manual** — users guess instead of optimising

---

## ✅ The Solution

LiqueDeFi acts as a **route optimiser** for stablecoins:

* Automatically compares **CCTP vs Bridge Kit** routes
* Considers **direct and multi-hop paths**
* Optimises for **total cost, speed, and reliability**
* Executes transfers with **minimal user interaction**

Users sign the transactions and LiqueDeFi chooses the best route.

---

## 🖼️ Screenshots

### Connect Wallet & Transfer
<img width="512" height="480" alt="image" src="https://github.com/user-attachments/assets/5f2cb5ea-16d5-43c5-8cca-032fb6829b28" />

### Optimal Route Calculation
<img width="512" height="480" alt="image" src="https://github.com/user-attachments/assets/7441c190-cab6-41f9-86fc-02b6a64a9c78" />


---

## 🧠 How Routing Decisions Are Made

LiqueDeFi evaluates **all viable routes** and scores them.

### Step 1 — Discover Possible Routes

For a given transfer, LiqueDeFi generates candidates such as:

* **Direct CCTP** (if both chains support it)
* **Direct Bridge Kit** (single hop)
* **Multi-hop routes** (e.g. Ethereum → Base → Arbitrum)

Each route is treated as a graph path.

---

### Step 2 — Cost Estimation

For every candidate route, LiqueDeFi estimates:

* ⛽ **Gas cost** on each chain involved
* 🌉 **Protocol fees** (CCTP or Bridge Kit)
* 🔁 **Number of transactions** required

**Total Cost Formula:**

```
Total Cost = Σ (Gas Fees per hop) + Σ (Bridge / Protocol Fees)
```

Multi-hop routes are only kept if they are **cheaper than direct routes**.

---

### Step 3 — Speed Estimation

Each route is assigned an estimated completion time based on:

* Expected block confirmations
* CCTP attestation delay (if applicable)
* Bridge finality guarantees

Slower routes are penalised but not discarded if they are *significantly cheaper*.

---

### Step 4 — Reliability & Safety Checks

Routes are filtered using:

* ✅ Sufficient liquidity
* ✅ Protocol availability
* ✅ Native vs wrapped asset preference

**CCTP is preferred whenever possible** because it:

* Uses native USDC (burn → mint)
* Requires no bridge liquidity
* Minimises smart contract risk

---

### Step 5 — Route Scoring & Selection

Each route receives a score:

```
Score = (Cost Weight × Cost) + (Speed Weight × Time) + (Risk Penalty)
```

The route with the **lowest score wins**.

---

## 🔀 When LiqueDeFi Uses CCTP vs Bridge Kit

| Scenario                           | Selected Method           | Reason                 |
| ---------------------------------- | ------------------------- | ---------------------- |
| USDC, both chains support CCTP     | **CCTP**                  | Cheapest & native USDC |
| USDC, destination not CCTP-enabled | **Bridge Kit**            | Wider chain support    |
| EURC transfer                      | **Bridge Kit**            | CCTP is USDC-only      |
| Multi-hop cheaper than direct      | **Bridge Kit + CCTP mix** | Lower total cost       |

---

## 🔐 Security & Design Philosophy

* Non-custodial — users always control funds
* No wrapped assets when CCTP is available
* Minimal approvals
* Relies on Circle's infrastructure



## ▶️ How to Run (Local)

### Prerequisites

* Node.js 18+
* MetaMask
* Testnet USDC

### 1. Clone the Repo

```bash
git clone https://github.com/angh-el/LiqueDeFi.git
cd LiqueDeFi
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Update the `.env` file:

```env
CIRCLE_API_KEY=circle_api_key
PRIVATE_KEY=wallet_private_key
```

### 4. Run the App

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---



