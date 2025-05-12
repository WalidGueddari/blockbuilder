import { ContractConfig } from '../types';

export const generateERC1155Code = (config: ContractConfig): string => {
  let code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
`;
  if (config.pausable)
    code += `import "@openzeppelin/contracts/security/Pausable.sol";
`;
  code += `import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract ${config.name || 'MyMultiToken'} is ERC1155, AccessControl`;
  if (config.pausable) code += `, Pausable`;
  code += `, ERC1155Burnable, ERC1155Supply {
    bytes32 public constant URI_SETTER_ROLE = keccak256("URI_SETTER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
`;
  if (config.pausable) {
    code += `    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
`;
  }
  code += `
    constructor() ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(URI_SETTER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
`;
  if (config.pausable) {
    code += `        _grantRole(PAUSER_ROLE, msg.sender);
`;
  }
  code += `    }

    function setURI(string memory newuri) public onlyRole(URI_SETTER_ROLE) {
        _setURI(newuri);
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
    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        public
        onlyRole(MINTER_ROLE)
    {
        _mint(account, id, amount, data);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyRole(MINTER_ROLE)
    {
        _mintBatch(to, ids, amounts, data);
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    )
        internal
        override(ERC1155, ERC1155Supply)
        ${config.pausable ? 'whenNotPaused' : ''}
    {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
`;
  return code;
};
