'use client';

import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { BarChart, Server, Settings } from 'lucide-react';

export function HowItWorksSection() {
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

  const slideIn = {
    hidden: { x: -60, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.6 },
    },
  };

  const steps = [
    {
      step: '01',
      title: 'Select Your Network Name & Configuration',
      description:
        'Choose a unique network name (or chain identifier) and set all the configuration parameters. These parameters include the node count, consensus protocols, and any other deployment settings needed to structure your blockchain.',
      icon: <Settings className="text-primary h-12 w-12" />,
    },
    {
      step: '02',
      title: 'Deploy Your Network',
      description:
        'With your configuration in place, deploy your blockchain network. This step handles all the technical setup and launches your network securely and efficiently.',
      icon: <Server className="text-primary h-12 w-12" />,
    },
    {
      step: '03',
      title: 'Monitor & Manage',
      description:
        'Once live, use our built-in tools to monitor network performance, manage nodes, and scale your blockchain as your needs evolve.',
      icon: <BarChart className="text-primary h-12 w-12" />,
    },
  ];

  return (
    <section id="how-it-works" className="bg-muted/50 relative w-full py-12 md:py-24 lg:py-32">
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
            <Badge variant="outline">How It Works</Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Build Your Blockchain in 3 Simple Steps
            </h2>
            <p className="text-muted-foreground max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our platform simplifies the blockchain development process so you can focus on
              creating value.
            </p>
          </div>
        </motion.div>

        <div className="mt-16">
          <motion.div
            className="mx-auto grid max-w-5xl items-start gap-12 py-12 md:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {steps.map((step, i) => (
              <motion.div
                key={i}
                className="relative flex flex-col items-center pt-10"
                variants={slideIn}
              >
                {/* Step number badge - positioned consistently for all steps */}
                <motion.div
                  className="bg-primary text-primary-foreground absolute left-1/2 top-0 -translate-x-1/2 rounded-full px-3 py-1 text-sm font-bold"
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                >
                  {step.step}
                </motion.div>

                <motion.div
                  className="bg-primary/10 mb-6 flex h-24 w-24 items-center justify-center rounded-full"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(var(--primary), 0.15)' }}
                  transition={{ duration: 0.3 }}
                >
                  {step.icon}
                </motion.div>

                <h3 className="text-center text-xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground mt-2 text-center">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <motion.a
            href="/demo"
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex items-center justify-center rounded-md px-6 py-3 text-lg font-medium shadow transition-colors focus-visible:outline-none focus-visible:ring-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            See It In Action
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
