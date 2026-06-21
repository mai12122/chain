// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TaskManager
 * @dev A simple contract to manage tasks with owner-based access control
 * 
 * Features:
 * - State variables: tasks mapping, task counter, owner address
 * - Store/Retrieve functions: createTask(), getTask(), updateTask()
 * - Access control: onlyOwner modifier restricts operations to contract owner
 * - Validation: checks for empty descriptions, non-existent tasks, and authorized access
 */

contract TaskManager {
    
    // ============ State Variables ============
    
    address public owner;
    uint256 public taskCounter;
    
    // Task structure
    struct Task {
        uint256 id;
        string description;
        bool isCompleted;
        uint256 createdAt;
        uint256 completedAt;
    }
    
    // Mapping to store tasks by ID
    mapping(uint256 => Task) public tasks;
    
    // Mapping to store task count per user
    mapping(address => uint256) public userTaskCount;
    
    // ============ Events ============
    
    event TaskCreated(uint256 indexed taskId, string description, uint256 timestamp);
    event TaskCompleted(uint256 indexed taskId, uint256 timestamp);
    event TaskUpdated(uint256 indexed taskId, string newDescription, uint256 timestamp);
    
    // ============ Modifiers ============
    
    /**
     * @dev Restricts function access to contract owner only
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can call this function");
        _;
    }
    
    /**
     * @dev Validates that a task exists
     */
    modifier taskExists(uint256 _taskId) {
        require(_taskId > 0 && _taskId <= taskCounter, "Task does not exist");
        _;
    }
    
    // ============ Constructor ============
    
    /**
     * @dev Initialize the contract with the deployer as owner
     */
    constructor() {
        owner = msg.sender;
        taskCounter = 0;
    }
    
    // ============ Core Functions ============
    
    /**
     * @dev Create a new task
     * @param _description The description of the task
     * @return taskId The ID of the newly created task
     */
    function createTask(string memory _description) public onlyOwner returns (uint256) {
        // Validation: ensure description is not empty
        require(bytes(_description).length > 0, "Task description cannot be empty");
        require(bytes(_description).length <= 256, "Task description too long");
        
        // Increment task counter
        taskCounter++;
        
        // Create new task
        tasks[taskCounter] = Task({
            id: taskCounter,
            description: _description,
            isCompleted: false,
            createdAt: block.timestamp,
            completedAt: 0
        });
        
        // Update user task count
        userTaskCount[owner]++;
        
        // Emit event
        emit TaskCreated(taskCounter, _description, block.timestamp);
        
        return taskCounter;
    }
    
    /**
     * @dev Retrieve task details by ID
     * @param _taskId The ID of the task to retrieve
     * @return The Task struct containing task details
     */
    function getTask(uint256 _taskId) public view taskExists(_taskId) returns (Task memory) {
        return tasks[_taskId];
    }
    
    /**
     * @dev Mark a task as completed
     * @param _taskId The ID of the task to complete
     */
    function completeTask(uint256 _taskId) public onlyOwner taskExists(_taskId) {
        // Validation: ensure task is not already completed
        require(!tasks[_taskId].isCompleted, "Task is already completed");
        
        // Mark task as completed
        tasks[_taskId].isCompleted = true;
        tasks[_taskId].completedAt = block.timestamp;
        
        // Emit event
        emit TaskCompleted(_taskId, block.timestamp);
    }
    
    /**
     * @dev Update the description of an existing task
     * @param _taskId The ID of the task to update
     * @param _newDescription The new description for the task
     */
    function updateTask(uint256 _taskId, string memory _newDescription) public onlyOwner taskExists(_taskId) {
        // Validation: ensure new description is not empty
        require(bytes(_newDescription).length > 0, "New description cannot be empty");
        require(bytes(_newDescription).length <= 256, "Description too long");
        
        // Validation: ensure task is not completed before updating
        require(!tasks[_taskId].isCompleted, "Cannot update a completed task");
        
        // Update task description
        tasks[_taskId].description = _newDescription;
        
        // Emit event
        emit TaskUpdated(_taskId, _newDescription, block.timestamp);
    }
    
    /**
     * @dev Get total number of tasks created
     * @return The total number of tasks
     */
    function getTotalTasks() public view returns (uint256) {
        return taskCounter;
    }
    
    /**
     * @dev Get the number of tasks for the owner
     * @return The number of tasks owned by the owner
     */
    function getOwnerTaskCount() public view returns (uint256) {
        return userTaskCount[owner];
    }
    
    // ============ Administrative Functions ============
    
    /**
     * @dev Transfer ownership to a new address
     * @param _newOwner The address of the new owner
     */
    function transferOwnership(address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "Invalid owner address");
        require(_newOwner != owner, "New owner cannot be the same as current owner");
        
        owner = _newOwner;
    }
}
