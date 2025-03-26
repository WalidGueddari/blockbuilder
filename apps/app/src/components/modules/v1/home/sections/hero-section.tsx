'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function HeroSection() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted && resolvedTheme === 'dark';

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

  // Pulse animation for CTA buttons
  const pulseAnimation = {
    scale: [1, 1.03, 1],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: 'reverse' as const,
    },
  };

  return (
    <section
      id="home"
      className={`relative h-screen w-full overflow-hidden py-24 md:py-32 lg:py-40 xl:py-48 ${
        isDarkMode ? 'bg-background' : 'bg-white'
      }`}
    >
      {/* Background gradient elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className={`absolute -top-40 right-[10%] h-[500px] w-[500px] rounded-full ${
            isDarkMode ? 'bg-primary/10' : 'bg-primary/5'
          } blur-[100px]`}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: 'reverse',
          }}
        />
        <motion.div
          className={`absolute -bottom-40 left-[10%] h-[400px] w-[400px] rounded-full ${
            isDarkMode ? 'bg-purple-900/20' : 'bg-purple-500/5'
          } blur-[100px]`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: 'reverse',
            delay: 1,
          }}
        />
      </div>

      <div className="container relative z-10 px-4 md:px-6">
        <motion.div
          className="mx-auto flex max-w-4xl flex-col items-center justify-center space-y-6 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <motion.div variants={fadeIn}>
            <Badge className="mb-4 inline-flex" variant="secondary">
              Now in Beta
            </Badge>
            <Badge className="mb-4 ml-2 inline-flex bg-green-500/20 text-green-600 transition-colors hover:bg-green-500/30">
              Zero Code Required
            </Badge>
          </motion.div>

          <motion.h1
            className={`text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl ${
              isDarkMode
                ? 'text-white'
                : 'from-primary bg-gradient-to-r to-purple-600 bg-clip-text text-transparent'
            }`}
            variants={fadeIn}
          >
            Build Your Own Blockchain Network With Zero Code
          </motion.h1>

          <motion.p
            className="text-muted-foreground mx-auto mt-4 max-w-3xl text-lg md:text-xl lg:text-2xl"
            variants={fadeIn}
          >
            BlockBuilder is the all-in-one platform that lets you create, customize, and deploy your
            own blockchain networks without writing a single line of code. Launch your network in
            minutes, not months.
          </motion.p>

          <motion.div
            className="mt-8 flex w-full flex-col justify-center gap-4 sm:flex-row"
            variants={fadeIn}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={pulseAnimation}
            >
              <Button
                size="lg"
                asChild
                className="from-primary hover:from-primary/90 bg-gradient-to-r to-purple-600 px-8 text-lg hover:to-purple-600/90"
              >
                <Link href="/signup">
                  Create Your Blockchain <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" variant="outline" asChild className="px-8 text-lg">
                <Link href="#demo">Watch Demo</Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-base md:text-lg"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {['No coding required', 'Deploy in minutes', 'Enterprise-grade security'].map(
              (item, i) => (
                <motion.div key={i} className="flex items-center" variants={fadeIn}>
                  <CheckCircle className="text-primary mr-2 h-5 w-5" />
                  <span>{item}</span>
                </motion.div>
              ),
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
