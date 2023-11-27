// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import './Secp256k1.sol';

/**
 ** @title Test Helper for the EllipticCurve library
 ** @author Witnet Foundation
 */
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

  mapping(uint256 => Proposal) public proposals;
  uint256 public proposalId = 0;

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
    uint[] memory _randomNumbers,
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

  function getProposal(uint256 index) public view returns (Proposal memory) {
    return proposals[index];
  }
}
