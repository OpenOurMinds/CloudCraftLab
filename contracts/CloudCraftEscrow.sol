// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICloudCraftCoin {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract CloudCraftEscrow {
    ICloudCraftCoin public cccToken;
    address public owner;
    
    enum TaskState { Open, Assigned, Validating, Completed, Failed }

    struct Task {
        address client;
        address assignedNode;
        uint256 reward;
        uint256 requiredStake;
        uint256 maxExecutionTime;
        uint256 startTime;
        bytes32 taskHashRequirement; // Expected PoUW hash
        TaskState state;
    }

    mapping(bytes32 => Task) public tasks;
    mapping(address => uint256) public nodeReputation; // Global R_w metric

    event TaskPosted(bytes32 indexed taskId, address indexed client, uint256 reward, uint256 requiredStake);
    event TaskAssigned(bytes32 indexed taskId, address indexed node);
    event TaskCompleted(bytes32 indexed taskId, address indexed node, bytes32 computeHash);
    event TaskFailed(bytes32 indexed taskId, string reason);
    event StakeSlashed(address indexed node, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _cccTokenAddress) {
        owner = msg.sender;
        cccToken = ICloudCraftCoin(_cccTokenAddress);
    }

    /**
     * @dev 1. Task Posting: Client deposits CCC reward and sets hash validation requirements.
     */
    function postTask(
        bytes32 taskId, 
        uint256 reward, 
        uint256 requiredStake, 
        uint256 maxExecutionTime,
        bytes32 taskHashRequirement
    ) external {
        require(tasks[taskId].client == address(0), "Task already exists");
        
        // Lock funds in escrow
        require(cccToken.transferFrom(msg.sender, address(this), reward), "Reward transfer failed");

        tasks[taskId] = Task({
            client: msg.sender,
            assignedNode: address(0),
            reward: reward,
            requiredStake: requiredStake,
            maxExecutionTime: maxExecutionTime,
            startTime: 0,
            taskHashRequirement: taskHashRequirement,
            state: TaskState.Open
        });

        emit TaskPosted(taskId, msg.sender, reward, requiredStake);
    }

    /**
     * @dev 2. Node Commitment: Node operator stakes CCC to claim the task.
     */
    function acceptTask(bytes32 taskId) external {
        Task storage t = tasks[taskId];
        require(t.state == TaskState.Open, "Task not open");
        
        // Lock stake in escrow
        require(cccToken.transferFrom(msg.sender, address(this), t.requiredStake), "Stake transfer failed");

        t.assignedNode = msg.sender;
        t.startTime = block.timestamp;
        t.state = TaskState.Assigned;

        emit TaskAssigned(taskId, msg.sender);
    }

    /**
     * @dev 3 & 4. Validation & Payout: Node submits the PoUW Hash for verification.
     */
    function submitResult(bytes32 taskId, bytes32 computeHash) external {
        Task storage t = tasks[taskId];
        require(t.state == TaskState.Assigned, "Task not assigned");
        require(t.assignedNode == msg.sender, "Not assigned node");
        require(block.timestamp <= t.startTime + t.maxExecutionTime, "Task time expired");

        t.state = TaskState.Validating;
        
        // Simulating the validator consensus described in the WP.
        // A mismatch implies malicious intent -> 100% SLASH
        // A match releases funds + stake
        if (computeHash == t.taskHashRequirement) {
            _completeTask(taskId, computeHash);
        } else {
            _slashNode(taskId, "Invalid compute hash submitted");
        }
    }

    function _completeTask(bytes32 taskId, bytes32 computeHash) internal {
        Task storage t = tasks[taskId];
        t.state = TaskState.Completed;
        
        // Reputation algorithm: Increase R_w for successful submittal
        nodeReputation[t.assignedNode] += 1;

        // Payout: Return locked stake + newly earned reward
        uint256 totalPayout = t.reward + t.requiredStake;
        require(cccToken.transfer(t.assignedNode, totalPayout), "Transfer failed");

        emit TaskCompleted(taskId, t.assignedNode, computeHash);
    }

    function _slashNode(bytes32 taskId, string memory reason) internal {
        Task storage t = tasks[taskId];
        t.state = TaskState.Failed;
        
        // 100% Slashing penalty for malicious activity
        uint256 slashedAmount = t.requiredStake;
        
        // Refund unused reward back to client
        require(cccToken.transfer(t.client, t.reward), "Refund failed");

        // (In a real protocol, slashed tokens might be burned or sent to a treasury)

        emit StakeSlashed(t.assignedNode, slashedAmount);
        emit TaskFailed(taskId, reason);
    }

    /**
     * @dev Timeouts: Allows any party to trigger a fail state if the node exceeds max time.
     */
    function penalizeTimeout(bytes32 taskId) external {
        Task storage t = tasks[taskId];
        require(t.state == TaskState.Assigned, "Not in assigned state");
        require(block.timestamp > t.startTime + t.maxExecutionTime, "Execution time not expired yet");

        t.state = TaskState.Failed;
        
        // 2% slashing for minor timeout offense as detailed in Whitepaper
        uint256 penalty = (t.requiredStake * 2) / 100;
        uint256 refundStake = t.requiredStake - penalty;

        require(cccToken.transfer(t.assignedNode, refundStake), "Stake refund failed");
        require(cccToken.transfer(t.client, t.reward), "Reward refund failed");

        emit StakeSlashed(t.assignedNode, penalty);
        emit TaskFailed(taskId, "Task execution timed out");
    }
}
