// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TaskManager {

    // =========================
    // State Variables
    // =========================

    address public owner;
    uint256 public taskCounter;

    struct Task {
        uint256 id;
        string description;
        bool isCompleted;
        uint256 createdAt;
        uint256 completedAt;
    }

    mapping(uint256 => Task) public tasks;
    mapping(address => uint256) public userTaskCount;

    // =========================
    // Events
    // =========================

    event TaskCreated(
        uint256 indexed taskId,
        string description,
        uint256 timestamp
    );

    event TaskCompleted(
        uint256 indexed taskId,
        uint256 timestamp
    );

    event TaskUpdated(
        uint256 indexed taskId,
        string newDescription,
        uint256 timestamp
    );

    // =========================
    // Constructor
    // =========================

    constructor() {
        owner = msg.sender;
        taskCounter = 0;
    }

    // =========================
    // Modifiers
    // =========================

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only contract owner can perform this action."
        );
        _;
    }

    modifier taskExists(uint256 _taskId) {
        require(
            _taskId > 0 && _taskId <= taskCounter,
            "Task does not exist."
        );
        _;
    }

    // =========================
    // Create Task
    // =========================

    function createTask(string memory _description)
        public
        onlyOwner
        returns (uint256)
    {
        require(
            bytes(_description).length > 0,
            "Description cannot be empty."
        );

        require(
            bytes(_description).length <= 256,
            "Description is too long."
        );

        taskCounter++;

        tasks[taskCounter] = Task({
            id: taskCounter,
            description: _description,
            isCompleted: false,
            createdAt: block.timestamp,
            completedAt: 0
        });

        userTaskCount[msg.sender]++;

        emit TaskCreated(
            taskCounter,
            _description,
            block.timestamp
        );

        return taskCounter;
    }

    // =========================
    // Get Task
    // =========================

    function getTask(uint256 _taskId)
        public
        view
        taskExists(_taskId)
        returns (Task memory)
    {
        return tasks[_taskId];
    }

    // =========================
    // Complete Task
    // =========================

    function completeTask(uint256 _taskId)
        public
        onlyOwner
        taskExists(_taskId)
    {
        require(
            !tasks[_taskId].isCompleted,
            "Task already completed."
        );

        tasks[_taskId].isCompleted = true;
        tasks[_taskId].completedAt = block.timestamp;

        emit TaskCompleted(
            _taskId,
            block.timestamp
        );
    }

    // =========================
    // Update Task
    // =========================

    function updateTask(
        uint256 _taskId,
        string memory _newDescription
    )
        public
        onlyOwner
        taskExists(_taskId)
    {
        require(
            bytes(_newDescription).length > 0,
            "Description cannot be empty."
        );

        require(
            !tasks[_taskId].isCompleted,
            "Completed task cannot be updated."
        );

        tasks[_taskId].description = _newDescription;

        emit TaskUpdated(
            _taskId,
            _newDescription,
            block.timestamp
        );
    }

    // =========================
    // Total Tasks
    // =========================

    function getTotalTasks()
        public
        view
        returns (uint256)
    {
        return taskCounter;
    }

    // =========================
    // Owner Task Count
    // =========================

    function getOwnerTaskCount()
        public
        view
        returns (uint256)
    {
        return userTaskCount[owner];
    }

    // =========================
    // Transfer Ownership
    // =========================

    function transferOwnership(address _newOwner)
        public
        onlyOwner
    {
        require(
            _newOwner != address(0),
            "Invalid address."
        );

        owner = _newOwner;
    }
}