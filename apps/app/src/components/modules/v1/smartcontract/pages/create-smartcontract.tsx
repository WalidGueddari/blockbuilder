'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/services/hooks';
import { AppDispatch, RootState } from '@/services/store';
import {
  fetchNetworksByUserId,
  selectNetworkLoading,
  selectNetworks,
} from '@/services/v1/networkSlice';
import { deployContract } from '@/services/v1/smartContractSlice';
import { Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function SmartContractGenerator() {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { loading, error } = useSelector((state: RootState) => state.smartContract);
  const networks = useAppSelector(selectNetworks);
  const networksLoading = useAppSelector(selectNetworkLoading);
  const [selectedNetworkId, setSelectedNetworkId] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);

  // State variables for user selections
  const [contractType, setContractType] = useState('ERC20');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [mintable, setMintable] = useState(false);
  const [burnable, setBurnable] = useState(false);
  const [pausable, setPausable] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  // Get user ID from sessionStorage
  useEffect(() => {
    try {
      const user = sessionStorage.getItem('user');
      if (!user) {
        toast({
          title: 'Authentication Error',
          description: 'You must be logged in to create a smart contract.',
          variant: 'destructive',
        });
        return;
      }

      const parsedUser = JSON.parse(user);
      if (!parsedUser?.id) {
        toast({
          title: 'Invalid User Data',
          description: 'Your session appears to be corrupted. Please log in again.',
          variant: 'destructive',
        });
        return;
      }

      setUserId(parsedUser.id);
    } catch (e) {
      console.error('Failed to parse user from sessionStorage:', e);
      toast({
        title: 'Session Error',
        description: 'There was a problem with your session. Please log in again.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Fetch networks when userId is available
  useEffect(() => {
    if (userId) {
      dispatch(fetchNetworksByUserId({ userId, page: 1, limit: 10 }));
    }
  }, [dispatch, userId]);

  // Determine which options should be visible based on contract type
  const handleDeployContract = async () => {
    if (!selectedNetworkId) {
      toast({
        title: 'Network Error',
        description: 'Please select a network to deploy the contract',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await dispatch(
        deployContract({
          contractName: name || 'MyContract',
          contractContent: generatedCode,
          networkId: selectedNetworkId,
        }),
      ).unwrap();

      toast({
        title: 'Deployed Successfully',
        description: `Contract deployed at address: ${result.result}`,
      });
    } catch (error: any) {
      toast({
        title: 'Deployment Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const showMintable =
    contractType === 'ERC20' || contractType === 'ERC721' || contractType === 'Custom';
  const showBurnable =
    contractType === 'ERC20' || contractType === 'ERC721' || contractType === 'Custom';
  const showPausable =
    contractType === 'ERC20' ||
    contractType === 'ERC721' ||
    contractType === 'ERC1155' ||
    contractType === 'Custom';
  const showSymbol = contractType !== 'ERC1155' && contractType !== 'Governor';

  const generateERC20Code = () => {
    let code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
`;
    if (mintable)
      code += `import "@openzeppelin/contracts/access/AccessControl.sol";
`;
    if (burnable)
      code += `import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
`;
    if (pausable)
      code += `import "@openzeppelin/contracts/security/Pausable.sol";
`;

    code += `

contract ${name || 'MyToken'} is ERC20`;
    if (mintable) code += `, AccessControl`;
    if (burnable) code += `, ERC20Burnable`;
    if (pausable) code += `, Pausable`;
    code += ` {
`;

    if (mintable) {
      code += `    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
`;
    }
    if (pausable) {
      code += `    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
`;
    }

    code += `
    constructor() ERC20("${name || 'MyToken'}", "${symbol || 'MTK'}") {
`;
    if (mintable) {
      code += `        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
`;
    }
    if (pausable) {
      code += `        _grantRole(PAUSER_ROLE, msg.sender);
`;
    }
    code += `    }

`;
    if (mintable) {
      code += `    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

`;
    }
    if (pausable) {
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

  const generateERC721Code = () => {
    let code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
`;
    if (mintable)
      code += `import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
`;
    code += `import "@openzeppelin/contracts/access/AccessControl.sol";
`;
    if (burnable)
      code += `import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
`;
    if (pausable)
      code += `import "@openzeppelin/contracts/security/Pausable.sol";
`;
    code += `import "@openzeppelin/contracts/utils/Counters.sol";

contract ${name || 'MyNFT'} is ERC721`;
    if (mintable) code += `, ERC721URIStorage`;
    code += `, AccessControl`;
    if (burnable) code += `, ERC721Burnable`;
    if (pausable) code += `, Pausable`;
    code += ` {
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
`;
    if (pausable) {
      code += `    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
`;
    }
    code += `    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("${name || 'MyNFT'}", "${symbol || 'MNFT'}") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
`;
    if (pausable) {
      code += `        _grantRole(PAUSER_ROLE, msg.sender);
`;
    }
    code += `    }

`;
    if (mintable) {
      code += `    function safeMint(address to, string memory uri) public onlyRole(MINTER_ROLE) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

`;
    }
    if (pausable) {
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
    if (mintable) {
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
        override(ERC721${mintable ? ', ERC721URIStorage' : ''}, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
`;
    return code;
  };

  const generateERC1155Code = () => {
    let code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
`;
    if (pausable)
      code += `import "@openzeppelin/contracts/security/Pausable.sol";
`;
    code += `import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract ${name || 'MyMultiToken'} is ERC1155, AccessControl`;
    if (pausable) code += `, Pausable`;
    code += `, ERC1155Burnable, ERC1155Supply {
    bytes32 public constant URI_SETTER_ROLE = keccak256("URI_SETTER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
`;
    if (pausable) {
      code += `    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
`;
    }
    code += `
    constructor() ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(URI_SETTER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
`;
    if (pausable) {
      code += `        _grantRole(PAUSER_ROLE, msg.sender);
`;
    }
    code += `    }

    function setURI(string memory newuri) public onlyRole(URI_SETTER_ROLE) {
        _setURI(newuri);
    }
`;
    if (pausable) {
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
        ${pausable ? 'whenNotPaused' : ''}
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

  const generateStablecoinCode = () => {
    let code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract ${name || 'MyStablecoin'} is ERC20, ERC20Burnable, Pausable, AccessControl {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BLACKLISTER_ROLE = keccak256("BLACKLISTER_ROLE");

    mapping(address => bool) private _blacklisted;

    constructor() ERC20("${name || 'MyStablecoin'}", "${symbol || 'STBL'}") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BLACKLISTER_ROLE, msg.sender);
    }

    function blacklist(address account) public onlyRole(BLACKLISTER_ROLE) {
        _blacklisted[account] = true;
    }

    function unBlacklist(address account) public onlyRole(BLACKLISTER_ROLE) {
        _blacklisted[account] = false;
    }

    function isBlacklisted(address account) public view returns (bool) {
        return _blacklisted[account];
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        require(!_blacklisted[from] && !_blacklisted[to], "Blacklisted address");
        super._beforeTokenTransfer(from, to, amount);
    }
}
`;
    return code;
  };

  const generateRealWorldAssetCode = () => {
    let code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract ${name || 'RealWorldAssetToken'} is ERC20, ERC20Burnable, Pausable, AccessControl {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");

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
    ) ERC20("${name || 'RealWorldAssetToken'}", "${symbol || 'RWA'}") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ROLE, msg.sender);

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

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
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

  const generateGovernorCode = () => {
    let code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

contract ${name || 'MyGovernor'} is Governor, GovernorSettings, GovernorCountingSimple, GovernorVotes, GovernorVotesQuorumFraction, GovernorTimelockControl {
    constructor(
        IVotes _token,
        TimelockController _timelock,
        uint256 _votingDelay,
        uint256 _votingPeriod,
        uint256 _proposalThreshold,
        uint256 _quorumPercentage
    )
        Governor("${name || 'MyGovernor'}")
        GovernorSettings(_votingDelay, _votingPeriod, _proposalThreshold)
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(_quorumPercentage)
        GovernorTimelockControl(_timelock)
    {}

    // Overrides required by Solidity
    function votingDelay() public view override(IGovernor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }

    function votingPeriod() public view override(IGovernor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber) public view override(IGovernor, GovernorVotesQuorumFraction) returns (uint256) {
        return super.quorum(blockNumber);
    }

    function state(uint256 proposalId) public view override(Governor, GovernorTimelockControl) returns (ProposalState) {
        return super.state(proposalId);
    }

    function propose(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, string memory description)
        public override(Governor, IGovernor)
        returns (uint256)
    {
        return super.propose(targets, values, calldatas, description);
    }

    function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.proposalThreshold();
    }

    function _execute(uint256 proposalId, address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
        internal override(Governor, GovernorTimelockControl)
    {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
        internal override(Governor, GovernorTimelockControl)
        returns (uint256)
    {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor() internal view override(Governor, GovernorTimelockControl) returns (address) {
        return super._executor();
    }

    function supportsInterface(bytes4 interfaceId) public view override(Governor, GovernorTimelockControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
`;
    return code;
  };

  const generateCustomCode = () => {
    let code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ${name || 'CustomContract'} {
    string public name = "${name || 'CustomContract'}";
    string public symbol = "${symbol || 'CC'}";

`;
    if (mintable) {
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
    if (burnable) {
      code += `    // Burnable functionality
    function burn(uint256 amount) public {
        // Implement burning logic here
    }

`;
    }
    if (pausable) {
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

  // -----------------------------
  // Main generateCode function
  // -----------------------------
  const generateCode = () => {
    let code = '';
    switch (contractType) {
      case 'ERC20':
        code = generateERC20Code();
        break;
      case 'ERC721':
        code = generateERC721Code();
        break;
      case 'ERC1155':
        code = generateERC1155Code();
        break;
      case 'Stablecoin':
        code = generateStablecoinCode();
        break;
      case 'Real-World Asset':
        code = generateRealWorldAssetCode();
        break;
      case 'Governor':
        code = generateGovernorCode();
        break;
      case 'Custom':
        code = generateCustomCode();
        break;
      default:
        code = `// Unsupported contract type`;
    }
    setGeneratedCode(code);
  };

  // Copy code to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    toast({
      title: 'Code copied',
      description: 'The generated code has been copied to your clipboard.',
    });
  };

  // Automatically update generated code whenever a dependency changes
  useEffect(() => {
    generateCode();
  }, [contractType, name, symbol, mintable, burnable, pausable]);

  // -----------------------------
  // Render UI
  // -----------------------------
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-center text-3xl font-bold">Smart Contract Generator</h1>
      <p className="text-muted-foreground mb-8 text-center">
        Generate Solidity smart contracts based on OpenZeppelin standards
      </p>

      <div className="grid gap-6 md:grid-cols-[350px_1fr]">
        {/* Left side - Form controls */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="network">Select Network</Label>
                  <Select value={selectedNetworkId} onValueChange={setSelectedNetworkId}>
                    <SelectTrigger id="network">
                      <SelectValue placeholder="Select a network" />
                    </SelectTrigger>
                    <SelectContent>
                      {networksLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading networks...
                        </SelectItem>
                      ) : networks.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No networks available
                        </SelectItem>
                      ) : (
                        networks.map((network) => (
                          <SelectItem key={network.id} value={network.id}>
                            {network.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contract-type">Contract Type</Label>
                  <Select value={contractType} onValueChange={setContractType}>
                    <SelectTrigger id="contract-type">
                      <SelectValue placeholder="Select contract type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ERC20">ERC20 Token</SelectItem>
                      <SelectItem value="ERC721">ERC721 NFT</SelectItem>
                      <SelectItem value="ERC1155">ERC1155 MultiToken</SelectItem>
                      <SelectItem value="Stablecoin">Stablecoin</SelectItem>
                      <SelectItem value="Real-World Asset">Real-World Asset</SelectItem>
                      <SelectItem value="Governor">Governor</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Contract Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter contract name"
                  />
                </div>

                {showSymbol && (
                  <div className="space-y-2">
                    <Label htmlFor="symbol">Symbol</Label>
                    <Input
                      id="symbol"
                      type="text"
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value)}
                      placeholder="Enter contract symbol"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <Label>Features</Label>
                  <div className="space-y-2">
                    {showMintable && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="mintable"
                          checked={mintable}
                          onCheckedChange={(checked) => setMintable(checked === true)}
                        />
                        <Label htmlFor="mintable" className="font-normal">
                          Mintable
                        </Label>
                      </div>
                    )}

                    {showBurnable && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="burnable"
                          checked={burnable}
                          onCheckedChange={(checked) => setBurnable(checked === true)}
                        />
                        <Label htmlFor="burnable" className="font-normal">
                          Burnable
                        </Label>
                      </div>
                    )}

                    {showPausable && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="pausable"
                          checked={pausable}
                          onCheckedChange={(checked) => setPausable(checked === true)}
                        />
                        <Label htmlFor="pausable" className="font-normal">
                          Pausable
                        </Label>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleDeployContract}
                    className="w-full"
                    disabled={loading || !selectedNetworkId}
                  >
                    {loading ? 'Deploying...' : 'Deploy Contract'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-muted-foreground text-center text-sm">
            Powered by OpenZeppelin contracts
          </div>
        </div>

        {/* Right side - Code display */}
        <div className="relative">
          <div className="sticky top-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-medium">Generated Solidity Code</h2>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4" /> Copy
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <pre className="max-h-[70vh] overflow-auto p-4 text-sm">
                  <code>{generatedCode}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
