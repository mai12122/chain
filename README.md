# Assignment IV and V: Smart Contract Development + DApp Development

## Assignment V: DApp Development

This repository now includes a web-based decentralized application that connects the TaskManager smart contract from Assignment IV to a React frontend.

### Objective
Build a web-based DApp that lets users interact with the deployed smart contract through a browser using MetaMask and Web3.

### What the DApp includes
- A web-based frontend built with React in `frontend/`
- Blockchain connectivity through MetaMask and Web3
- Integration with the deployed Truffle TaskManager smart contract
- Functions to store and retrieve blockchain data from the user interface
- Basic input validation and user-friendly status messages

### DApp features in this project
- Connects to MetaMask with a dedicated Connect button
- Reads the connected wallet address and network
- Loads the deployed `TaskManager` contract from Truffle artifacts
- Retrieves blockchain data and displays it in the UI
- Supports storing blockchain data through contract write actions such as:
  - create task
  - update task
  - complete task
- Supports retrieving blockchain data through contract read actions such as:
  - get a task by id
  - list all tasks from on-chain storage
  - get total task count
  - get owner task count

### Important network note
The frontend is configured for the local Ganache network used by Truffle.

- RPC URL: `http://127.0.0.1:7545`
- Chain / network id: `5777`

If MetaMask is connected to another chain, the app will show a network mismatch message and the balance may appear as `0 ETH` even if the address is correct.

### How to run the DApp

#### 1) Start the local blockchain
Run Ganache and make sure it uses network id `5777`.

#### 2) Deploy the contracts
From the repository root:
```bash
npx truffle migrate --reset --network development
```

#### 3) Start the frontend
From the `frontend/` folder:
```bash
npm install
npm start
```

#### 4) Connect MetaMask
- Open MetaMask in your browser
- Select the local Ganache network
- Import or choose one of the Ganache accounts
- Click `Connect MetaMask` in the app

### Validation and user experience
The frontend includes basic validation and status feedback:
- prevents empty task descriptions
- validates task IDs before read/write actions
- shows connection errors and network mismatch messages
- updates the UI after blockchain actions complete

### Assignment V requirements met
| Requirement | Implementation |
|-------------|----------------|
| Web-based frontend | React frontend in `frontend/src/` |
| Smart contract integration | Truffle `TaskManager` artifact loaded in `frontend/src/contract.js` |
| Blockchain connectivity | MetaMask and Web3 connection flow |
| Store blockchain data | Create, update, and complete task methods from the UI |
| Retrieve blockchain data | Task lookup, task list, total count, and owner count from the UI |
| Input validation | Empty input checks, task ID validation, and connection/network checks |
| User-friendly interface | Status banner, account display, and role display |

---

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



