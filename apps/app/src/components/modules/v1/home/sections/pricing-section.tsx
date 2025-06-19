'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export function PricingSection() {
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

  const monthlyPlans = [
    {
      name: 'Kickstart',
      price: '499€',
      description: 'Perfect for startups and small projects',
      features: [
        'Fundamental blockchain creation',
        'Custom Native token',
        '1 smart contract deployment monthly',
        'Basic support',
      ],
      cta: 'Buy',
      popular: false,
    },
    {
      name: 'Growth',
      price: '1,499€',
      description: 'Ideal for growing businesses and teams',
      features: [
        'Advanced blockchain setup',
        'Custom Native token',
        '1 custom token contract',
        '3 smart contract deployments monthly',
        '1 NFT minting monthly',
        'Blockchain Explorer',
        'Enhanced support',
      ],
      cta: 'Buy',
      popular: true,
    },
    {
      name: 'Scale',
      price: '2,999€',
      description: 'For established businesses with complex needs',
      features: [
        'Enterprise-grade blockchain implementation',
        'Custom Native token',
        '5 custom token contracts',
        '10 smart contract deployments monthly',
        '15 NFT minting monthly',
        'Nodes and Accounts Permissioning',
        'Blockchain Explorer',
        'Monitoring Dashboard',
        'IPFS Integration',
        'Dedicated account manager',
        'Premium support',
      ],
      cta: 'Buy',
      popular: false,
    },
    {
      name: 'Visionary',
      price: 'Contact Us',
      description: 'For large organizations with custom requirements',
      features: [
        'Use case analysis',
        'Custom blockchain design',
        'Custom tokens/NFT minting',
        'Custom Smart Contracts deployment',
        'Nodes and Accounts Permissioning',
        'Custom Blockchain Explorer',
        'Custom Monitoring Dashboard',
        'IPFS Integration',
        'Privacy Features',
        'Enterprise system integration',
        'Blockchain bridging',
        'Top-tier support',
      ],
      cta: 'Contact Us',
      popular: false,
    },
  ];

  // Annual plans with 10% discount
  const annualPlans = monthlyPlans.map((plan) => {
    if (plan.price === 'Contact Us') return plan;

    const monthlyPrice = Number.parseInt(plan.price.replace(/[^0-9]/g, ''));
    const annualPrice = Math.round(monthlyPrice * 0.9); // 10% discount

    return {
      ...plan,
      price: `${annualPrice}€`,
      description: `${plan.description} (Save 10%)`,
    };
  });

  return (
    <section id="pricing" className="relative w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <div className="space-y-2">
            <Badge variant="outline">Pricing</Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Blockchain Building Plans
            </h2>
            <p className="text-muted-foreground max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Choose the plan that's right for your business, from startups to enterprise solutions.
            </p>
          </div>
        </motion.div>
        <Tabs defaultValue="monthly" className="mx-auto mt-8 w-full max-w-6xl">
          <motion.div
            className="mb-8 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="annual">Annual (Save 10%)</TabsTrigger>
            </TabsList>
          </motion.div>
          <TabsContent value="monthly">
            <motion.div
              className="grid gap-6 lg:grid-cols-4 lg:grid-rows-1"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {monthlyPlans.map((plan, i) => (
                <motion.div key={i} variants={scaleUp} className="flex h-full">
                  <motion.div
                    className={`flex h-full w-full flex-col ${plan.popular ? 'border-primary relative shadow-lg' : ''}`}
                    whileHover={{
                      y: -10,
                      boxShadow: '0 20px 40px -20px rgba(0, 0, 0, 0.2)',
                      transition: { duration: 0.3 },
                    }}
                  >
                    <Card className="flex h-full flex-col">
                      {plan.popular && (
                        <motion.div
                          className="absolute right-0 top-0 -translate-y-2 translate-x-2 transform"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 10,
                            delay: 0.5,
                          }}
                        >
                          <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                        </motion.div>
                      )}
                      <CardHeader>
                        <CardTitle>{plan.name}</CardTitle>
                        <motion.div
                          className="mt-4 flex items-baseline text-4xl font-extrabold"
                          initial={{ scale: 0.8, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          viewport={{ once: true }}
                        >
                          {plan.price}
                          {plan.price !== 'Contact Us' && (
                            <span className="text-muted-foreground ml-1 text-xl font-medium">
                              /month
                            </span>
                          )}
                        </motion.div>
                        <CardDescription className="mt-2">{plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <motion.ul
                          className="space-y-3"
                          variants={staggerContainer}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true }}
                        >
                          {plan.features.map((feature, j) => (
                            <motion.li
                              key={j}
                              className="flex items-start"
                              variants={fadeIn}
                              custom={j}
                              transition={{ delay: j * 0.05 }}
                            >
                              <CheckCircle className="text-primary mr-2 mt-1 h-4 w-4 shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </motion.li>
                          ))}
                        </motion.ul>
                      </CardContent>
                      <CardFooter>
                        <motion.div
                          className="w-full"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            className="w-full"
                            variant={plan.popular ? 'default' : 'outline'}
                            asChild
                          >
                            <Link href="/consultation">{plan.cta}</Link>
                          </Button>
                        </motion.div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>
          <TabsContent value="annual">
            <motion.div
              className="grid gap-6 lg:grid-cols-4 lg:grid-rows-1"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {annualPlans.map((plan, i) => (
                <motion.div key={i} variants={scaleUp} className="flex h-full">
                  <motion.div
                    className={`flex h-full w-full flex-col ${plan.popular ? 'border-primary relative shadow-lg' : ''}`}
                    whileHover={{
                      y: -10,
                      boxShadow: '0 20px 40px -20px rgba(0, 0, 0, 0.2)',
                      transition: { duration: 0.3 },
                    }}
                  >
                    <Card className="flex h-full flex-col">
                      {plan.popular && (
                        <motion.div
                          className="absolute right-0 top-0 -translate-y-2 translate-x-2 transform"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 10,
                            delay: 0.5,
                          }}
                        >
                          <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                        </motion.div>
                      )}
                      <CardHeader>
                        <CardTitle>{plan.name}</CardTitle>
                        <motion.div
                          className="mt-4 flex items-baseline text-4xl font-extrabold"
                          initial={{ scale: 0.8, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          viewport={{ once: true }}
                        >
                          {plan.price}
                          {plan.price !== 'Contact Us' && (
                            <span className="text-muted-foreground ml-1 text-xl font-medium">
                              /month
                            </span>
                          )}
                        </motion.div>
                        <CardDescription className="mt-2">{plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <motion.ul
                          className="space-y-3"
                          variants={staggerContainer}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true }}
                        >
                          {plan.features.map((feature, j) => (
                            <motion.li
                              key={j}
                              className="flex items-start"
                              variants={fadeIn}
                              custom={j}
                              transition={{ delay: j * 0.05 }}
                            >
                              <CheckCircle className="text-primary mr-2 mt-1 h-4 w-4 shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </motion.li>
                          ))}
                        </motion.ul>
                      </CardContent>
                      <CardFooter>
                        <motion.div
                          className="w-full"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            className="w-full"
                            variant={plan.popular ? 'default' : 'outline'}
                            asChild
                          >
                            <Link href="/consultation">{plan.cta}</Link>
                          </Button>
                        </motion.div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Link href="/consultation">
            <Button
              size="lg"
              variant="outline"
              className="bg-background border-primary text-primary hover:bg-primary/5"
            >
              Book a Free Consultation
            </Button>
          </Link>
          <p className="text-muted-foreground mt-2 text-sm">
            Not sure which plan is right for you? Schedule a free consultation with our experts.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
