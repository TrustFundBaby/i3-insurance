// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract P1 is Ownable {
    using SafeMath for uint256;

    uint256 public immutable decimals = 18;
    
    /// @notice The expense ratio of policies written expressed in basis points.
    /// @dev Expressed as basis points with correct base unit (ex. 5% = 500 bps).
    uint256 public frequency;

    /// @notice The expense ratio of policies written expressed in basis points.
    /// @dev Expressed as basis points with correct base unit (ex. 0.2% = 20 bps).
    uint256 public expenseRatio;
    
    /// @notice The expense ratio of policies written expressed in basis points.
    /// @dev Expressed as basis points with correct base unit (ex. 5% = 500 bps).
    uint256 public profitRatio;
   
    /// @notice The average loss per unit.
    /// @dev The avg. amount lost per claim (ex. loss**18).
    uint256 public avgLossPerUnit;

    constructor (uint256 _frequency, uint256 _avgLossPerUnit, uint256 _expenseRatio, uint256 _profitRatio) {
        frequency = _frequency;
        avgLossPerUnit = _avgLossPerUnit;
        expenseRatio = _expenseRatio;
        profitRatio = _profitRatio;
    }

    function calculatePremium() public view returns (uint256 _premium) {
        return avgLossPerUnit.div(10**decimals - (expenseRatio.add(profitRatio)));
    }
}