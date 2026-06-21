# Assignment IV: Smart Contract Development (TaskManager)

## Project overview
This repository contains a simple Solidity smart contract and a Truffle test suite.

### Contracts
- **`TaskManager.sol`**
  - **State variables:**
    - `address public owner`
    - `uint256 public taskCounter`
    - `mapping(uint256 => Task) public tasks`
    - `mapping(address => uint256) public userTaskCount`
  - **Struct:** `Task { id, description, isCompleted, createdAt, completedAt }`
  - **Access control:** `onlyOwner` modifier restricts write actions to the contract owner.
  - **Validation:**
    - `createTask` / `updateTask` reject empty descriptions and descriptions longer than 256 bytes.
    - `getTask` rejects non-existent IDs.
    - `updateTask` rejects updates for already completed tasks.
    - `completeTask` rejects completing an already-completed task.
  - **Functions to store & retrieve data:**
    - `createTask(description)` stores a new task.
    - `getTask(taskId)` retrieves task details.
    - `updateTask(taskId, newDescription)` updates stored data.
    - `completeTask(taskId)` marks a task as completed.
    - `getTotalTasks()` and `getOwnerTaskCount()` provide retrieval helpers.
  - **Events:** `TaskCreated`, `TaskUpdated`, `TaskCompleted`.

- **`Migrations.sol`**
  - Standard Truffle migrations helper contract.

## Tests
- **`test/task_manager_test.js`**
  - Uses Truffle + Mocha/Chai-style assertions.
  - Covers:
    - owner initialization
    - task creation validation + event emission
    - retrieval of existing/non-existing tasks
    - update validation + event behavior
    - completion access control + validation
    - owner task count, total count, and ownership transfer

## How to run

### 1) Install dependencies
```bash
npm install
```

### 2) Start a local blockchain (Ganache)
Truffle’s `development` network expects an RPC endpoint at `http://127.0.0.1:8545`.

Run Ganache in one terminal:
```bash
npx ganache -p 8545 --wallet.deterministic=true
```

> Note: You may see a warning about µWS compatibility with your Node.js build. Tests will still run because Ganache falls back to a NodeJS implementation.

### 3) Run migrations (Truffle default)
In another terminal:
```bash
npx truffle migrate --network development
```

### 4) Run tests
```bash
npx truffle test --network development
```

Expected result:
- `22 passing` (based on the current test suite)



