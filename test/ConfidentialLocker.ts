import { expect } from "chai";
import { ethers } from "hardhat";
import { ConfidentialLocker, MockCoprocessor } from "../typechain-types";

describe("ConfidentialLocker (Async Coprocessor)", function () {
    let locker: ConfidentialLocker;
    let coprocessor: MockCoprocessor;
    let owner: any;
    let user: any;

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();

        // Deploy Mock Coprocessor
        const MockCoprocessorFactory = await ethers.getContractFactory("MockCoprocessor");
        coprocessor = await MockCoprocessorFactory.deploy();
        await coprocessor.waitForDeployment();

        // Deploy ConfidentialLocker
        const ConfidentialLockerFactory = await ethers.getContractFactory("ConfidentialLocker");
        locker = await ConfidentialLockerFactory.deploy(await coprocessor.getAddress());
        await locker.waitForDeployment();
    });

    it("Should allow deposit, request unlock, and withdraw on success callback", async function () {
        const depositAmount = ethers.parseEther("1.0");

        // 1. Deposit
        await locker.connect(user).deposit({ value: depositAmount });
        expect(await locker.balances(user.address)).to.equal(depositAmount);

        // 2. Request Unlock
        // In a real app, this would be an encrypted buffer. For mock, any bytes work.
        const dummyEncryptedKPI = ethers.toUtf8Bytes("dummy encrypted data");

        const tx = await locker.connect(user).requestUnlock(dummyEncryptedKPI);
        const receipt = await tx.wait();

        // Find the RequestSent event from the Coprocessor (emitted via the Locker call)
        // Note: In the mock, the Coprocessor emits RequestSent.
        // We can also check the Locker state if we exposed the requestId, but let's check the Mock state.
        const requestId = 0; // First request
        const sender = await coprocessor.requestSender(requestId);
        expect(sender).to.equal(await locker.getAddress());

        // 3. Simulate Callback (Success)
        // The Relayer (or us in test) calls fulfillRequest on the Mock, which calls back the Locker
        await coprocessor.fulfillRequest(requestId, true);

        // 4. Verify Withdrawal
        expect(await locker.balances(user.address)).to.equal(0);

        // Check user balance increased (approximate due to gas)
        // We can just check the contract balance is 0
        expect(await ethers.provider.getBalance(await locker.getAddress())).to.equal(0);
    });

    it("Should NOT withdraw on failure callback", async function () {
        const depositAmount = ethers.parseEther("1.0");

        // 1. Deposit
        await locker.connect(user).deposit({ value: depositAmount });

        // 2. Request Unlock
        const dummyEncryptedKPI = ethers.toUtf8Bytes("dummy");
        await locker.connect(user).requestUnlock(dummyEncryptedKPI);

        // 3. Simulate Callback (Failure)
        const requestId = 0;
        await coprocessor.fulfillRequest(requestId, false);

        // 4. Verify Balance remains
        expect(await locker.balances(user.address)).to.equal(depositAmount);
        expect(await ethers.provider.getBalance(await locker.getAddress())).to.equal(depositAmount);
    });
});
