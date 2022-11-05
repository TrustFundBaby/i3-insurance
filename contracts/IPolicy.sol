// SPDX-License-Identifier: MIT
// i3 Contracts (last updated v0.1.0) (IPolicy.sol)

pragma solidity ^0.8.9;

enum TrustType {
    LIVING,
    DAPT,
    ING,
    CRT
}

enum TrustRole {
    GRANTOR,
    TRUSTEE,
    IA,
    TP
}

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IPolicy {
    /**
     * @dev Calculates the premium payment according to policy parameters.
     */
    function calculatePremium() external view returns (uint256 _premium);
}