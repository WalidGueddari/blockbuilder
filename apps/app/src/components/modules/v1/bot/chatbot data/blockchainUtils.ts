// utils/blockchainUtils.ts
import { Category, Question, Responses } from './types';

export const processInitialInput = (userInput: string): boolean => {
  return userInput.toLowerCase().includes('blockchain');
};

export const dynamicQuestionSelection = (userInput: string): Question[] => {
  const lowerInput = userInput.toLowerCase();
  const categories: Category[] = [
    {
      keywords: ['coin', 'crypto'],
      questions: [
        {
          question: 'What is the primary purpose of your coin?',
          choices: ['Utility', 'Community', 'Investment', 'Other'],
        },
        {
          question: 'Do you have any specific tokenomics or features in mind for your coin?',
          choices: ['Yes, I have detailed plans', "No, I don't have specific plans", 'Not sure'],
        },
      ],
    },
    {
      keywords: ['blockchain', 'block chain'],
      questions: [
        {
          question: 'What type of blockchain network are you planning?',
          choices: ['Public', 'Private', 'Consortium'],
        },
        {
          question: 'Do you want to use an existing blockchain platform or build one from scratch?',
          choices: ['Existing platform', 'Build from scratch', 'Not sure'],
        },
      ],
    },
    {
      keywords: ['smart contract', 'smart contracts'],
      questions: [
        {
          question: 'What types of smart contracts will you deploy?',
          choices: ['Token contracts', 'DeFi', 'NFTs', 'dApps', 'Other'],
        },
        {
          question: 'Which programming language do you prefer for writing your smart contracts?',
          choices: ['Solidity', 'Vyper', 'Rust', 'Other'],
        },
      ],
    },
    {
      keywords: ['transaction', 'transactions'],
      questions: [
        {
          question: 'What transaction volume do you expect?',
          choices: ['Low', 'Medium', 'High'],
        },
        {
          question: 'What is your priority between speed and cost efficiency for transactions?',
          choices: ['Speed', 'Cost Efficiency', 'Balanced'],
        },
      ],
    },
    {
      keywords: ['node', 'nodes'],
      questions: [
        {
          question: 'How many nodes do you plan to operate initially?',
          choices: ['1-5', '6-10', 'More than 10', 'Not sure'],
        },
        {
          question: 'Where will your nodes be hosted?',
          choices: ['Cloud', 'On-premises', 'Hybrid', 'Not sure'],
        },
      ],
    },
    {
      keywords: ['consensus'],
      questions: [
        {
          question: 'Do you have a preferred consensus mechanism?',
          choices: ['Proof-of-Work', 'Proof-of-Stake', 'IBFT', 'QBFT', 'Not sure'],
        },
      ],
    },
    {
      keywords: ['enterprise', 'business', 'corporate', 'supply chain', 'logistics'],
      questions: [
        {
          question:
            'Are there any enterprise-specific requirements (e.g., integration with legacy systems or regulatory compliance)?',
          choices: ['Yes', 'No', 'Not sure'],
        },
        {
          question: 'Do you need a permissioned network for enhanced control and security?',
          choices: ['Yes', 'No', 'Not sure'],
        },
      ],
    },
    {
      keywords: ['scalability', 'performance', 'throughput', 'latency'],
      questions: [
        {
          question: 'What scalability goals do you have?',
          choices: ['High throughput', 'Low latency', 'Global distribution', 'Not sure'],
        },
        {
          question: 'Do you anticipate the need for sharding or layer-2 solutions?',
          choices: ['Yes', 'No', 'Not sure'],
        },
      ],
    },
    {
      keywords: ['privacy', 'secure', 'confidential'],
      questions: [
        {
          question: 'Do you require advanced privacy features?',
          choices: ['Yes', 'No', 'Not sure'],
        },
      ],
    },
    {
      keywords: ['cost', 'budget', 'expense'],
      questions: [
        {
          question: 'What is your budget range for setting up and maintaining the network?',
          choices: ['Low', 'Medium', 'High', 'Not sure'],
        },
      ],
    },
    {
      keywords: ['defi', 'decentralized finance'],
      questions: [
        {
          question: 'Are you planning to implement any DeFi applications on your blockchain?',
          choices: ['Yes', 'No', 'Not sure'],
        },
        {
          question: 'What types of financial services do you expect your blockchain to support?',
          choices: ['Lending', 'Staking', 'Yield Farming', 'Other', 'Not sure'],
        },
      ],
    },
    {
      keywords: ['nft', 'non-fungible'],
      questions: [
        {
          question: 'Do you plan to incorporate NFTs into your blockchain project?',
          choices: ['Yes', 'No', 'Not sure'],
        },
        {
          question: 'What type of NFT functionality are you considering?',
          choices: ['Art', 'Collectibles', 'Real Estate', 'Other', 'Not sure'],
        },
      ],
    },
    {
      keywords: ['iot', 'internet of things'],
      questions: [
        {
          question: 'Will your blockchain network support IoT devices?',
          choices: ['Yes', 'No', 'Not sure'],
        },
        {
          question: 'What scale of IoT connectivity are you planning (number of devices)?',
          choices: [
            'Small scale (<100 devices)',
            'Medium scale (100-1000 devices)',
            'Large scale (>1000 devices)',
            'Not sure',
          ],
        },
      ],
    },
    {
      keywords: ['dapp', 'decentralized app'],
      questions: [
        {
          question: 'What kind of decentralized application are you planning to build?',
          choices: ['Gaming', 'Finance', 'Social', 'Other', 'Not sure'],
        },
        {
          question: 'What features and functionalities should your dApp have?',
          choices: ['Voting', 'Asset management', 'Messaging', 'Other', 'Not sure'],
        },
      ],
    },
  ];

  const questions: Question[] = [];

  // Iterate over categories and add questions if any keyword matches
  categories.forEach((category) => {
    category.keywords.forEach((keyword: string) => {
      if (lowerInput.includes(keyword)) {
        questions.push(...category.questions);
        return; // Break out of the current category to avoid duplicates
      }
    });
  });

  // Fallback if no keywords are detected
  if (questions.length === 0) {
    questions.push({
      question:
        'Could you provide more details about your project requirements? For example, what are your main goals and challenges?',
      choices: [],
    });
  }

  return questions;
};

