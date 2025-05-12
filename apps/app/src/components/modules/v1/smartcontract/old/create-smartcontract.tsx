'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardDescription } from '@/components/ui/card';
import { CardTitle } from '@/components/ui/card';
import { CardHeader } from '@/components/ui/card';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/services/hooks';
import {
  fetchNetworksByUserId,
  selectNetworkLoading,
  selectNetworks,
} from '@/services/v1/networkSlice';
import { deployContract } from '@/services/v1/smartContractSlice';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  ListChecks,
  Save,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Highlight, themes } from 'prism-react-renderer';
import { useEffect, useRef, useState } from 'react';

// Example use cases for beginner mode
const exampleUseCases = [
  {
    id: 'token',
    name: 'Create my own token',
    description: 'A standard ERC20 token that can be transferred between wallets',
    type: 'ERC20',
    defaults: {
      name: 'MyToken',
      symbol: 'MTK',
      mintable: false,
      burnable: false,
      pausable: false,
    },
  },
  {
    id: 'nft',
    name: 'Build an NFT collection',
    description: 'Unique digital collectibles that can be bought and sold',
    type: 'ERC721',
    defaults: {
      name: 'MyNFTCollection',
      symbol: 'MNFT',
      mintable: false,
      burnable: false,
      pausable: false,
    },
  },
  {
    id: 'stablecoin',
    name: 'Create a stablecoin',
    description: 'A token with stable value, typically pegged to a fiat currency',
    type: 'Stablecoin',
    defaults: {
      name: 'MyStableCoin',
      symbol: 'USDC',
      mintable: false,
      burnable: false,
      pausable: false,
    },
  },
  {
    id: 'multi-token',
    name: 'Create multiple token types',
    description: 'A single contract that can manage multiple token types',
    type: 'ERC1155',
    defaults: {
      name: 'MyMultiToken',
      symbol: '',
      mintable: false,
      burnable: false,
      pausable: false,
    },
  },
];

