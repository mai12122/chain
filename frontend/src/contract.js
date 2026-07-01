// src/contract.js
import Web3 from 'web3';
import TaskManagerArtifact from './contracts/TaskManager.json';

let web3;
let contractInstance;
let currentAccount;
let currentNetworkId;

// Initialize Web3 and load contract
export const initWeb3 = async () => {
  if (typeof window.ethereum === 'undefined') {
    console.error('MetaMask not detected');
    return false;
  }

  try {
    web3 = new Web3(window.ethereum);
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    currentAccount = accounts[0] || '';

    // Get network ID
    const networkId = await web3.eth.net.getId();
    currentNetworkId = networkId;
    console.log('Connected to network ID:', networkId);

    // Find deployed contract for this network
    const deployedNetwork = TaskManagerArtifact.networks[networkId];

    if (!deployedNetwork) {
      console.error(
        `Contract not deployed on network ${networkId}. ` +
        `Available networks: ${Object.keys(TaskManagerArtifact.networks).join(', ')}`
      );
      contractInstance = null;
      return false;
    }

    // Create contract instance
    contractInstance = new web3.eth.Contract(
      TaskManagerArtifact.abi,
      deployedNetwork.address
    );

    console.log('Contract loaded at:', deployedNetwork.address);
    return true;
  } catch (error) {
    console.error('Error initializing Web3:', error);
    return false;
  }
};

// Request wallet access from MetaMask
export const connectWallet = async () => {
  if (typeof window.ethereum === 'undefined') {
    console.error('MetaMask not detected');
    return false;
  }

  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    currentAccount = accounts[0] || '';
    return true;
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return false;
  }
};

// Get current account
export const getAccount = () => {
  return currentAccount;
};

// Get contract instance
export const getContract = () => {
  if (!contractInstance) {
    console.error('Contract not initialized. Call initWeb3() first.');
    return null;
  }
  return contractInstance;
};

export const getNetworkId = () => currentNetworkId;

// Export cleanup function for use in React useEffect
export const cleanup = () => {
  currentAccount = '';
  contractInstance = null;
  currentNetworkId = undefined;
};