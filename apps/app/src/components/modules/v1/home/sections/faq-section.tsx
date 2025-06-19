'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const scaleUp = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.4 },
    },
    exit: {
      scale: 0.95,
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  const faqs = [
    {
      question: 'What is BlockBuilder no-code blockchain platform?',
      answer:
        'BlockBuilder is a no-code platform that lets anyone create, customize, and launch their own blockchain network without writing code. It’s ideal for startups, enterprises, developers, and non-tech users looking to build private or public blockchains fast.',
    },
    {
      question: 'Can I build a blockchain without coding skills?',
      answer:
        'Yes. BlockBuilder is 100% no-code. You don’t need any technical background—just use our drag-and-drop interface to configure your blockchain and go live in minutes.',
    },
    {
      question: 'How customizable is a BlockBuilder blockchain?',
      answer: `Highly customizable. You can fully configure your network with:\n- Consensus mechanisms (PoS, PoA, etc.)\n- Custom tokenomics and governance rules\n- Adjustable block time and size\n- Role-based access and permissioning\n- Native token support\nBuild a blockchain tailored to your business, industry, or community.`,
    },
    {
      question: 'Can I migrate my existing blockchain or smart contracts to BlockBuilder?',
      answer:
        'Yes. BlockBuilder supports migration from existing blockchains. Easily import smart contracts and network settings using our migration tools.\nFor complex migrations, our expert support team is available to assist.',
    },
    {
      question: 'How scalable is a blockchain built with BlockBuilder?',
      answer: `Scalable by design. BlockBuilder supports:\n- Layer 2 integration\n- Sharding and parallel processing\n- Modular infrastructure for large user bases\nWhether you're building for 100 or 1 million users, your network can grow seamlessly.`,
    },
    {
      question: 'What’s the transaction speed (TPS) on BlockBuilder?',
      answer:
        'BlockBuilder blockchains can process thousands of transactions per second (TPS) depending on your setup. You’ll also get tools to fine-tune performance, decentralization, and security.',
    },
    {
      question: 'Can I monetize my blockchain?',
      answer: `Absolutely. You can generate revenue by:\n- Creating and selling native tokens\n- Charging transaction fees\n- Offering staking and validator rewards\n- Designing your own token economy\nMonetize your blockchain however you choose.`,
    },
    {
      question: 'Is BlockBuilder secure?',
      answer: `Yes. Security is built in. Features include:\n- Enterprise-grade encryption\n- Role-based access control\n- Network permissioning\n- Compliance-ready infrastructure\n- Real-time monitoring and updates`,
    },
    {
      question: 'Can I build private or public blockchains with BlockBuilder?',
      answer: `Yes. Choose your deployment:\n- Private blockchains for internal use, consortiums, or regulated environments\n- Public blockchains for open, decentralized applications\nYou control who can access, read, and validate the network.`,
    },
    {
      question: 'How fast can I launch a blockchain?',
      answer:
        'Launch your blockchain in under 30 minutes. With no-code setup and pre-built modules, most users go live in minutes—no long development cycles, no delays.',
    },
    {
      question: 'Does BlockBuilder offer customer support and updates?',
      answer: `Yes. Every BlockBuilder plan includes:\n- Ongoing support via email and chat\n- Regular feature updates and improvements\n- Security patches and performance enhancements\nWe help you launch—and scale—with confidence.`,
    },
    {
      question: 'How much does it cost to use BlockBuilder?',
      answer: `Pricing depends on your needs. We offer flexible plans for:\n- Individuals and startups\n- Enterprises and government use\n- Educational and research projects`,
    },
    {
      question: 'What industries use BlockBuilder?',
      answer: `BlockBuilder supports use cases in:\n- DeFi and Web3\n- Supply chain and logistics\n- Gaming and NFTs\n- Healthcare and identity\n- Government and education\nAny sector needing secure, custom blockchain solutions can use BlockBuilder.`,
    },
    {
      question: 'Does BlockBuilder support ERC-20 and other token standards?',
      answer:
        'Yes. BlockBuilder supports major token standards including ERC-20, ERC-721, and custom token models. Ideal for DeFi, NFTs, and enterprise tokenization.',
    },
    {
      question: 'Can I integrate BlockBuilder with Web3 tools?',
      answer:
        'Yes. BlockBuilder is Web3-ready and supports integration with wallets, explorers, bridges, APIs, and other dApps through built-in modules or external APIs.',
    },
    {
      question: 'How does BlockBuilder compare to other no-code blockchain platforms?',
      answer: `BlockBuilder offers:\n- Greater customizability\n- Faster launch time\n- Enterprise-grade security\n- Integrated migration tools\n- Better support`,
    },
  ];

  return (
    <section id="faq" className="relative w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <div className="space-y-2">
            <Badge variant="outline">FAQ</Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Find answers to common questions about BlockBuilder.
            </p>
          </div>
        </motion.div>
        <div className="mx-auto mt-12 max-w-3xl space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleUp}
            >
              <Card onClick={() => toggleIndex(i)} className="cursor-pointer px-6 py-4 text-left">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold">{faq.question}</h3>
                  <ChevronDown
                    className={cn('mt-1 h-5 w-5 transition-transform', {
                      'rotate-180': openIndex === i,
                    })}
                  />
                </div>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.pre
                      className="text-muted-foreground mt-2 whitespace-pre-wrap text-sm"
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={scaleUp}
                    >
                      {faq.answer}
                    </motion.pre>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
