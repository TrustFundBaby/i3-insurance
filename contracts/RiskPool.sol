// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./utils/FixedPointMathLib.sol";
import "./IssuedPoliciesRegistry.sol";
import "./IPolicy.sol";

contract RiskPool {
    using SafeERC20 for ERC20;
    using FixedPointMathLib for uint256;

    IssuedPoliciesRegistry public immutable registry;

    /// @notice The underlying token accepted by the Risk Pool for payment of policies.
    ERC20 public immutable currency;

    /// @notice The contract address of the parent Captive Insurance Company.
    address public immutable captiveInsurer;

    address[] public policies;
    mapping(address => bool) public supportedPolicies;

    constructor(
        address _registry,
        address _captive,
        ERC20 _currency,
        address[] memory _policies
    ) {
        registry = IssuedPoliciesRegistry(_registry);
        captiveInsurer = _captive;
        currency = _currency;

        // Iterate over policies and add to supportedPolicies that can be purchased from this risk pool
        policies = _policies;
        for (uint256 i = 0; i < _policies.length; i++) {
            supportedPolicies[_policies[i]] = true;
        }
    }

    function getPolicies() public view returns (address[] memory) {
        return policies;
    }

    function quote(address _policy) public view returns (uint256 _premium) {
        require(
            supportedPolicies[_policy] == true,
            "Policy not sold by risk pool"
        );

        return IPolicy(_policy).calculatePremium();
    }

    function purchase(address _policy) public returns (bool) {
        require(
            supportedPolicies[_policy] == true,
            "Policy not sold by risk pool"
        );
        require(currency.allowance(msg.sender, address(this)) >= (IPolicy(_policy).calculatePremium()), "Risk Pool is not authorized to debit premium amount");

        // return IPolicy(_policy).calculatePremium() * 1000000000000000000;

        currency.transferFrom(msg.sender, captiveInsurer, IPolicy(_policy).calculatePremium());

        registry.mint(msg.sender, 1, 1, new bytes(0));

        return true;
    }
}
