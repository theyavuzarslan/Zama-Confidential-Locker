# Deployment Addresses

After running `npx hardhat run scripts/deploy.ts`, update `frontend/lib/contracts.ts` with the deployed addresses.

Example output:
```
LockerPass deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
ComplianceRegistry deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
MockConfidentialERC20 deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
ConfidentialLocker deployed to: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
MockDEX deployed to: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
ConfidentialBuyback deployed to: 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707
```

Update the `CONTRACTS` object in `frontend/lib/contracts.ts` with these addresses.
