import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // 1. Deploy LockerPass
    const LockerPass = await ethers.getContractFactory("LockerPass");
    const lockerPass = await LockerPass.deploy();
    await lockerPass.waitForDeployment();
    const lockerPassAddress = await lockerPass.getAddress();
    console.log("LockerPass deployed to:", lockerPassAddress);

    // 2. Deploy ComplianceRegistry
    const ComplianceRegistry = await ethers.getContractFactory("ComplianceRegistry");
    const complianceRegistry = await ComplianceRegistry.deploy();
    await complianceRegistry.waitForDeployment();
    const complianceRegistryAddress = await complianceRegistry.getAddress();
    console.log("ComplianceRegistry deployed to:", complianceRegistryAddress);

    // 3. Deploy MockConfidentialERC20 (for testing)
    const MockToken = await ethers.getContractFactory("MockConfidentialERC20");
    const mockToken = await MockToken.deploy();
    await mockToken.waitForDeployment();
    const mockTokenAddress = await mockToken.getAddress();
    console.log("MockConfidentialERC20 deployed to:", mockTokenAddress);

    // 4. Deploy ConfidentialLocker
    const ConfidentialLocker = await ethers.getContractFactory("ConfidentialLocker");
    const confidentialLocker = await ConfidentialLocker.deploy(lockerPassAddress, complianceRegistryAddress);
    await confidentialLocker.waitForDeployment();
    const confidentialLockerAddress = await confidentialLocker.getAddress();
    console.log("ConfidentialLocker deployed to:", confidentialLockerAddress);

    // 5. Set Locker in LockerPass
    const tx = await lockerPass.setLocker(confidentialLockerAddress);
    await tx.wait();
    console.log("LockerPass configured with Locker address");

    // 6. Deploy MockDEX
    const MockDEX = await ethers.getContractFactory("MockDEX");
    const mockDEX = await MockDEX.deploy();
    await mockDEX.waitForDeployment();
    const mockDEXAddress = await mockDEX.getAddress();
    console.log("MockDEX deployed to:", mockDEXAddress);

    // 7. Deploy ConfidentialBuyback
    // constructor(address _stablecoin, address _projectToken, address _dex)
    // We use MockToken as both stablecoin and project token for simplicity in PoC
    const ConfidentialBuyback = await ethers.getContractFactory("ConfidentialBuyback");
    const confidentialBuyback = await ConfidentialBuyback.deploy(mockTokenAddress, mockTokenAddress, mockDEXAddress);
    await confidentialBuyback.waitForDeployment();
    const confidentialBuybackAddress = await confidentialBuyback.getAddress();
    console.log("ConfidentialBuyback deployed to:", confidentialBuybackAddress);


    console.log("Deployment complete!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
