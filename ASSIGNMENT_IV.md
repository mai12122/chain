# TaskManager Smart Contract - Assignment IV

## Overview

This is a complete Solidity smart contract implementation for **Assignment IV: Smart Contract Development**. The `TaskManager` contract demonstrates all required features:

✅ **State Variables** - Owner, tasks mapping, task counter  
✅ **Store/Retrieve Functions** - Create, get, and update tasks  
✅ **Validation & Access Control** - onlyOwner modifier and input validation  

---

## Contract Features

### 📊 State Variables

```solidity
address public owner;              // Contract owner address
uint256 public taskCounter;        // Total number of tasks created
mapping(uint256 => Task) tasks;    // Storage for task data
mapping(address => uint256) userTaskCount;  // Task count per user
```

**Task Structure:**
```solidity
struct Task {
    uint256 id;              // Unique task ID
    string description;      // Task description
    bool isCompleted;        // Completion status
    uint256 createdAt;       // Creation timestamp
    uint256 completedAt;     // Completion timestamp
}
```

### 🔧 Core Functions

#### **1. Create Task (Store Data)**
```solidity
function createTask(string memory _description) public onlyOwner returns (uint256)
```
- **Purpose**: Store new tasks on the blockchain
- **Access Control**: Only owner can create tasks
- **Validation**: 
  - Description cannot be empty
  - Maximum 256 characters
- **Returns**: Task ID
- **Event**: `TaskCreated` emitted

#### **2. Get Task (Retrieve Data)**
```solidity
function getTask(uint256 _taskId) public view returns (Task memory)
```
- **Purpose**: Retrieve stored task details
- **Access**: Public (anyone can read)
- **Validation**: Task must exist
- **Returns**: Complete Task struct with all details

#### **3. Update Task (Modify Stored Data)**
```solidity
function updateTask(uint256 _taskId, string memory _newDescription) public onlyOwner
```
- **Purpose**: Modify existing task descriptions
- **Access Control**: Only owner can update
- **Validation**:
  - New description cannot be empty
  - Task cannot already be completed
  - Maximum 256 characters
- **Event**: `TaskUpdated` emitted

#### **4. Complete Task**
```solidity
function completeTask(uint256 _taskId) public onlyOwner
```
- **Purpose**: Mark tasks as completed
- **Access Control**: Only owner
- **Validation**: Cannot complete already completed tasks
- **Event**: `TaskCompleted` emitted

### 🔐 Access Control

**onlyOwner Modifier:**
```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Only contract owner can call this function");
    _;
}
```
Restricts create, update, and complete operations to the contract owner only.

**taskExists Modifier:**
```solidity
modifier taskExists(uint256 _taskId) {
    require(_taskId > 0 && _taskId <= taskCounter, "Task does not exist");
    _;
}
```
Validates that a task ID is valid before operations.

### ✔️ Validation Checks

| Function | Validation |
|----------|-----------|
| `createTask()` | ✓ Non-empty description, ✓ Max 256 chars, ✓ onlyOwner |
| `getTask()` | ✓ Task must exist |
| `updateTask()` | ✓ Non-empty description, ✓ Max 256 chars, ✓ Task not completed, ✓ onlyOwner |
| `completeTask()` | ✓ Task not already completed, ✓ onlyOwner |

---

## Project Structure

```
d:\chain\
├── contracts/
│   ├── Migrations.sol              # Standard Truffle migration contract
│   └── TaskManager.sol             # ← NEW: Smart contract implementation
├── migrations/
│   ├── 1_initial_migration.js      # Standard migration
│   └── 2_deploy_task_manager.js    # ← NEW: TaskManager deployment
├── test/
│   └── task_manager_test.js        # ← NEW: Comprehensive tests
├── public/                         # React frontend
├── src/                           # React source code
├── package.json
├── truffle-config.js
└── README.md
```

---

## How to Compile and Test

### **1. Compile the Contract**
```bash
cd d:\chain
truffle compile
```
Expected output: TaskManager contract compiles successfully

### **2. Run Tests**
```bash
truffle test
```
This will run 20+ test cases demonstrating:
- State variable initialization
- Task creation (store data)
- Task retrieval (retrieve data)
- Task updates (modify data)
- Access control enforcement
- Input validation
- Error handling

