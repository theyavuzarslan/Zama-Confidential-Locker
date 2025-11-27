---
description: Deploy contracts to local Hardhat network
---

1. Start the local Hardhat node:
```bash
npx hardhat node
```

2. In a new terminal, deploy the contracts:
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

3. Copy the deployed addresses from the output and update `frontend/lib/contracts.ts`.

4. Import the private key from one of the Hardhat accounts (e.g., Account #0) into your MetaMask wallet to interact with the dashboard.
