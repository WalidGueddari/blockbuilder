'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Code,
  Coins,
  Database,
  FileCode,
  GitMerge,
  Search,
  Settings,
  Shield,
} from 'lucide-react';

export function FeaturesSection() {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const scaleUp = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const features = [
    {
      icon: <Settings className="text-primary h-10 w-10" />,
      title: 'Network Configuration & Setup',
      description:
        'Define core parameters such as the network name (chain identifier), node count, consensus mechanism, and permissioning rules.',
    },
    {
      icon: <Coins className="text-primary h-10 w-10" />,
      title: 'Custom Token & NFT Creation',
      description:
        'Tools to generate native tokens, deploy custom token contracts, and mint NFTs, allowing you to create digital assets tailored to your needs.',
    },
    {
      icon: <FileCode className="text-primary h-10 w-10" />,
      title: 'Smart Contract Deployment',
      description:
        'An interface to write, test, and deploy smart contracts easily, automating agreements and processes without intermediaries.',
    },
    {
      icon: <Shield className="text-primary h-10 w-10" />,
      title: 'Permissioning & Access Control',
      description:
        'Configure which nodes or accounts have access to different parts of your network, ensuring enhanced security and compliance.',
    },
    {
      icon: <Search className="text-primary h-10 w-10" />,
      title: 'Blockchain Explorer Integration',
      description:
        'Built-in tools or integrations that let you visualize transactions, blocks, and other on-chain data in real time.',
    },
    {
      icon: <BarChart3 className="text-primary h-10 w-10" />,
      title: 'Monitoring & Analytics Dashboards',
      description:
        'Real-time monitoring of network performance, node health, and transaction metrics to keep your system running smoothly.',
    },
    {
      icon: <Database className="text-primary h-10 w-10" />,
      title: 'Decentralized Storage Integration',
      description:
        'Support for decentralized file storage solutions like IPFS, enabling secure and distributed data management.',
    },
    {
      icon: <GitMerge className="text-primary h-10 w-10" />,
      title: 'Interoperability & Bridging',
      description:
        "Features that facilitate communication with other blockchains or enterprise systems, enhancing your network's utility and reach.",
    },
    {
      icon: <Code className="text-primary h-10 w-10" />,
      title: 'Developer Tools & APIs',
      description:
        'Access to robust APIs, SDKs, and documentation that help developers integrate and extend the platform seamlessly.',
    },
  ];

  return (
    <section id="features" className="bg-muted/50 relative w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <div className="space-y-2">
            <Badge variant="outline">Features</Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Everything You Need to Build on Blockchain
            </h2>
            <p className="text-muted-foreground max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              BlockBuilder provides all the tools you need to create powerful blockchain
              applications without writing a single line of code.
            </p>
          </div>
        </motion.div>
        <motion.div
          className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, i) => (
            <motion.div key={i} variants={scaleUp} className="h-full">
              <motion.div
                whileHover={{
                  y: -5,
                  boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.2)',
                  transition: { duration: 0.2 },
                }}
                className="h-full"
              >
                <Card className="border-t-primary/80 flex h-full flex-col border-t-4 text-center transition-all duration-300">
                  <CardHeader>
                    <motion.div
                      className="flex justify-center"
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <CardTitle className="mt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