### **3. Deploy to Network**
```bash
truffle migrate
```
This deploys both Migrations and TaskManager contracts to the configured network.

---

## Test Coverage

The `task_manager_test.js` file includes **20+ comprehensive tests** covering:

### ✅ Core Functionality Tests
- [x] Owner initialization
- [x] Task counter initialization
- [x] Task creation
- [x] Task retrieval
- [x] Task updates
- [x] Task completion

### ✅ Access Control Tests
- [x] Owner-only create restrictions
- [x] Owner-only update restrictions
- [x] Owner-only complete restrictions
- [x] Non-owner rejection

### ✅ Validation Tests
- [x] Empty description rejection
- [x] Too-long description rejection
- [x] Non-existent task rejection
- [x] Complete already-completed task rejection
- [x] Update completed task rejection

### ✅ State Management Tests
- [x] Task counter increment
- [x] Task data persistence
- [x] Owner task tracking
- [x] Completion timestamps

---

## Example Usage

### Creating a Task
```solidity
// Owner creates a task
taskManager.createTask("Complete Assignment IV");
// Returns: taskId = 1
```

### Retrieving Task Details
```solidity
// Anyone can retrieve
Task memory task = taskManager.getTask(1);
// Returns: 
// - id: 1
// - description: "Complete Assignment IV"
// - isCompleted: false
// - createdAt: [timestamp]
// - completedAt: 0
```

### Updating a Task
```solidity
// Owner updates task
taskManager.updateTask(1, "Complete Assignment IV - REVISED");
// Event emitted: TaskUpdated(1, "Complete Assignment IV - REVISED", timestamp)
```

### Completing a Task
```solidity
// Owner marks task as complete
taskManager.completeTask(1);
// Event emitted: TaskCompleted(1, timestamp)
// Task is now locked from updates
```

---

## Events Emitted

```solidity
event TaskCreated(uint256 indexed taskId, string description, uint256 timestamp);
event TaskCompleted(uint256 indexed taskId, uint256 timestamp);
event TaskUpdated(uint256 indexed taskId, string newDescription, uint256 timestamp);
```

---

## Gas Optimization Notes

- ✅ Uses mappings for O(1) task lookup
- ✅ Minimal storage per task
- ✅ Efficient access control with modifiers
- ✅ Events for off-chain tracking (instead of storage arrays)

---

## Assignment Requirements Met

| Requirement | Implementation | Location |
|-------------|-----------------|----------|
| **One or more state variables** | ✅ owner, taskCounter, tasks mapping, userTaskCount | TaskManager.sol lines 21-28 |
| **Functions to store data** | ✅ createTask() stores new tasks | TaskManager.sol lines 72-104 |
| **Functions to retrieve data** | ✅ getTask() retrieves stored tasks | TaskManager.sol lines 107-112 |
| **Basic validation** | ✅ Non-empty strings, task existence, length limits | Throughout contract |
| **Access control** | ✅ onlyOwner modifier restricts operations | TaskManager.sol lines 53-58 |

---

## Solidity Version

- **Compiler**: Solidity ^0.8.0
- **License**: MIT
- **Comments**: Comprehensive JSDoc-style comments included

---

## Additional Administrative Features

- `getTotalTasks()` - Get total task count
- `getOwnerTaskCount()` - Get owner's task count  
- `transferOwnership()` - Transfer contract ownership with validation

---

## Presentation Tips

1. **Demonstrate State Variables**: Show `owner` and `taskCounter` being initialized
2. **Show Store Function**: Walk through `createTask()` storing data to blockchain
3. **Show Retrieve Function**: Call `getTask()` to retrieve stored data
4. **Demonstrate Access Control**: Show how `onlyOwner` blocks unauthorized access
5. **Show Validation**: Attempt to create invalid tasks (empty, too long) and show rejection
6. **Run Tests**: Execute test suite to show all features working together

---

## Files Included

| File | Purpose |
|------|---------|
| `contracts/TaskManager.sol` | Main smart contract (368 lines) |
| `migrations/2_deploy_task_manager.js` | Deployment script |
| `test/task_manager_test.js` | Comprehensive test suite (20+ tests) |
| `README.md` | This documentation |

---