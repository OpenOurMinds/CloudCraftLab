const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CloudCraftEscrow - Advanced Market Mechanics", function () {
  let CCC, ccc, Escrow, escrow;
  let owner, client, node, validator;

  const TASK_REWARD = ethers.parseUnits("100", 18);
  const TASK_STAKE = ethers.parseUnits("50", 18);
  const VALID_HASH = ethers.id("VALID_TASK_OUTPUT");
  const INVALID_HASH = ethers.id("INVALID_TASK_OUTPUT");
  const TASK_ID = ethers.id("TASK_123");
  const MAX_EXECUTION_TIME = 3600; // 1 hour

  beforeEach(async function () {
    [owner, client, node, validator] = await ethers.getSigners();

    // Deploy mock ERC20 Token (CloudCraftCoin.sol)
    CCC = await ethers.getContractFactory("CloudCraftCoin");
    ccc = await CCC.deploy();
    await ccc.waitForDeployment();

    // Distribute tokens to network participants
    await ccc.mint(client.address, ethers.parseUnits("1000", 18));
    await ccc.mint(node.address, ethers.parseUnits("1000", 18));

    // Deploy Escrow Contract
    Escrow = await ethers.getContractFactory("CloudCraftEscrow");
    escrow = await Escrow.deploy(ccc.target);
    await escrow.waitForDeployment();

    // Set Max Approvals to Escrow Vault
    await ccc.connect(client).approve(escrow.target, ethers.parseUnits("10000", 18));
    await ccc.connect(node).approve(escrow.target, ethers.parseUnits("10000", 18));
  });

  it("Test 1: Arbitrage & Settlement Path (Successful Computation)", async function () {
    // 1. Client Posts task (Requires locking $100 CR)
    await expect(escrow.connect(client).postTask(TASK_ID, TASK_REWARD, TASK_STAKE, MAX_EXECUTION_TIME, VALID_HASH))
      .to.emit(escrow, "TaskPosted")
      .withArgs(TASK_ID, client.address, TASK_REWARD, TASK_STAKE);

    let task = await escrow.tasks(TASK_ID);
    expect(task.state).to.equal(0); // TaskState.Open

    // 2. Node Accepts (Requires locking $50 CR Stake)
    await expect(escrow.connect(node).acceptTask(TASK_ID))
      .to.emit(escrow, "TaskAssigned")
      .withArgs(TASK_ID, node.address);

    task = await escrow.tasks(TASK_ID);
    expect(task.state).to.equal(1); // TaskState.Assigned

    const initialBalance = await ccc.balanceOf(node.address);

    // 3. Node submits correct computed SHA-256 hash. Escrow automatically validates and releases funds.
    await expect(escrow.connect(node).submitResult(TASK_ID, VALID_HASH))
      .to.emit(escrow, "TaskCompleted")
      .withArgs(TASK_ID, node.address, VALID_HASH);
    
    task = await escrow.tasks(TASK_ID);
    expect(task.state).to.equal(3); // TaskState.Completed

    // Node should receive Stake ($50) + Reward ($100)
    const finalBalance = await ccc.balanceOf(node.address);
    expect(finalBalance - initialBalance).to.equal(TASK_REWARD + TASK_STAKE);

    // Node reputation increases by 1
    const rep = await escrow.nodeReputation(node.address);
    expect(rep).to.equal(1);
  });

  it("Test 2: Malicious Actor - 100% Slashing Condition", async function () {
    await escrow.connect(client).postTask(TASK_ID, TASK_REWARD, TASK_STAKE, MAX_EXECUTION_TIME, VALID_HASH);
    
    // Node puts 50 CCC at risk.
    await escrow.connect(node).acceptTask(TASK_ID);
    const clientBalanceBeforeSlash = await ccc.balanceOf(client.address);
    
    // Node submits fraudulent result.
    await expect(escrow.connect(node).submitResult(TASK_ID, INVALID_HASH))
      .to.emit(escrow, "StakeSlashed")
      .withArgs(node.address, TASK_STAKE);

    const task = await escrow.tasks(TASK_ID);
    expect(task.state).to.equal(4); // TaskState.Failed

    // Client receives their 100 CR reward back
    const clientBalanceAfterSlash = await ccc.balanceOf(client.address);
    expect(clientBalanceAfterSlash - clientBalanceBeforeSlash).to.equal(TASK_REWARD);
  });

  it("Test 3: Timeout Penalty (2% Slashing)", async function () {
    await escrow.connect(client).postTask(TASK_ID, TASK_REWARD, TASK_STAKE, MAX_EXECUTION_TIME, VALID_HASH);
    await escrow.connect(node).acceptTask(TASK_ID);

    // Fast-forward EVM time by 2 hours (exceeds max 1 hour limit)
    await ethers.provider.send("evm_increaseTime", [7200]);
    await ethers.provider.send("evm_mine");

    const nodeBalanceBeforeLimit = await ccc.balanceOf(node.address);

    // Trigger Timeout penalty
    await expect(escrow.connect(client).penalizeTimeout(TASK_ID))
      .to.emit(escrow, "StakeSlashed")
      .withArgs(node.address, (TASK_STAKE * 2n) / 100n); // 2% penalty

    const task = await escrow.tasks(TASK_ID);
    expect(task.state).to.equal(4); // TaskState.Failed

    // Check penalty logic: Node only gets refund minus 2%
    const nodeBalanceAfterLimit = await ccc.balanceOf(node.address);
    const expectedReturn = TASK_STAKE - ((TASK_STAKE * 2n) / 100n);
    expect(nodeBalanceAfterLimit - nodeBalanceBeforeLimit).to.equal(expectedReturn);
  });
});
