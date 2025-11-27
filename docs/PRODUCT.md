# Product Documentation: Confidential Token Management Dashboard

## Executive Summary

The Confidential Token Management Dashboard is a privacy-first DeFi platform that enables projects to manage their tokenomics without revealing sensitive financial strategies. By leveraging Fully Homomorphic Encryption (FHE), the platform allows for:

1.  **Confidential Token Locking** with time and KPI-based unlocks
2.  **Automated Buyback Programs** with TWAP and price-target strategies
3.  **Compliance Controls** via allowlist management

## Problem Statement

### Current Limitations in DeFi

**Transparency Paradox**: While blockchain transparency builds trust, it creates strategic vulnerabilities:

-   **Market Manipulation**: Traders front-run known unlock events, causing volatility.
-   **Competitive Intelligence**: Competitors analyze vesting schedules to gauge project health.
-   **Privacy Concerns**: High-net-worth individuals and institutions prefer confidential financial planning.
-   **Buyback Inefficiency**: Public buyback schedules allow MEV bots to extract value.

### Real-World Impact

-   **Token Unlocks**: When a $10M unlock is scheduled publicly, markets often dump in anticipation.
-   **Buyback Programs**: Announced buybacks get front-run, increasing execution costs by 10-30%.
-   **Vesting Schedules**: Public team vesting reveals runway and can trigger panic selling.

## Solution: Privacy-Preserving Token Management

### Core Innovation: FHE-Based Confidentiality

Using Zama's fhEVM, we enable **computation on encrypted data**:

-   **Encrypted State**: Lock amounts, unlock times, and KPI targets are stored as ciphertexts.
-   **Encrypted Logic**: Conditions like `currentTime >= unlockTime` are evaluated without decryption.
-   **Selective Disclosure**: Only authorized parties (via view keys) can decrypt specific data.

### Feature 1: Confidential Locker

**Use Cases**:
-   **Team Vesting**: Lock team tokens with hidden unlock dates and performance milestones.
-   **Liquidity Locking**: Prove liquidity is locked without revealing the exact amount or duration.
-   **Investor Vesting**: Implement cliff and linear vesting with private schedules.

**How It Works**:
1.  User encrypts `amount`, `unlockTime`, and `targetKPI` client-side.
2.  Contract stores encrypted values and mints a `LockerPass` NFT.
3.  Withdrawal checks: `(currentTime >= unlockTime) AND (currentKPI >= targetKPI)`.
4.  If conditions are met, tokens are transferred; otherwise, transaction succeeds with 0 transfer (preserving privacy).

**Privacy Guarantees**:
-   **Amount**: Hidden (unless token itself is transparent during transfer).
-   **Unlock Time**: Hidden (observers can't predict unlock events).
-   **KPI Target**: Hidden (performance metrics remain confidential).

### Feature 2: Buyback & TWAP

**Use Cases**:
-   **Market Support**: Execute buybacks during price dips without telegraphing strategy.
-   **TWAP Execution**: Spread buybacks over time to minimize market impact.
-   **KPI-Triggered Buybacks**: Buy when price falls below a private threshold.

**How It Works**:
1.  Project configures encrypted `buybackAmount`, `interval`, and `targetPrice`.
2.  Anyone can call `executeBuyback(currentPrice)` (e.g., via Chainlink Automation).
3.  Contract checks: `(timePassed >= interval) AND (currentPrice < targetPrice)`.
4.  If true, executes swap; if false, no action (but transaction still succeeds).

**Privacy Guarantees**:
-   **Buyback Amount**: Hidden (market doesn't know how much will be bought).
-   **Frequency**: Hidden (interval is encrypted).
-   **Price Target**: Hidden (prevents front-running).

### Feature 3: Compliance Registry

**Use Cases**:
-   **KYC/AML**: Restrict platform access to verified users.
-   **Regulatory Compliance**: Maintain an allowlist for jurisdictional requirements.
-   **Gradual Decentralization**: Start permissioned, then open up.

**How It Works**:
-   Owner maintains an allowlist of approved addresses.
-   All locker and buyback functions check `registry.isAllowed(msg.sender)`.
-   Can be disabled for fully permissionless operation.

## User Journey

### For Projects (Locker)

1.  **Setup**: Deploy contracts, configure compliance.
2.  **Lock Tokens**: 
    -   Input amount, unlock date, and KPI target.
    -   Client encrypts values using `fhevmjs`.
    -   Submit transaction, receive `LockerPass` NFT.
3.  **Monitor**: View encrypted state (requires private key).
4.  **Withdraw**: When conditions are met, call `withdraw()` with current KPI value.

### For Projects (Buyback)

1.  **Configure Strategy**:
    -   Set buyback amount per interval.
    -   Set time interval (e.g., daily).
    -   Set price target (e.g., buy if price < $0.50).
2.  **Fund Treasury**: Deposit stablecoins to buyback contract.
3.  **Automate**: Integrate with Chainlink Automation or Gelato.
4.  **Execute**: Buybacks happen automatically when conditions are met.

## Technical Architecture

### Smart Contract Layer

```
ConfidentialLocker
├── Lock Struct: {euint32 unlockTime, euint32 targetKPI, euint128 amount}
├── lock(): Creates encrypted lock
└── withdraw(): Conditional transfer using FHE.select()

ConfidentialBuyback
├── Config: {euint128 buybackAmount, euint32 interval, euint32 targetPrice}
├── configureBuyback(): Set encrypted strategy
├── depositEncrypted(): Fund treasury
└── executeBuyback(): Conditional swap
```

### Frontend Layer (Planned)

-   **Encryption**: `fhevmjs` for client-side encryption.
-   **UI**: Next.js + Tailwind CSS.
-   **Design**: Inspired by Uniswap (clean), Morpho (data-rich).

## Future Roadmap

### Phase 3: Policy Management
-   **Holder Reveal**: Automatically reveal holders if they exceed a certain threshold (e.g., for regulatory reporting).
-   **Encrypted Snapshots**: Take snapshots of holder distributions without revealing individual balances.

### Phase 4: AML/Sanction Checks
-   **GoPlus Integration**: Check depositors against scam databases.
-   **Chainalysis Oracle**: Verify addresses aren't sanctioned.
-   **On-Chain Verification**: Prove compliance without revealing user identities.

## Competitive Advantages

1.  **First-Mover**: No existing locker supports FHE-based privacy.
2.  **Composability**: Can integrate with any FHE-enabled token.
3.  **Regulatory Friendly**: Compliance features built-in from day one.
4.  **Market Efficiency**: Reduces front-running and MEV extraction.

## Conclusion

The Confidential Token Management Dashboard represents the next evolution of DeFi infrastructure. By combining privacy, automation, and compliance, it enables projects to manage their tokenomics professionally while maintaining strategic confidentiality.
