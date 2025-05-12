import { ContractConfig } from '../types';

export const generateERC20Code = (config: ContractConfig): string => {
  let code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
`;
  if (config.mintable)
    code += `import "@openzeppelin/contracts/access/AccessControl.sol";
`;
  if (config.burnable)
    code += `import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
`;
  if (config.pausable)
    code += `import "@openzeppelin/contracts/security/Pausable.sol";
`;

  code += `

contract ${config.name || 'MyToken'} is ERC20`;
  if (config.mintable) code += `, AccessControl`;
  if (config.burnable) code += `, ERC20Burnable`;
  if (config.pausable) code += `, Pausable`;
  code += ` {
`;

  if (config.mintable) {
    code += `    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
`;
  }
  if (config.pausable) {
    code += `    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
`;
  }

  code += `
    constructor() ERC20("${config.name || 'MyToken'}", "${config.symbol || 'MTK'}") {
`;
  if (config.mintable) {
    code += `        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
`;
  }
  if (config.pausable) {
    code += `        _grantRole(PAUSER_ROLE, msg.sender);
`;
  }
  code += `    }

`;
  if (config.mintable) {
    code += `    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

`;
  }
  if (config.pausable) {
    code += `    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }
`;
  }
  code += `}
`;
  return code;
};
