// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC777/ERC777.sol";

contract I3Token is ERC777 {
    constructor(uint256 initialSupply, address[] memory defaultOperators)
        ERC777("i3 Insurance Token", "i3", defaultOperators)
    {
        _mint(msg.sender, initialSupply, "", "");
    }
}
