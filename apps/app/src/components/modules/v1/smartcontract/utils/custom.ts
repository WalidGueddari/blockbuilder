import { ContractConfig } from '../types';

export const generateCustomCode = (config: ContractConfig): string => {
  let code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ${config.name || 'CustomContract'} {
    string public name = "${config.name || 'CustomContract'}";
    string public symbol = "${config.symbol || 'CC'}";

`;
  if (config.mintable) {
    code += `    // Mintable functionality
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function mint(address to, uint256 amount) public {
        require(msg.sender == owner, "Only owner can mint");
        // Implement minting logic here
    }

`;
  }
  if (config.burnable) {
    code += `    // Burnable functionality
    function burn(uint256 amount) public {
        // Implement burning logic here
    }

`;
  }
  if (config.pausable) {
    code += `    // Pausable functionality
    bool public paused = false;

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    function pause() public {
        require(msg.sender == owner, "Only owner can pause");
        paused = true;
    }

    function unpause() public {
        require(msg.sender == owner, "Only owner can unpause");
        paused = false;
    }

`;
  }
  code += `    // Add your custom logic here
}
`;
  return code;
};