export const generateRecommendation = (responses: Responses): string => {
  let recommendation = '';

  // Blockchain network type
  const netType = responses['What type of blockchain network are you planning?'];
  if (netType) {
    if (netType === 'Public') {
      recommendation +=
        'For a public blockchain, consider a decentralized approach with robust security measures.\n';
    } else if (netType === 'Private') {
      recommendation +=
        'A private blockchain might be suitable if you need controlled access and faster transactions.\n';
    } else if (netType === 'Consortium') {
      recommendation +=
        'A consortium blockchain is ideal for multi-organizational collaboration and shared governance.\n';
    } else if (netType === 'Not sure') {
      recommendation +=
        'Since you are not sure about the network type, consider a consortium model for flexibility—it can be adapted later toward public or private as your needs become clearer.\n';
    }
  }

  // Consensus mechanism
  const consensus = responses['Do you have a preferred consensus mechanism?'];
  if (consensus) {
    if (consensus === 'Proof-of-Work' || consensus === 'Proof-of-Stake') {
      recommendation += `Using ${consensus} requires adequate resources (e.g., mining infrastructure or staking), so plan accordingly.\n`;
    } else if (consensus === 'IBFT' || consensus === 'QBFT') {
      recommendation += `Your selection of ${consensus} suggests a focus on efficiency, especially for enterprise use cases.\n`;
    } else if (consensus === 'Not sure') {
      recommendation +=
        'If you are not sure about the consensus mechanism, consider Proof-of-Stake for its energy efficiency or IBFT for enterprise scenarios—both offer a balanced approach.\n';
    }
  }

  // Number of nodes
  const nodes = responses['How many nodes do you plan to operate initially?'];
  if (nodes) {
    if (nodes === '1-5') {
      recommendation +=
        'Starting with a small number of nodes is ideal for testing or a proof-of-concept.\n';
    } else if (nodes === '6-10') {
      recommendation +=
        'A moderate number of nodes can help balance cost with network resilience.\n';
    } else if (nodes === 'More than 10') {
      recommendation +=
        'A larger node count indicates plans for high scalability and network robustness.\n';
    } else if (nodes === 'Not sure') {
      recommendation +=
        'If you are not sure about the initial number of nodes, consider starting small and scaling as your project grows.\n';
    }
  }

  // Node hosting
  const hosting = responses['Where will your nodes be hosted?'];
  if (hosting) {
    if (hosting === 'Cloud') {
      recommendation +=
        'Cloud hosting offers flexibility and scalability, making it a good starting point.\n';
    } else if (hosting === 'On-premises') {
      recommendation +=
        'On-premises hosting provides greater control and security, but may involve higher upfront costs and maintenance.\n';
    } else if (hosting === 'Hybrid') {
      recommendation += 'A hybrid hosting model can balance control with scalability.\n';
    } else if (hosting === 'Not sure') {
      recommendation +=
        'If you are not sure about node hosting, a cloud-based solution or hybrid model offers flexibility.\n';
    }
  }

  // Scalability goals
  const scalability = responses['What scalability goals do you have?'];
  if (scalability) {
    if (scalability === 'High throughput') {
      recommendation +=
        'For high throughput, optimize your network design and consider layer-2 solutions.\n';
    } else if (scalability === 'Low latency') {
      recommendation +=
        'Low latency is essential for real-time applications; design your network to minimize delays.\n';
    } else if (scalability === 'Global distribution') {
      recommendation +=
        'A globally distributed network enhances accessibility and redundancy across regions.\n';
    } else if (scalability === 'Not sure') {
      recommendation +=
        'If you are not sure about your scalability goals, start with a balanced approach that allows for gradual scaling as demand increases.\n';
    }
  }

  // Sharding / Layer-2
  const layer2 = responses['Do you anticipate the need for sharding or layer-2 solutions?'];
  if (layer2) {
    if (layer2 === 'Yes') {
      recommendation +=
        'Integrating sharding or layer-2 solutions can significantly enhance scalability.\n';
    } else if (layer2 === 'No') {
      recommendation +=
        'Without layer-2, ensure your main chain is optimized for your expected load.\n';
    } else if (layer2 === 'Not sure') {
      recommendation +=
        'If you are not sure, you might start without layer-2 and consider integrating it later as your network grows.\n';
    }
  }

  // Privacy features
  const privacy = responses['Do you require advanced privacy features?'];
  if (privacy) {
    if (privacy === 'Yes') {
      recommendation +=
        'Advanced privacy features (e.g., zero-knowledge proofs) can enhance data security and user trust.\n';
    } else if (privacy === 'No') {
      recommendation +=
        'If privacy is not a top priority, a standard security approach might suffice.\n';
    } else if (privacy === 'Not sure') {
      recommendation +=
        'If you are uncertain about privacy needs, evaluate the sensitivity of your data and consider adding privacy features later if needed.\n';
    }
  }

  // Budget
  const budget = responses['What is your budget range for setting up and maintaining the network?'];
  if (budget) {
    if (budget === 'Low') {
      recommendation +=
        'A low budget suggests starting with essential features and scaling gradually.\n';
    } else if (budget === 'Medium') {
      recommendation +=
        'A medium budget offers flexibility to include moderate features and scalability options.\n';
    } else if (budget === 'High') {
      recommendation +=
        'A high budget allows for robust infrastructure and advanced functionalities from the start.\n';
    } else if (budget === 'Not sure') {
      recommendation +=
        'If you are not sure about your budget, consider starting with a modular design that can be expanded as funds become available.\n';
    }
  }

  // DeFi applications
  const defi = responses['Are you planning to implement any DeFi applications on your blockchain?'];
  if (defi) {
    if (defi === 'Yes') {
      recommendation +=
        'Implementing DeFi requires robust smart contract support and careful security measures.\n';
    } else if (defi === 'No') {
      recommendation +=
        'If DeFi is not a focus, you can simplify your network design accordingly.\n';
    } else if (defi === 'Not sure') {
      recommendation +=
        'If you are unsure about DeFi, consider potential opportunities but start by focusing on core network functionalities.\n';
    }
  }

  // NFT functionality
  const nft = responses['Do you plan to incorporate NFTs into your blockchain project?'];
  if (nft) {
    if (nft === 'Yes') {
      recommendation +=
        'NFT integration will require specific smart contract capabilities for tokenization and asset management.\n';
    } else if (nft === 'No') {
      recommendation +=
        'Without NFT functionality, your smart contract requirements may be simpler.\n';
    } else if (nft === 'Not sure') {
      recommendation +=
        'If you are not sure about NFTs, evaluate if digital asset tokenization aligns with your business model.\n';
    }
  }

  // IoT support
  const iot = responses['Will your blockchain network support IoT devices?'];
  if (iot) {
    if (iot === 'Yes') {
      recommendation +=
        'Supporting IoT devices can add significant scalability challenges; plan your infrastructure accordingly.\n';
    } else if (iot === 'No') {
      recommendation +=
        'Without IoT support, you can focus on optimizing the network for standard transactions.\n';
    } else if (iot === 'Not sure') {
      recommendation +=
        'If you are not sure about IoT support, assess the connectivity needs of your application and start with a flexible design that can integrate IoT later if required.\n';
    }
  }

  // dApp type
  const dapp = responses['What kind of decentralized application are you planning to build?'];
  if (dapp) {
    if (dapp === 'Gaming') {
      recommendation +=
        'For gaming dApps, focus on high throughput and low latency to ensure a smooth user experience.\n';
    } else if (dapp === 'Finance') {
      recommendation +=
        'For finance-related dApps, security and regulatory compliance should be your primary concerns.\n';
    } else if (dapp === 'Social') {
      recommendation += 'Social dApps require scalability and user-friendly interfaces.\n';
    } else if (dapp === 'Other') {
      recommendation +=
        'For other dApp types, focus on building a flexible and modular architecture.\n';
    } else if (dapp === 'Not sure') {
      recommendation +=
        'If you are not sure about the dApp category, consider starting with a core set of functionalities that can be extended later.\n';
    }
  }

  // dApp features
  const dappFeatures = responses['What features and functionalities should your dApp have?'];
  if (dappFeatures) {
    if (dappFeatures === 'Voting') {
      recommendation +=
        'Voting functionality requires a transparent and secure blockchain design.\n';
    } else if (dappFeatures === 'Asset management') {
      recommendation +=
        'Asset management features need robust smart contracts and strong security measures.\n';
    } else if (dappFeatures === 'Messaging') {
      recommendation += 'Messaging features require low latency and efficient data handling.\n';
    } else if (dappFeatures === 'Other') {
      recommendation +=
        'For other features, ensure your dApp is designed for flexibility and future enhancements.\n';
    } else if (dappFeatures === 'Not sure') {
      recommendation +=
        'If you are not sure about the required features, it might be best to start with a minimal viable set and iterate based on user feedback.\n';
    }
  }

  return (
    recommendation ||
    'Based on your responses, further analysis is needed to provide a tailored recommendation.'
  );
};
