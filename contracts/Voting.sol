// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    address public owner;
    mapping(address => bool) public voters;
    Candidate[] public candidates;
    bool public votingActive;

    event Voted(address voter, string candidateName);
    event CandidateAdded(string name);
    event VotingStarted();
    event VotingEnded();

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier votingOpen() {
        require(votingActive, "Voting is not active");
        _;
    }

    constructor() {
        owner = msg.sender;
        votingActive = false;
    }

    function addCandidate(string memory name) public onlyOwner {
        require(!votingActive, "Cannot add candidates while voting is active");
        candidates.push(Candidate(name, 0));
        emit CandidateAdded(name);
    }

    function startVoting() public onlyOwner {
        require(!votingActive, "Voting already active");
        require(candidates.length > 0, "No candidates added");
        votingActive = true;
        emit VotingStarted();
    }

    function endVoting() public onlyOwner {
        require(votingActive, "Voting is not active");
        votingActive = false;
        emit VotingEnded();
    }

    function vote(uint256 candidateIndex) public votingOpen {
        require(!voters[msg.sender], "You have already voted");
        require(candidateIndex < candidates.length, "Invalid candidate");

        voters[msg.sender] = true;
        candidates[candidateIndex].voteCount += 1;

        emit Voted(msg.sender, candidates[candidateIndex].name);
    }

    function getCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }

    function hasVoted(address voter) public view returns (bool) {
        return voters[voter];
    }

    function getResults() public view returns (string[] memory, uint256[] memory) {
        string[] memory names = new string[](candidates.length);
        uint256[] memory counts = new uint256[](candidates.length);

        for (uint256 i = 0; i < candidates.length; i++) {
            names[i] = candidates[i].name;
            counts[i] = candidates[i].voteCount;
        }
        return (names, counts);
    }
}