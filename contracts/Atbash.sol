// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import './Secp256k1.sol';

contract Atbash {
  struct Point {
    uint256 x;
    uint256 y;
  }

  struct Proposal {
    bytes32 merkleRoot;
    bytes32 metadata;
    Point[] ballotBoxes;
    uint startDate;
    uint endDate;
    address authority;
    uint256[] randomNumbers;
    address[] candidates;
  }
  mapping(uint => mapping(address => bool)) public receipts;
  mapping(uint256 => Proposal) public proposals;
  uint public proposalId = 0;

  event InitProposal(
    uint256 proposalId,
    address indexed authority,
    address[] indexed candidates,
    bytes32 merkle_root,
    bytes32 metadata
  );

  function initProposal(
    bytes32 _merkleRoot,
    bytes32 _metadata,
    uint _startDate,
    uint _endDate,
    uint256[] memory _randomNumbers,
    address[] memory _candidates,
    Point[] memory _ballotBoxes
  ) public {
    Proposal storage newProposal = proposals[proposalId];
    newProposal.merkleRoot = _merkleRoot;
    newProposal.metadata = _metadata;
    newProposal.startDate = _startDate;
    newProposal.endDate = _endDate;
    newProposal.randomNumbers = _randomNumbers;
    newProposal.candidates = _candidates;
    newProposal.authority = msg.sender;

    for (uint i = 0; i < _ballotBoxes.length; i++) {
      newProposal.ballotBoxes.push(_ballotBoxes[i]);
    }

    proposalId++;

    emit InitProposal(
      proposalId,
      msg.sender,
      _candidates,
      _merkleRoot,
      _metadata
    );
  }

  function vote(
    uint _proposalId,
    uint256[] memory _randomNumbers,
    Point[] memory votes,
    bytes32[] calldata proof
  ) public {
    require(!receipts[proposalId][msg.sender], 'You already voted.');

    Proposal storage proposal = proposals[_proposalId];

    bytes32 node = keccak256(abi.encodePacked(msg.sender));
    for (uint i = 0; i < proof.length; i++) {
      node = keccak256(abi.encodePacked(node ^ proof[i]));
    }
    require(node == proposal.merkleRoot, 'Invalid merkle root.');

    for (uint i = 0; i < proposal.randomNumbers.length; i++) {
      uint256 newNumber = proposal.randomNumbers[i] + _randomNumbers[i];
      proposal.randomNumbers[i] = newNumber;
    }

    for (uint i = 0; i < proposal.ballotBoxes.length; i++) {
      Point memory oldVote = proposal.ballotBoxes[i];
      (uint256 x, uint256 y) = Secp256k1.ecAdd(
        oldVote.x,
        oldVote.y,
        votes[i].x,
        votes[i].y
      );
      proposal.ballotBoxes[i] = Point({x: x, y: y});
    }

    receipts[proposalId][msg.sender] = true;
  }

  function getProposal(uint256 index) public view returns (Proposal memory) {
    return proposals[index];
  }
}
