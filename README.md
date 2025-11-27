# Confidential Token Management Dashboard

A privacy-preserving token management platform built on **Zama's fhEVM**.

## Overview

The Confidential Token Management Dashboard is a comprehensive DeFi tool that combines privacy-preserving token locking and automated buyback mechanisms. Built using Fully Homomorphic Encryption (FHE), it allows projects to manage their tokenomics while keeping sensitive financial data confidential.

## Features

### 1. Confidential Locker
-   **Time-Based Locks**: Lock tokens until a specific encrypted timestamp.
-   **KPI-Based Unlocks**: Unlock tokens when performance metrics (price, TVL, etc.) reach encrypted targets.
-   **Hybrid Conditions**: Combine time AND KPI requirements for sophisticated vesting schedules.
-   **Privacy**: Lock amounts and unlock conditions remain encrypted on-chain.

### 2. Buyback & TWAP
-   **Automated Buybacks**: Schedule token buybacks based on time intervals or price targets.
-   **TWAP Strategy**: Time-Weighted Average Price buybacks to minimize market impact.
-   **KPI Triggers**: Execute buybacks when specific market conditions are met.
-   **Confidential Treasury**: Buyback amounts and strategies remain private.

### 3. Compliance (Integrated)
-   **Allowlist Registry**: Control who can interact with the platform.
-   **Flexible Enforcement**: Enable/disable compliance checks as needed.

## Architecture

### Smart Contracts

1.  **`ConfidentialLocker.sol`**: Manages encrypted token locks with time and KPI conditions.
2.  **`ConfidentialBuyback.sol`**: Automates buybacks based on encrypted strategies.
3.  **`LockerPass.sol`**: ERC721 NFT representing lock ownership.
4.  **`ComplianceRegistry.sol`**: Manages user allowlist.
5.  **`MockConfidentialERC20.sol`**: FHE-enabled token for testing.
6.  **`MockDEX.sol`**: Simulated DEX for buyback testing.

### Frontend (Planned)
-   **Dashboard UI**: Clean, data-rich interface inspired by Uniswap and Morpho.
-   **Tabs**: Locker, Buyback, Compliance views.
-   **FHE Integration**: Client-side encryption using `fhevmjs`.

## Prerequisites

-   Node.js >= 20
-   Hardhat
-   Zama Devnet access (for full FHE functionality)

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Compile Contracts**:
    ```bash
    npx hardhat compile
    ```

3.  **Run Tests**:
    ```bash
    npx hardhat test
    ```
    *Note: Full functional testing requires an FHE environment (Zama Devnet).*

4.  **Deploy**:
    ```bash
    npx hardhat run scripts/deploy.ts
    ```

## Documentation

-   **Product Overview**: [docs/PRODUCT.md](docs/PRODUCT.md)
-   **Smart Contract Walkthrough**: [walkthrough.md](.gemini/antigravity/brain/43de1f4f-8eae-4ebb-94bb-220e88b3b2f8/walkthrough.md)

## Roadmap

-   ✅ Phase 1: Confidential Locker (Time + KPI)
-   ✅ Phase 2: Buyback & TWAP
-   🚧 Phase 3: Dashboard UI
-   📋 Phase 4: Policy Management (Holder Reveal)
-   📋 Phase 5: AML/Sanction Checks (GoPlus, Chainalysis)

## License

MIT
