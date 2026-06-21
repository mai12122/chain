// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract Migrations {
    address public owner = msg.sender;
    uint256 public lastCompletedMigration;

    modifier restricted() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    function setCompleted(uint256 completed) public restricted {
        lastCompletedMigration = completed;
    }

    function upgrade(address newAddress) public restricted {
        Migrations upgraded = Migrations(newAddress);
        upgraded.setCompleted(lastCompletedMigration);
    }
}
