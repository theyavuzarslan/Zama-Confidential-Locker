# Zama Confidential Locker

![Zama Confidential Locker Banner](assets/banner.png)

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.19-yellow?style=for-the-badge&logo=hardhat)](https://hardhat.org/)
[![Zama](https://img.shields.io/badge/Powered%20By-Zama%20FHE-orange?style=for-the-badge)](https://zama.ai/)

</div>

## 📖 Overview

**Zama Confidential Locker** is a privacy-preserving DeFi application built on the **Zama Devnet**. It leverages **Fully Homomorphic Encryption (FHE)** to enable confidential token locking and vesting.

Unlike traditional lockers where amounts and unlock times are public, Zama Confidential Locker ensures that sensitive financial data remains encrypted on-chain, visible only to the owner and authorized parties.

## 🏗️ Architecture

### Confidential Deposit Flow

```mermaid
%%{init: {'theme':'dark', 'themeVariables': { 'primaryColor':'#00c2ff', 'primaryTextColor':'#fff', 'primaryBorderColor':'#00a7d7', 'lineColor':'#00c2ff', 'secondaryColor':'#ff6b6b', 'tertiaryColor':'#3700b3', 'background':'#111', 'mainBkg':'#1b1b1b', 'secondBkg':'#242424', 'labelBackground':'#242424', 'labelTextColor':'#fff', 'actorBkg':'#2f2f2f', 'actorBorder':'#00c2ff', 'actorTextColor':'#fff', 'signalColor':'#00c2ff', 'signalTextColor':'#fff'}}}%%
sequenceDiagram
    participant User as User
    participant Frontend as Frontend
    participant FHE as Zama FHEVM
    participant Contract as ConfidentialLocker
    participant Registry as ComplianceRegistry

    rect rgb(30,60,80)
        Note over User,Contract: PHASE 1 · Encryption & Deposit
        User->>Frontend: Input Amount, Time, KPI
        Frontend->>FHE: Encrypt(Amount, Time, KPI)
        FHE-->>Frontend: Encrypted Handles + Proofs
        Frontend->>Contract: lock(encryptedArgs, proofs)
    end

    rect rgb(50,80,60)
        Note over Contract,Registry: PHASE 2 · Verification & Storage
        Contract->>Registry: isAllowed(User)
        Registry-->>Contract: true
        Contract->>FHE: Verify Proofs
        Contract->>Contract: Store Encrypted Lock
        Contract-->>User: Mint LockerPass NFT
    end
```

### Conditional Withdrawal Flow

```mermaid
%%{init: {'theme':'dark', 'themeVariables': { 'primaryColor':'#a855f7', 'primaryTextColor':'#fff', 'primaryBorderColor':'#9333ea', 'lineColor':'#a855f7', 'secondaryColor':'#3b82f6', 'tertiaryColor':'#10b981', 'background':'#111', 'mainBkg':'#1b1b1b', 'secondBkg':'#242424', 'labelBackground':'#242424', 'labelTextColor':'#fff', 'actorBkg':'#2f2f2f', 'actorBorder':'#a855f7', 'actorTextColor':'#fff', 'signalColor':'#a855f7', 'signalTextColor':'#fff'}}}%%
sequenceDiagram
    participant User as User
    participant Contract as ConfidentialLocker
    participant FHE as Zama FHEVM
    participant Token as ERC20 Token

    rect rgb(30,50,90)
        Note over User,Contract: STAGE 1 · Request Withdrawal
        User->>Contract: withdraw(lockId, currentKPI)
    end

    rect rgb(40,80,60)
        Note over Contract,FHE: STAGE 2 · Encrypted Logic
        Contract->>FHE: Check Time (unlockTime <= now)
        Contract->>FHE: Check KPI (targetKPI <= currentKPI)
        Contract->>FHE: AND(TimeCondition, KPICondition)
        Contract->>FHE: Select(isUnlocked, Amount, 0)
        FHE-->>Contract: Encrypted Amount to Send
    end

    rect rgb(80,60,40)
        Note over Contract,Token: STAGE 3 · Execution
        Contract->>Token: transfer(User, AmountToSend)
        Note right of Token: Only transfers if conditions met
        Contract-->>User: Emit LockWithdrawn
    end
```

## ✨ Key Features

-   **🔒 Confidential Deposits**: Lock tokens without revealing the amount to the public.
-   **⏱️ Encrypted Vesting**: Unlock times are encrypted, preventing front-running and speculation based on unlock schedules.
-   **🛡️ Compliance Integration**: Built-in compliance registry to ensure only authorized users can participate.
-   **⚡ FHE Powered**: Utilizes `fhevm` for on-chain computation over encrypted data.

## 🛠️ Tech Stack

-   **Frontend**: Next.js, Tailwind CSS, `fhevmjs`, `wagmi`
-   **Smart Contracts**: Solidity, `fhevm` library
-   **Development Environment**: Hardhat, Zama Devnet

## 🚀 Deployed Contracts

| Contract | Address | Network |
| :--- | :--- | :--- |
| `LockerPass` | *Pending Deployment* | Zama Devnet |
| `ComplianceRegistry` | *Pending Deployment* | Zama Devnet |
| `ConfidentialLocker` | *Pending Deployment* | Zama Devnet |
| `ConfidentialBuyback` | *Pending Deployment* | Zama Devnet |

## 📦 Getting Started

### Prerequisites

-   Node.js >= 20
-   Metamask (or other Web3 wallet)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/compliant-fhe-mixer.git
    cd compliant-fhe-mixer
    ```

2.  Install dependencies:
    ```bash
    npm install
    cd frontend && npm install
    ```

3.  Run the frontend:
    ```bash
    cd frontend
    npm run dev
    ```

## 📜 License

This project is licensed under the MIT License.
