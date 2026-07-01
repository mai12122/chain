import React, { useState, useEffect, useCallback } from "react";
import { initWeb3, connectWallet, getAccount, getContract, getNetworkId } from "./contract";
import "./App.css";

const normalizeTask = (task, fallbackId) => ({
  id: Number(task.id ?? fallbackId),
  description: task.description ?? "",
  isCompleted: Boolean(task.isCompleted),
  createdAt: Number(task.createdAt ?? 0),
  completedAt: Number(task.completedAt ?? 0),
});

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "Pending";
  return new Date(timestamp * 1000).toLocaleString();
};

function App() {
  const [account, setAccount] = useState("");
  const [owner, setOwner] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [taskCounter, setTaskCounter] = useState(0);
  const [ownerTaskCount, setOwnerTaskCount] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [updateTaskId, setUpdateTaskId] = useState("");
  const [updateDescription, setUpdateDescription] = useState("");
  const [completeTaskId, setCompleteTaskId] = useState("");
  const [lookupTaskId, setLookupTaskId] = useState("");
  const [lookupTask, setLookupTask] = useState(null);
  const [status, setStatus] = useState("");

  const loadBlockchainData = useCallback(async () => {
    try {
      const connected = await initWeb3();
      if (!connected) {
        const detectedNetworkId = getNetworkId();
        setStatus(
          detectedNetworkId
            ? `TaskManager is deployed on network 5777, but MetaMask is on network ${detectedNetworkId}. Switch MetaMask to Ganache Localhost 7545.`
            : "Connect MetaMask and switch to the Ganache network."
        );
        return;
      }

      const acc = getAccount();
      const contract = getContract();

      if (!contract) {
        setStatus("Contract not available on the current network.");
        return;
      }

      setAccount(acc || "");

      const contractOwner = await contract.methods.owner().call();
      setOwner(contractOwner);
      setIsOwner(Boolean(acc) && acc.toLowerCase() === contractOwner.toLowerCase());

      const totalTasksRaw = await contract.methods.getTotalTasks().call();
      const totalTasks = Number(totalTasksRaw);
      setTaskCounter(totalTasks);

      const ownerTaskCountRaw = await contract.methods.getOwnerTaskCount().call();
      setOwnerTaskCount(Number(ownerTaskCountRaw));

      const fetchedTasks = await Promise.all(
        Array.from({ length: totalTasks }, async (_, index) => {
          const taskId = index + 1;
          const task = await contract.methods.getTask(taskId).call();
          return normalizeTask(task, taskId);
        })
      );

      setTasks(fetchedTasks);

      setStatus("");
    } catch (err) {
      console.error("Error loading contract data:", err);
      setStatus("Error: Mismatched network configuration or un-deployed contract.");
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const handleAccountsChanged = (accounts) => {
      console.log('Accounts changed:', accounts);
      if (!isMounted) return;
      
      if (accounts.length > 0) {
        loadBlockchainData();
      } else {
        setAccount("");
        setIsOwner(false);
        setStatus("MetaMask is connected to the site, but no wallet is authorized yet.");
      }
    };

    const handleChainChanged = (chainId) => {
      console.log('Chain changed to:', chainId);
      if (!isMounted) return;
      window.location.reload();
    };

    // Initial load
    loadBlockchainData();

    // Setup listeners
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    // Cleanup function
    return () => {
      isMounted = false;
      
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [loadBlockchainData]);

  const handleConnectWallet = async () => {
    if (!window.ethereum) {
      setStatus("Please install MetaMask extension!");
      return;
    }

    try {
      setStatus("Connecting to MetaMask...");
      const connected = await connectWallet();
      if (!connected) {
        setStatus("Connection failed. Check MetaMask and try again.");
        return;
      }

      await loadBlockchainData();
    } catch (err) {
      setStatus("Connection failed: " + err.message);
    }
  };

  const createTask = async () => {
    const description = newTaskDescription.trim();
    if (!description) {
      setStatus("Task description cannot be empty.");
      return;
    }
    if (description.length > 256) {
      setStatus("Task description must be 256 characters or less.");
      return;
    }

    const contract = getContract();
    if (!contract) {
      setStatus("TaskManager contract is not available on the current network.");
      return;
    }

    try {
      await contract.methods.createTask(description).send({ from: account });
      setStatus(`Task "${description}" created!`);
      setNewTaskDescription("");
      await loadBlockchainData();
    } catch (err) {
      setStatus("Error creating task: " + err.message);
    }
  };

  const updateTask = async () => {
    const taskId = Number(updateTaskId);
    const description = updateDescription.trim();
    if (!Number.isInteger(taskId) || taskId <= 0) {
      setStatus("Enter a valid task ID to update.");
      return;
    }
    if (!description) {
      setStatus("New description cannot be empty.");
      return;
    }
    if (description.length > 256) {
      setStatus("New description must be 256 characters or less.");
      return;
    }

    const contract = getContract();
    if (!contract) {
      setStatus("TaskManager contract is not available on the current network.");
      return;
    }

    try {
      await contract.methods.updateTask(taskId, description).send({ from: account });
      setStatus(`Task #${taskId} updated!`);
      setUpdateTaskId("");
      setUpdateDescription("");
      await loadBlockchainData();
    } catch (err) {
      setStatus("Error updating task: " + err.message);
    }
  };

  const completeTask = async () => {
    const taskId = Number(completeTaskId);
    if (!Number.isInteger(taskId) || taskId <= 0) {
      setStatus("Enter a valid task ID to complete.");
      return;
    }

    const contract = getContract();
    if (!contract) {
      setStatus("TaskManager contract is not available on the current network.");
      return;
    }

    try {
      await contract.methods.completeTask(taskId).send({ from: account });
      setStatus(`Task #${taskId} completed!`);
      setCompleteTaskId("");
      await loadBlockchainData();
    } catch (err) {
      setStatus("Error completing task: " + err.message);
    }
  };

  const lookupTaskById = async () => {
    const taskId = Number(lookupTaskId);
    if (!Number.isInteger(taskId) || taskId <= 0) {
      setStatus("Enter a valid task ID to look up.");
      return;
    }

    const contract = getContract();
    if (!contract) {
      setStatus("TaskManager contract is not available on the current network.");
      return;
    }

    try {
      const task = await contract.methods.getTask(taskId).call();
      setLookupTask(normalizeTask(task, taskId));
      setStatus(`Loaded task #${taskId}.`);
    } catch (err) {
      setLookupTask(null);
      setStatus("Error loading task: " + err.message);
    }
  };

  return (
    <div className="App">
      <h1>📋 Task Manager DApp</h1>

      <div className="info-bar">
        <p>
          <strong>Account:</strong>{" "}
          {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Not connected"}
        </p>
        <p>
          <strong>Owner:</strong> {owner ? `${owner.slice(0, 6)}...${owner.slice(-4)}` : "Loading"}
        </p>
        <p>
          <strong>Role:</strong> {isOwner ? "Owner (Admin)" : "User"}
        </p>
        <p>
          <strong>Total Tasks:</strong> {taskCounter}
        </p>
        <p>
          <strong>Owner Tasks:</strong> {ownerTaskCount}
        </p>
      </div>

      {!account && (
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <button className="connect-btn" onClick={handleConnectWallet}>
            🔌 Connect MetaMask
          </button>
        </div>
      )}

      {status && <div className="status">{status}</div>}

      <div className="admin-panel">
        <h2>Task Lookup</h2>
        <div className="add-candidate">
          <input
            type="number"
            min="1"
            placeholder="Task ID"
            value={lookupTaskId}
            onChange={(e) => setLookupTaskId(e.target.value)}
          />
          <button onClick={lookupTaskById}>Load Task</button>
        </div>
        {lookupTask && (
          <div className="task-details">
            <p><strong>ID:</strong> {lookupTask.id}</p>
            <p><strong>Description:</strong> {lookupTask.description}</p>
            <p><strong>Status:</strong> {lookupTask.isCompleted ? "Completed" : "Open"}</p>
            <p><strong>Created:</strong> {formatTimestamp(lookupTask.createdAt)}</p>
            <p><strong>Completed:</strong> {lookupTask.completedAt ? formatTimestamp(lookupTask.completedAt) : "Pending"}</p>
          </div>
        )}
      </div>

      {isOwner && (
        <div className="admin-panel">
          <h2>Admin Panel</h2>
          <div className="add-candidate">
            <input
              type="text"
              placeholder="New task description"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
            />
            <button onClick={createTask}>
              Create Task
            </button>
          </div>

          <div className="add-candidate">
            <input
              type="number"
              min="1"
              placeholder="Task ID to update"
              value={updateTaskId}
              onChange={(e) => setUpdateTaskId(e.target.value)}
            />
            <input
              type="text"
              placeholder="Updated task description"
              value={updateDescription}
              onChange={(e) => setUpdateDescription(e.target.value)}
            />
            <button onClick={updateTask}>
              Update Task
            </button>
          </div>

          <div className="add-candidate">
            <input
              type="number"
              min="1"
              placeholder="Task ID to complete"
              value={completeTaskId}
              onChange={(e) => setCompleteTaskId(e.target.value)}
            />
            <button onClick={completeTask}>
              Complete Task
            </button>
          </div>
        </div>
      )}

      <div className="candidates">
        <h2>Tasks</h2>
        {tasks.length === 0 ? (
          <p>No tasks added yet.</p>
        ) : (
          <ul>
            {tasks.map((task) => (
              <li key={task.id} className="candidate-card task-card">
                <div className="task-main">
                  <span className="name">Task #{task.id}</span>
                  <p>{task.description}</p>
                </div>
                <div className="task-meta">
                  <span className="votes">{task.isCompleted ? "Completed" : "Open"}</span>
                  <span className="task-time">Created: {formatTimestamp(task.createdAt)}</span>
                  <span className="task-time">Completed: {task.completedAt ? formatTimestamp(task.completedAt) : "Pending"}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;