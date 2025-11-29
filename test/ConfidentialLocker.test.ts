import { expect } from "chai";
import { ethers } from "hardhat";
import { ConfidentialLocker, MockCoprocessor, LockerPass, ComplianceRegistry } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("ConfidentialLocker", function () {
    let locker: ConfidentialLocker;
    let coprocessor: MockCoprocessor;
    let lockerPass: LockerPass;
    let complianceRegistry: ComplianceRegistry;
    let owner: HardhatEthersSigner;
    let user: HardhatEthersSigner;
    let unauthorizedUser: HardhatEthersSigner;

    // Dummy encrypted data for testing
    const dummyEncryptedUnlockTime = ethers.toUtf8Bytes("encrypted_unlock_time");
    const dummyEncryptedKPI = ethers.toUtf8Bytes("encrypted_kpi_threshold");
    const dummyCurrentKPI = ethers.toUtf8Bytes("current_kpi_value");

    beforeEach(async function () {
        [owner, user, unauthorizedUser] = await ethers.getSigners();

        // Deploy MockCoprocessor
        const MockCoprocessorFactory = await ethers.getContractFactory("MockCoprocessor");
        coprocessor = await MockCoprocessorFactory.deploy();
        await coprocessor.waitForDeployment();

        // Deploy LockerPass
        const LockerPassFactory = await ethers.getContractFactory("LockerPass");
        lockerPass = await LockerPassFactory.deploy();
        await lockerPass.waitForDeployment();

        // Deploy ComplianceRegistry
        const ComplianceRegistryFactory = await ethers.getContractFactory("ComplianceRegistry");
        complianceRegistry = await ComplianceRegistryFactory.deploy();
        await complianceRegistry.waitForDeployment();

        // Deploy ConfidentialLocker
        const ConfidentialLockerFactory = await ethers.getContractFactory("ConfidentialLocker");
        locker = await ConfidentialLockerFactory.deploy(
            await coprocessor.getAddress(),
            await lockerPass.getAddress(),
            await complianceRegistry.getAddress()
        );
        await locker.waitForDeployment();

        // Configure LockerPass to allow ConfidentialLocker to mint/burn
        await lockerPass.setLocker(await locker.getAddress());
    });

    describe("Deployment", function () {
        it("Should deploy all contracts correctly", async function () {
            expect(await locker.coprocessor()).to.equal(await coprocessor.getAddress());
            expect(await locker.lockerPass()).to.equal(await lockerPass.getAddress());
            expect(await locker.complianceRegistry()).to.equal(await complianceRegistry.getAddress());
        });

        it("Should have LockerPass configured with locker address", async function () {
            expect(await lockerPass.locker()).to.equal(await locker.getAddress());
        });
    });

    describe("ETH Lock", function () {
        it("Should create ETH lock and mint LockerPass NFT", async function () {
            const lockAmount = ethers.parseEther("1.0");

            // Create lock
            const tx = await locker.connect(user).lock(
                ethers.ZeroAddress, // ETH
                0, // Amount ignored for ETH
                dummyEncryptedUnlockTime,
                dummyEncryptedKPI,
                { value: lockAmount }
            );

            const receipt = await tx.wait();

            // Check lock was created
            const lock = await locker.getLock(0);
            expect(lock.user).to.equal(user.address);
            expect(lock.token).to.equal(ethers.ZeroAddress);
            expect(lock.amount).to.equal(lockAmount);
            expect(lock.withdrawn).to.equal(false);

            // Check NFT was minted
            expect(await lockerPass.ownerOf(0)).to.equal(user.address);

            // Check contract balance
            expect(await ethers.provider.getBalance(await locker.getAddress())).to.equal(lockAmount);
        });

        it("Should reject ETH lock with zero value", async function () {
            await expect(
                locker.connect(user).lock(
                    ethers.ZeroAddress,
                    0,
                    dummyEncryptedUnlockTime,
                    dummyEncryptedKPI,
                    { value: 0 }
                )
            ).to.be.revertedWith("ETH amount must be greater than 0");
        });
    });

    describe("Compliance Check", function () {
        it("Should reject lock from non-compliant user when whitelist enabled", async function () {
            // Enable whitelist
            await complianceRegistry.setWhitelistEnabled(true);

            // Try to lock without being whitelisted
            await expect(
                locker.connect(user).lock(
                    ethers.ZeroAddress,
                    0,
                    dummyEncryptedUnlockTime,
                    dummyEncryptedKPI,
                    { value: ethers.parseEther("1.0") }
                )
            ).to.be.revertedWith("User not allowed");
        });

        it("Should allow lock from compliant user when whitelist enabled", async function () {
            // Enable whitelist and add user
            await complianceRegistry.setWhitelistEnabled(true);
            await complianceRegistry.setAllowed(user.address, true);

            // Lock should succeed
            await expect(
                locker.connect(user).lock(
                    ethers.ZeroAddress,
                    0,
                    dummyEncryptedUnlockTime,
                    dummyEncryptedKPI,
                    { value: ethers.parseEther("1.0") }
                )
            ).to.emit(locker, "LockCreated");
        });
    });

    describe("Withdraw Request", function () {
        beforeEach(async function () {
            // Create a lock first
            await locker.connect(user).lock(
                ethers.ZeroAddress,
                0,
                dummyEncryptedUnlockTime,
                dummyEncryptedKPI,
                { value: ethers.parseEther("1.0") }
            );
        });

        it("Should send withdraw request to Coprocessor", async function () {
            const tx = await locker.connect(user).withdraw(0, dummyCurrentKPI);
            await tx.wait();

            // Check request was registered in MockCoprocessor
            const requestSender = await coprocessor.requestSender(0);
            expect(requestSender).to.equal(await locker.getAddress());
        });

        it("Should reject withdraw from non-owner", async function () {
            await expect(
                locker.connect(unauthorizedUser).withdraw(0, dummyCurrentKPI)
            ).to.be.revertedWith("Not lock owner");
        });

        it("Should reject withdraw if NFT transferred away", async function () {
            // Transfer NFT to another user
            await lockerPass.connect(user).transferFrom(user.address, unauthorizedUser.address, 0);

            // Try to withdraw
            await expect(
                locker.connect(user).withdraw(0, dummyCurrentKPI)
            ).to.be.revertedWith("Must hold LockerPass NFT");
        });
    });

    describe("Callback Success", function () {
        beforeEach(async function () {
            // Create a lock and request withdrawal
            await locker.connect(user).lock(
                ethers.ZeroAddress,
                0,
                dummyEncryptedUnlockTime,
                dummyEncryptedKPI,
                { value: ethers.parseEther("1.0") }
            );
            await locker.connect(user).withdraw(0, dummyCurrentKPI);
        });

        it("Should withdraw funds on successful callback", async function () {
            const userBalanceBefore = await ethers.provider.getBalance(user.address);

            // Simulate successful callback from Coprocessor
            await coprocessor.fulfillRequest(0, true);

            // Check lock is marked as withdrawn
            const lock = await locker.getLock(0);
            expect(lock.withdrawn).to.equal(true);

            // Check contract balance is 0
            expect(await ethers.provider.getBalance(await locker.getAddress())).to.equal(0);

            // Check NFT was burned
            await expect(lockerPass.ownerOf(0)).to.be.reverted;
        });
    });

    describe("Callback Failure", function () {
        beforeEach(async function () {
            // Create a lock and request withdrawal
            await locker.connect(user).lock(
                ethers.ZeroAddress,
                0,
                dummyEncryptedUnlockTime,
                dummyEncryptedKPI,
                { value: ethers.parseEther("1.0") }
            );
            await locker.connect(user).withdraw(0, dummyCurrentKPI);
        });

        it("Should NOT withdraw funds on failed callback", async function () {
            const lockAmount = ethers.parseEther("1.0");

            // Simulate failed callback from Coprocessor
            await coprocessor.fulfillRequest(0, false);

            // Check lock is NOT marked as withdrawn
            const lock = await locker.getLock(0);
            expect(lock.withdrawn).to.equal(false);

            // Check contract still holds the funds
            expect(await ethers.provider.getBalance(await locker.getAddress())).to.equal(lockAmount);

            // Check NFT still exists
            expect(await lockerPass.ownerOf(0)).to.equal(user.address);
        });

        it("Should allow retry after failed callback", async function () {
            // First callback fails
            await coprocessor.fulfillRequest(0, false);

            // User can try again
            await locker.connect(user).withdraw(0, dummyCurrentKPI);

            // Second callback succeeds
            await coprocessor.fulfillRequest(1, true);

            // Funds should be withdrawn now
            const lock = await locker.getLock(0);
            expect(lock.withdrawn).to.equal(true);
        });
    });

    describe("View Functions", function () {
        it("Should return correct lock status", async function () {
            // No lock yet
            expect(await locker.isLockActive(0)).to.equal(false);

            // Create lock
            await locker.connect(user).lock(
                ethers.ZeroAddress,
                0,
                dummyEncryptedUnlockTime,
                dummyEncryptedKPI,
                { value: ethers.parseEther("1.0") }
            );

            // Lock is active
            expect(await locker.isLockActive(0)).to.equal(true);

            // Withdraw
            await locker.connect(user).withdraw(0, dummyCurrentKPI);
            await coprocessor.fulfillRequest(0, true);

            // Lock is no longer active
            expect(await locker.isLockActive(0)).to.equal(false);
        });
    });
});

