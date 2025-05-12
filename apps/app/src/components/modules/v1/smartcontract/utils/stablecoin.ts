import { ContractConfig } from '../types';

export const generateStablecoinCode = (config: ContractConfig): string => {
  let code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
`;
  if (config.burnable)
    code += `import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
`;
  if (config.pausable)
    code += `import "@openzeppelin/contracts/security/Pausable.sol";
`;
  code += `import "@openzeppelin/contracts/access/AccessControl.sol";

contract ${config.name || 'MyStablecoin'} is ERC20`;
  if (config.burnable) code += `, ERC20Burnable`;
  if (config.pausable) code += `, Pausable`;
  code += `, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
`;
  if (config.pausable) {
    code += `    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
`;
  }
  code += `    bytes32 public constant BLACKLISTER_ROLE = keccak256("BLACKLISTER_ROLE");

    mapping(address => bool) private _blacklisted;

    constructor() ERC20("${config.name || 'MyStablecoin'}", "${config.symbol || 'STBL'}") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BLACKLISTER_ROLE, msg.sender);
`;
  if (config.pausable) {
    code += `        _grantRole(PAUSER_ROLE, msg.sender);
`;
  }
  code += `    }

    function blacklist(address account) public onlyRole(BLACKLISTER_ROLE) {
        _blacklisted[account] = true;
    }

    function unBlacklist(address account) public onlyRole(BLACKLISTER_ROLE) {
        _blacklisted[account] = false;
    }

    function isBlacklisted(address account) public view returns (bool) {
        return _blacklisted[account];
    }
`;
  if (config.pausable) {
    code += `
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }
`;
  }
  code += `
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        ${config.pausable ? 'whenNotPaused' : ''}
        override
    {
        require(!_blacklisted[from] && !_blacklisted[to], "Blacklisted address");
        super._beforeTokenTransfer(from, to, amount);
    }
}
`;
  return code;
};
