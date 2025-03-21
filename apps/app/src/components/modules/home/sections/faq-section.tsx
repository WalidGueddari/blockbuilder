'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

export function FaqSection() {
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

  const faqs = [
    {
      question: 'Do I need coding experience to create my own blockchain?',
      answer:
        'No, BlockBuilder is designed to let anyone create their own blockchain network without writing a single line of code. Our visual interface handles all the complexity for you.',
    },
    {
      question: 'How customizable are the blockchain networks I create?',
      answer:
        'Extremely customizable. You can define your own consensus mechanism, block parameters, gas economics, governance structure, and more. If you can imagine it, you can build it with BlockBuilder.',
    },
    {
      question: 'Can I migrate my existing blockchain project to BlockBuilder?',
      answer:
        'Yes, we offer tools to help you import existing blockchain networks and smart contracts into BlockBuilder. Our support team can assist with complex migrations.',
    },
    {
      question: 'How scalable are the blockchain networks created with BlockBuilder?',
      answer:
        'Networks built with BlockBuilder are designed for scalability. You can start small and scale up as your user base grows, with options for sharding, Layer 2 solutions, and other scaling technologies.',
    },
    {
      question: 'What kind of performance can I expect from my blockchain network?',
      answer:
        'BlockBuilder-created networks can achieve thousands of transactions per second depending on your configuration. Our optimization tools help you balance security, decentralization, and performance.',
    },
    {
      question: 'Can I monetize my blockchain network?',
      answer:
        'Absolutely. You can create native tokens, set up transaction fees, implement staking rewards, and establish other economic models to monetize your blockchain network.',
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
        <motion.div
          className="mx-auto max-w-3xl space-y-4 py-12"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {faqs.map((faq, i) => (
            <motion.div key={i} variants={fadeIn} custom={i} transition={{ delay: i * 0.1 }}>
              <motion.div
                whileHover={{
                  y: -2,
                  boxShadow: '0 5px 20px -5px rgba(0, 0, 0, 0.1)',
                  transition: { duration: 0.2 },
                }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{faq.answer}</p>
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
