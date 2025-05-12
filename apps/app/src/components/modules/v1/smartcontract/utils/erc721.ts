import { ContractConfig } from '../types';

export const generateERC721Code = (config: ContractConfig): string => {
  let code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
`;
  if (config.mintable)
    code += `import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
`;
  code += `import "@openzeppelin/contracts/access/AccessControl.sol";
`;
  if (config.burnable)
    code += `import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
`;
  if (config.pausable)
    code += `import "@openzeppelin/contracts/security/Pausable.sol";
`;
  code += `import "@openzeppelin/contracts/utils/Counters.sol";

contract ${config.name || 'MyNFT'} is ERC721`;
  if (config.mintable) code += `, ERC721URIStorage`;
  code += `, AccessControl`;
  if (config.burnable) code += `, ERC721Burnable`;
  if (config.pausable) code += `, Pausable`;
  code += ` {
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
`;
  if (config.pausable) {
    code += `    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
`;
  }
  code += `    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("${config.name || 'MyNFT'}", "${config.symbol || 'MNFT'}") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
`;
  if (config.pausable) {
    code += `        _grantRole(PAUSER_ROLE, msg.sender);
`;
  }
  code += `    }

`;
  if (config.mintable) {
    code += `    function safeMint(address to, string memory uri) public onlyRole(MINTER_ROLE) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
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

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
`;
  }
  code += `
    // Overrides required by Solidity
`;
  if (config.mintable) {
    code += `    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
`;
  }
  code += `
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721${config.mintable ? ', ERC721URIStorage' : ''}, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
`;
  return code;
};
