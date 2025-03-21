'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export function TrustedBySection() {
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

  return (
    <section id="trusted-by" className="bg-muted/50 relative w-full py-12 md:py-24 lg:py-32">
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
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Trusted by Innovative Companies
            </h2>
            <p className="text-muted-foreground max-w-[900px] md:text-xl">
              Join hundreds of businesses building the future with BlockBuilder
            </p>
          </div>
          <motion.div
            className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16"
            variants={staggerContainer}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                className="flex items-center justify-center"
                variants={scaleUp}
                whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
              >
                <Image
                  src={`/placeholder.svg`}
                  alt={`Company logo ${i}`}
                  width={180}
                  height={60}
                  className="opacity-70 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0"
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
