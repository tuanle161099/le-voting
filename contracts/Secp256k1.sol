// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import './EllipticCurve.sol';

library Secp256k1 {
  uint256 private constant p =
    0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f;
  uint256 private constant a = 0;
  uint256 private constant b = 7;

  function ecAdd(
    uint256 _x1,
    uint256 _y1,
    uint256 _x2,
    uint256 _y2
  ) internal pure returns (uint256, uint256) {
    return EllipticCurve.ecAdd(_x1, _y1, _x2, _y2, a, p);
  }

  function ecSub(
    uint256 _x1,
    uint256 _y1,
    uint256 _x2,
    uint256 _y2
  ) internal pure returns (uint256, uint256) {
    return EllipticCurve.ecSub(_x1, _y1, _x2, _y2, a, p);
  }

  function ecMul(
    uint256 _k,
    uint256 _x,
    uint256 _y
  ) internal pure returns (uint256, uint256) {
    return EllipticCurve.ecMul(_k, _x, _y, a, p);
  }
}
