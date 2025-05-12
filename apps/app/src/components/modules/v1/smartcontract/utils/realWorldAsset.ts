import { ContractConfig } from '../types';

export const generateRealWorldAssetCode = (config: ContractConfig): string => {
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

contract ${config.name || 'RealWorldAssetToken'} is ERC20`;
  if (config.burnable) code += `, ERC20Burnable`;
  if (config.pausable) code += `, Pausable`;
  code += `, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
`;
  if (config.pausable) {
    code += `    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
`;
  }
  code += `    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");

    // KYC/AML compliance mapping
    mapping(address => bool) private _compliant;

    // Asset metadata
    string public assetType;
    string public assetIdentifier;
    string public legalDocumentURI;

    constructor(
        string memory _assetType,
        string memory _assetIdentifier,
        string memory _legalDocumentURI
    ) ERC20("${config.name || 'RealWorldAssetToken'}", "${config.symbol || 'RWA'}") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ROLE, msg.sender);
`;
  if (config.pausable) {
    code += `        _grantRole(PAUSER_ROLE, msg.sender);
`;
  }
  code += `
        assetType = _assetType;
        assetIdentifier = _assetIdentifier;
        legalDocumentURI = _legalDocumentURI;
    }

    function setCompliance(address account, bool status) public onlyRole(COMPLIANCE_ROLE) {
        _compliant[account] = status;
    }

    function isCompliant(address account) public view returns (bool) {
        return _compliant[account];
    }

    function updateLegalDocumentURI(string memory newURI) public onlyRole(DEFAULT_ADMIN_ROLE) {
        legalDocumentURI = newURI;
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
        if (from != address(0)) {
            require(_compliant[from], "Sender not compliant");
        }
        if (to != address(0)) {
            require(_compliant[to], "Receiver not compliant");
        }
        super._beforeTokenTransfer(from, to, amount);
    }
}
`;
  return code;
};