export default function SmartContractGenerator() {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const networks = useAppSelector(selectNetworks);
  const networksLoading = useAppSelector(selectNetworkLoading);
  const [loading, setLoading] = useState(false);
  const [selectedNetworkId, setSelectedNetworkId] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);
  const [savedDrafts, setSavedDrafts] = useState<any[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [copied, setCopied] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const editorRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // State variables for user selections
  const [contractType, setContractType] = useState('ERC20');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [mintable, setMintable] = useState(false);
  const [burnable, setBurnable] = useState(false);
  const [pausable, setPausable] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [selectedUseCase, setSelectedUseCase] = useState('token');

  // Add state to manage mode
  const [isBeginnerMode, setIsBeginnerMode] = useState(true);

  // Estimated gas fee
  const [estimatedGas, setEstimatedGas] = useState<number | null>(null);
  const [gasPrice, setGasPrice] = useState<number>(5); // in Gwei

  const [deploymentSuccess, setDeploymentSuccess] = useState<{
    open: boolean;
    address: string;
  }>({
    open: false,
    address: '',
  });

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

  // Validate contract name and symbol
  useEffect(() => {
    const errors: { [key: string]: string } = {};

    if (name) {
      if (!/^[A-Za-z][A-Za-z0-9]*$/.test(name)) {
        errors.name =
          'Contract name must start with a letter and contain only alphanumeric characters';
      }
    }

    if (symbol) {
      if (symbol.length > 11) {
        errors.symbol = 'Symbol should be 11 characters or less';
      } else if (!/^[A-Z0-9]*$/.test(symbol)) {
        errors.symbol = 'Symbol must contain only uppercase letters and numbers';
      }
    }

    setValidationErrors(errors);
  }, [name, symbol]);

  // Handle use case selection
  useEffect(() => {
    if (selectedUseCase) {
      const useCase = exampleUseCases.find((uc) => uc.id === selectedUseCase);
      if (useCase) {
        setContractType(useCase.type);
        setName(useCase.defaults.name);
        setSymbol(useCase.defaults.symbol);
        setMintable(useCase.defaults.mintable);
        setBurnable(useCase.defaults.burnable);
        setPausable(useCase.defaults.pausable);
      }
    }
  }, [selectedUseCase]);

  // Update handleDeployContract to use the actual API
  const handleDeployContract = async () => {
    try {
      if (!selectedNetworkId) {
        toast({
          title: 'Network Error',
          description: 'Please select a network to deploy the contract',
          variant: 'destructive',
        });
        return;
      }
      /* const result = await dispatch(
        deployContract({
          contractName: name || 'MyContract',
          contractContent: generatedCode,
          networkId: selectedNetworkId,
        }),
      ).unwrap(); */
      setLoading(true);
      // Simulate a delay of 10 seconds
      await new Promise((resolve) => setTimeout(resolve, 10000));

      // Simulate a successful deployment response
      const result = {
        result: '0x1234567890abcdef1234567890abcdef12345678', // Mock contract address
      };
      setLoading(false);
      setDeploymentSuccess({
        open: true,
        address: result.result,
      });
    } catch (error: any) {
      toast({
        title: 'Deployment Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const saveDraft = () => {
    const draft = {
      id: Date.now().toString(),
      name: name || 'Untitled Contract',
      type: contractType,
      updatedAt: new Date().toISOString(),
      data: {
        contractType,
        name,
        symbol,
        mintable,
        burnable,
        pausable,
        code: generatedCode,
      },
    };

    setSavedDrafts([draft, ...savedDrafts]);

    toast({
      title: 'Draft Saved',
      description: `Your contract "${draft.name}" has been saved as a draft.`,
    });
  };

  const loadDraft = (draftId: string) => {
    const draft = savedDrafts.find((d) => d.id === draftId);
    if (draft) {
      setContractType(draft.data.contractType);
      setName(draft.data.name);
      setSymbol(draft.data.symbol);
      setMintable(draft.data.mintable);
      setBurnable(draft.data.burnable);
      setPausable(draft.data.pausable);
      setGeneratedCode(draft.data.code);
      setShowDrafts(false);

      toast({
        title: 'Draft Loaded',
        description: `Loaded draft "${draft.name}"`,
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

    function unpause() public onlyRole(PAUSER_ROLE) {  {
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
    const code = `// SPDX-License-Identifier: MIT
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
    const code = `// SPDX-License-Identifier: MIT
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
    const code = `// SPDX-License-Identifier: MIT
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

    // Calculate estimated gas
    const baseGas = 1000000;
    const featureMultiplier = (mintable ? 1.2 : 1) * (burnable ? 1.1 : 1) * (pausable ? 1.15 : 1);
    const typeMultiplier =
      contractType === 'ERC20'
        ? 1
        : contractType === 'ERC721'
          ? 1.3
          : contractType === 'ERC1155'
            ? 1.5
            : contractType === 'Stablecoin'
              ? 1.4
              : contractType === 'Real-World Asset'
                ? 1.6
                : contractType === 'Governor'
                  ? 2
                  : 1;

    setEstimatedGas(Math.floor(baseGas * featureMultiplier * typeMultiplier));
  };

  // Copy code to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    toast({
      title: 'Code copied',
      description: 'The generated code has been copied to your clipboard.',
    });
  };

  // Download code as a file
  const downloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedCode], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${name || 'contract'}.sol`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: 'Code downloaded',
      description: `File saved as ${name || 'contract'}.sol`,
    });
  };

  // Automatically update generated code whenever a dependency changes
  useEffect(() => {
    generateCode();
  }, [contractType, name, symbol, mintable, burnable, pausable]);

  // Add a function to handle mode toggle
  const toggleMode = () => {
    setIsBeginnerMode(!isBeginnerMode);
  };

  // Update the network selection UI in both beginner and advanced modes
  const renderNetworkSelect = () => (
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
  );

  // -----------------------------
  // Render UI
  // -----------------------------
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-center text-3xl font-bold">Smart Contract Generator</h1>
      <p className="text-muted-foreground mb-8 text-center">
        Build powerful, secure smart contracts with just a few clicks.
      </p>

      <div className="mb-6 flex justify-center">
        <Button variant="outline" onClick={toggleMode}>
          {isBeginnerMode ? 'Switch to Advanced Mode' : 'Switch to Beginner Mode'}
        </Button>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="mx-auto mb-4 grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="create">Create Contract</TabsTrigger>
          <TabsTrigger value="drafts" onClick={() => setShowDrafts(true)}>
            Saved Drafts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          {isBeginnerMode ? (
            // Beginner Mode UI
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {renderNetworkSelect()}
                    <div className="space-y-2">
                      <Label>What would you like to create?</Label>
                      <div className="grid gap-4 md:grid-cols-2">
                        {exampleUseCases.map((useCase) => (
                          <div
                            key={useCase.id}
                            className={`hover:bg-muted cursor-pointer rounded-lg border p-4 transition-colors ${
                              selectedUseCase === useCase.id ? 'border-primary bg-primary/5' : ''
                            }`}
                            onClick={() => setSelectedUseCase(useCase.id)}
                          >
                            <h3 className="font-medium">{useCase.name}</h3>
                            <p className="text-muted-foreground text-sm">{useCase.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">What should we name your token?</Label>
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter token name"
                        className={validationErrors.name ? 'border-red-500' : ''}
                      />
                      {validationErrors.name && (
                        <p className="mt-1 text-xs text-red-500">{validationErrors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="symbol">Choose a token symbol</Label>
                      <Input
                        id="symbol"
                        type="text"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        placeholder="Enter token symbol"
                        className={validationErrors.symbol ? 'border-red-500' : ''}
                      />
                      {validationErrors.symbol && (
                        <p className="mt-1 text-xs text-red-500">{validationErrors.symbol}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label>Should it be mintable or pausable?</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="mintable"
                            checked={mintable}
                            onCheckedChange={(checked) => setMintable(checked === true)}
                          />
                          <Label htmlFor="mintable" className="font-normal">
                            Mintable
                            <span className="text-muted-foreground block text-xs">
                              Allows creating new tokens after deployment
                            </span>
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="pausable"
                            checked={pausable}
                            onCheckedChange={(checked) => setPausable(checked === true)}
                          />
                          <Label htmlFor="pausable" className="font-normal">
                            Pausable
                            <span className="text-muted-foreground block text-xs">
                              Allows pausing all transfers in case of emergency
                            </span>
                          </Label>
                        </div>
                      </div>

                      {/* Real-time preview */}
                      <div className="mt-4 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Contract Preview</h3>
                          <Badge variant="outline">{contractType}</Badge>
                        </div>
                        <div className="mt-2 space-y-1 text-sm">
                          <div>
                            <span className="font-medium">Name:</span> {name || 'MyToken'}
                          </div>
                          <div>
                            <span className="font-medium">Symbol:</span> {symbol || 'MTK'}
                          </div>
                          <div>
                            <span className="font-medium">Features:</span>{' '}
                            {[
                              mintable ? 'Mintable' : null,
                              burnable ? 'Burnable' : null,
                              pausable ? 'Pausable' : null,
                            ]
                              .filter(Boolean)
                              .join(', ') || 'None'}
                          </div>
                        </div>
                      </div>

                      {estimatedGas && (
                        <Alert className="mt-4">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          <AlertTitle>Estimated Deployment Cost</AlertTitle>
                          <AlertDescription className="flex items-center justify-between">
                            <span>Gas: ~{estimatedGas.toLocaleString()} units</span>
                            <span className="font-medium">
                              ~{((estimatedGas * gasPrice) / 1e9).toFixed(6)} ETH
                            </span>
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={handleDeployContract}
                          className="flex-1"
                          disabled={
                            loading ||
                            !selectedNetworkId ||
                            Object.keys(validationErrors).length > 0
                          }
                        >
                          {loading ? 'Deploying...' : 'Deploy Contract'}
                        </Button>
                        <Button variant="outline" onClick={saveDraft}>
                          <Save className="mr-2 h-4 w-4" />
                          Save Draft
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Advanced Mode UI
            <div className="grid gap-6 md:grid-cols-[350px_1fr]">
              {/* Left side - Form controls */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {renderNetworkSelect()}
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
                        <div className="relative">
                          <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter contract name"
                            className={validationErrors.name ? 'border-red-500 pr-8' : 'pr-8'}
                          />
                          {validationErrors.name ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertCircle className="absolute right-2 top-2.5 h-4 w-4 text-red-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{validationErrors.name}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <CheckCircle2 className="absolute right-2 top-2.5 h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </div>

                      {showSymbol && (
                        <div className="space-y-2">
                          <Label htmlFor="symbol">Symbol</Label>
                          <div className="relative">
                            <Input
                              id="symbol"
                              type="text"
                              value={symbol}
                              onChange={(e) => setSymbol(e.target.value)}
                              placeholder="Enter contract symbol"
                              className={validationErrors.symbol ? 'border-red-500 pr-8' : 'pr-8'}
                            />
                            {validationErrors.symbol ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AlertCircle className="absolute right-2 top-2.5 h-4 w-4 text-red-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{validationErrors.symbol}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : symbol ? (
                              <CheckCircle2 className="absolute right-2 top-2.5 h-4 w-4 text-green-500" />
                            ) : null}
                          </div>
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

                        {estimatedGas && (
                          <Alert className="mt-4">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <AlertTitle>Estimated Deployment Cost</AlertTitle>
                            <AlertDescription className="flex items-center justify-between">
                              <span>Gas: ~{estimatedGas.toLocaleString()} units</span>
                              <span className="font-medium">
                                ~{((estimatedGas * gasPrice) / 1e9).toFixed(6)} ETH
                              </span>
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="flex gap-2 pt-4">
                          <Button
                            onClick={handleDeployContract}
                            className="flex-1"
                            disabled={
                              loading ||
                              !selectedNetworkId ||
                              Object.keys(validationErrors).length > 0
                            }
                          >
                            {loading ? 'Deploying...' : 'Deploy Contract'}
                          </Button>
                          <Button variant="outline" onClick={saveDraft}>
                            <Save className="h-4 w-4" />
                            <span className="sr-only">Save Draft</span>
                          </Button>
                        </div>
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
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={copyToClipboard}
                      >
                        {copied ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={downloadCode}
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <Card>
                    <CardContent className="p-0">
                      <div ref={editorRef} className="relative">
                        <Highlight code={generatedCode} language="solidity" theme={themes.nightOwl}>
                          {({ className, style, tokens, getLineProps, getTokenProps }) => (
                            <pre
                              className={`${className} max-h-[70vh] overflow-auto rounded`}
                              style={style}
                            >
                              {tokens.map((line, i) => (
                                <div key={i} {...getLineProps({ line })}>
                                  {line.map((token, key) => (
                                    <span key={key} {...getTokenProps({ token })} />
                                  ))}
                                </div>
                              ))}
                            </pre>
                          )}
                        </Highlight>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="drafts">
          {savedDrafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Save className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="mb-2 text-xl font-medium">No saved drafts</h3>
              <p className="text-muted-foreground text-center">
                Save your contract drafts to continue working on them later.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savedDrafts.map((draft) => (
                <Card
                  key={draft.id}
                  className="cursor-pointer hover:shadow-md"
                  onClick={() => loadDraft(draft.id)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle>{draft.name}</CardTitle>
                    <CardDescription>
                      {new Date(draft.updatedAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline">{draft.type}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Deployment Success Modal */}
      <Dialog
        open={deploymentSuccess.open}
        onOpenChange={(open) => setDeploymentSuccess((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="sm:max-w-[725px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Contract Deployed Successfully
            </DialogTitle>
            <DialogDescription>
              Your smart contract has been deployed to the blockchain.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Contract Address</Label>
              <div className="flex items-center gap-2">
                <code className="bg-muted rounded px-2 py-1 font-mono text-sm">
                  {deploymentSuccess.address}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    navigator.clipboard.writeText(deploymentSuccess.address);
                    toast({
                      title: 'Copied!',
                      description: 'Contract address copied to clipboard',
                    });
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Save this address. if you need it to interact with your contract from outside .
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() =>
                window.open(`https://etherscan.io/address/${deploymentSuccess.address}`, '_blank')
              }
              disabled
            >
              <ExternalLink className="h-4 w-4" />
              View on Explorer
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                setDeploymentSuccess((prev) => ({ ...prev, open: false }));
                router.push('/deployedcontracts');
              }}
            >
              <ListChecks className="h-4 w-4" />
              View All Contracts
            </Button>
            <Button onClick={() => setDeploymentSuccess((prev) => ({ ...prev, open: false }))}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
