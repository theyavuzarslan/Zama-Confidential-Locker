import { ethers, network } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Network:", network.name);

    const isZamaNetwork = network.name === "zama";

    // 1. Deploy MockCoprocessor (or use real Coprocessor address on Zama)
    let coprocessorAddress: string;
    
    if (isZamaNetwork) {
        // On Zama Devnet, you might use the real Coprocessor address
        // For now, we still deploy MockCoprocessor for testing
        console.log("Deploying on Zama Devnet...");
    }
    
    const MockCoprocessor = await ethers.getContractFactory("MockCoprocessor");
    const mockCoprocessor = await MockCoprocessor.deploy();
    await mockCoprocessor.waitForDeployment();
    coprocessorAddress = await mockCoprocessor.getAddress();
    console.log("MockCoprocessor deployed to:", coprocessorAddress);

    // 2. Deploy LockerPass
    const LockerPass = await ethers.getContractFactory("LockerPass");
    const lockerPass = await LockerPass.deploy();
    await lockerPass.waitForDeployment();
    const lockerPassAddress = await lockerPass.getAddress();
    console.log("LockerPass deployed to:", lockerPassAddress);

    // 3. Deploy ComplianceRegistry
    const ComplianceRegistry = await ethers.getContractFactory("ComplianceRegistry");
    const complianceRegistry = await ComplianceRegistry.deploy();
    await complianceRegistry.waitForDeployment();
    const complianceRegistryAddress = await complianceRegistry.getAddress();
    console.log("ComplianceRegistry deployed to:", complianceRegistryAddress);

    // 4. Deploy ConfidentialLocker with correct constructor parameters
    const ConfidentialLocker = await ethers.getContractFactory("ConfidentialLocker");
    const confidentialLocker = await ConfidentialLocker.deploy(
        coprocessorAddress,
        lockerPassAddress,
        complianceRegistryAddress
    );
    await confidentialLocker.waitForDeployment();
    const confidentialLockerAddress = await confidentialLocker.getAddress();
    console.log("ConfidentialLocker deployed to:", confidentialLockerAddress);

    // 5. Set Locker in LockerPass (authorize ConfidentialLocker to mint/burn NFTs)
    const tx = await lockerPass.setLocker(confidentialLockerAddress);
    await tx.wait();
    console.log("LockerPass configured with Locker address");

    // 6. Deploy MockDEX (works on all networks)
    const MockDEX = await ethers.getContractFactory("MockDEX");
    const mockDEX = await MockDEX.deploy();
    await mockDEX.waitForDeployment();
    const mockDEXAddress = await mockDEX.getAddress();
    console.log("MockDEX deployed to:", mockDEXAddress);

    // 7. Deploy FHE-dependent contracts (deploy everywhere, but only functional on Zama)
    if (!isZamaNetwork) {
        console.log("\n⚠️  Note: FHE contracts will be deployed but won't be functional on", network.name);
    }
    
    // Deploy MockConfidentialERC20
    const MockToken = await ethers.getContractFactory("MockConfidentialERC20");
    const mockToken = await MockToken.deploy();
    await mockToken.waitForDeployment();
    const mockTokenAddress = await mockToken.getAddress();
    console.log("MockConfidentialERC20 deployed to:", mockTokenAddress);

    // Deploy ConfidentialBuyback
    const ConfidentialBuyback = await ethers.getContractFactory("ConfidentialBuyback");
    const confidentialBuyback = await ConfidentialBuyback.deploy(
        mockTokenAddress, 
        mockTokenAddress, 
        mockDEXAddress
    );
    await confidentialBuyback.waitForDeployment();
    const confidentialBuybackAddress = await confidentialBuyback.getAddress();
    console.log("ConfidentialBuyback deployed to:", confidentialBuybackAddress);

    console.log("\n========================================");
    console.log("Deployment complete!");
    console.log("========================================");
    console.log("\nAll Contract Addresses:");
    console.log("  MockCoprocessor:", coprocessorAddress);
    console.log("  LockerPass:", lockerPassAddress);
    console.log("  ComplianceRegistry:", complianceRegistryAddress);
    console.log("  ConfidentialLocker:", confidentialLockerAddress);
    console.log("  MockDEX:", mockDEXAddress);
    console.log("  MockConfidentialERC20:", mockTokenAddress);
    console.log("  ConfidentialBuyback:", confidentialBuybackAddress);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
