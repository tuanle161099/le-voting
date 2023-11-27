// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import './EllipticCurve.sol';

/**
 ** @title Test Helper for the EllipticCurve library
 ** @author Witnet Foundation
 */
contract Atbash {
  uint256 private constant p =
    0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f;
  uint256 private constant a = 0;
  uint256 private constant b = 7;

  struct BallotBox {
    uint256 pointX;
    uint256 pointY;
  }

  struct Proposal {
    bytes32 merkleRoot;
    bytes32 metadata;
    BallotBox[] ballotBoxes;
    uint startDate;
    uint endDate;
    address authority;
    uint[] randomNumbers;
    address[] candidates;
  }

  mapping(address => Proposal) public proposals;
  address[] public proposalList;

  event ProposalCreated(
    address indexed proposalAddr,
    address indexed authority,
    address[] indexed candidates,
    bytes32 merkle_root,
    bytes32 metadata
  );

  function ecAdd(
    uint256 _x1,
    uint256 _y1,
    uint256 _x2,
    uint256 _y2
  ) public pure returns (uint256, uint256) {
    return EllipticCurve.ecAdd(_x1, _y1, _x2, _y2, a, p);
  }

  function ecSub(
    uint256 _x1,
    uint256 _y1,
    uint256 _x2,
    uint256 _y2
  ) public pure returns (uint256, uint256) {
    return EllipticCurve.ecSub(_x1, _y1, _x2, _y2, a, p);
  }

  function ecMul(
    uint256 _k,
    uint256 _x,
    uint256 _y
  ) public pure returns (uint256, uint256) {
    return EllipticCurve.ecMul(_k, _x, _y, a, p);
  }

  modifier isValidDateStart(uint startDate) {
    require(startDate == 0, 'Invalid Date Start!');
    _;
  }

  modifier isValidDateEnd(uint endDate) {
    require(endDate == 0, 'Invalid Date End!');
    _;
  }

  function initProposal(
    bytes32 _merkleRoot,
    bytes32 _metadata,
    uint _startDate,
    uint _endDate,
    uint[] memory _randomNumbers,
    address[] memory _candidates,
    BallotBox[] memory _ballotBoxes,
    address proposalAddr
  ) public {
    proposals[proposalAddr].merkleRoot = _merkleRoot;
    proposals[proposalAddr].metadata = _metadata;
    proposals[proposalAddr].startDate = _startDate;
    proposals[proposalAddr].endDate = _endDate;
    proposals[proposalAddr].randomNumbers = _randomNumbers;
    proposals[proposalAddr].candidates = _candidates;
    proposals[proposalAddr].authority = msg.sender;

    for (uint i = 0; i < _ballotBoxes.length; i++) {
      proposals[proposalAddr].ballotBoxes.push(_ballotBoxes[i]);
    }

    emit ProposalCreated(
      proposalAddr,
      msg.sender,
      _candidates,
      _merkleRoot,
      _metadata
    );

    proposalList.push(proposalAddr);
  }

  function getProposal(
    address proposalAddr
  ) public view returns (Proposal memory) {
    Proposal memory proposal = proposals[proposalAddr];
    return proposal;
  }

  function getLength() public view returns (uint) {
    return proposalList.length;
  }

  function vote(
    address _proposalAddr,
    address _voteFor,
    uint[] memory _randomNumbers
  ) public view {
    Proposal memory proposal = getProposal(_proposalAddr);
    BallotBox[] memory ballotBoxes = proposal.ballotBoxes;

    for (uint i = 0; i < proposal.candidates.length; i++) {
      if (proposal.candidates[i] == _proposalAddr) {}
    }
  }
}
