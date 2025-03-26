'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { BarChart3, ChevronRight, Coins, FileCode, GitMerge, Network, Shield } from 'lucide-react';
import Link from 'next/link';

export function UseCasesSection() {
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

  const useCases = [
    {
      title: 'Custom Blockchain Network Design',
      description:
        'Build a bespoke blockchain network with specific consensus protocols, node configurations, and permissioning tailored to your requirements.',
      icon: <Network className="text-primary h-10 w-10" />,
      image: '/placeholder.svg?height=200&width=300',
    },
    {
      title: 'Token and NFT Creation',
      description:
        'Issue custom native tokens or non-fungible tokens (NFTs) to represent assets, rewards, or unique digital items for fundraising, loyalty programs, or digital art.',
      icon: <Coins className="text-primary h-10 w-10" />,
      image: '/placeholder.svg?height=200&width=300',
    },
    {
      title: 'Smart Contract Deployment',
      description:
        'Develop and deploy self-executing contracts that automate processes, enforce agreements, or power decentralized applications (dApps).',
      icon: <FileCode className="text-primary h-10 w-10" />,
      image: '/placeholder.svg?height=200&width=300',
    },
    {
      title: 'Permissioning and Security',
      description:
        'Implement granular access control over nodes and accounts, ensuring that only authorized parties can interact with the network, which is especially useful for enterprise or private blockchain deployments.',
      icon: <Shield className="text-primary h-10 w-10" />,
      image: '/placeholder.svg?height=200&width=300',
    },
    {
      title: 'Blockchain Explorer and Monitoring',
      description:
        'Create custom explorers and dashboards to track transactions, monitor network performance, and maintain real-time insights into your blockchain ecosystem.',
      icon: <BarChart3 className="text-primary h-10 w-10" />,
      image: '/placeholder.svg?height=200&width=300',
    },
    {
      title: 'Enterprise System Integration and Bridging',
      description:
        'Integrate blockchain networks with existing enterprise systems or connect multiple blockchains together (blockchain bridging) to enhance interoperability and streamline operations.',
      icon: <GitMerge className="text-primary h-10 w-10" />,
      image: '/placeholder.svg?height=200&width=300',
    },
  ];

  return (
    <section id="use-cases" className="bg-muted/50 relative w-full py-12 md:py-24 lg:py-32">
      <div className="to-background/10 pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent"></div>
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <div className="space-y-2">
            <Badge variant="outline">Use Cases</Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Build Your Own Blockchain Network
            </h2>
            <p className="text-muted-foreground max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              BlockBuilder enables you to create powerful blockchain solutions for a wide range of
              applications.
            </p>
          </div>
        </motion.div>
        <motion.div
          className="mx-auto grid max-w-6xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {useCases.map((useCase, i) => (
            <motion.div key={i} variants={scaleUp}>
              <motion.div
                whileHover={{
                  y: -5,
                  boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.2)',
                  transition: { duration: 0.2 },
                }}
                className="h-full"
              >
                <Card className="flex h-full flex-col overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="mb-3">{useCase.icon}</div>
                    <CardTitle>{useCase.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-muted-foreground">{useCase.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="group w-full" asChild>
                      <Link href={`/use-cases/${useCase.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        Learn more
                        <motion.span
                          initial={{ x: 0 }}
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </motion.span>
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Button
            size="lg"
            asChild
            className="from-primary hover:from-primary/90 bg-gradient-to-r to-purple-600 hover:to-purple-600/90"
          >
            <Link href="/consultation">Schedule a Consultation</Link>
          </Button>
          <p className="text-muted-foreground mt-4">
            Not sure which use case fits your needs? Our experts can help you identify the perfect
            solution.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
