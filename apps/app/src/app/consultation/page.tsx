'use client';

import { Footer } from '@/components/modules/v1/home';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Blocks } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function ConsultationPage() {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  // Load Calendly script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <header className=" bg-background/95 supports-[backdrop-filter]:bg-background/60 fixed top-0 z-50 w-full border-b backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex">
              <Blocks className="text-primary h-6 w-6" />
              <span className="text-xl font-bold">BlockBuilder</span>
            </Link>
          </motion.div>
          <motion.nav
            className="hidden gap-6 md:flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          ></motion.nav>
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/login"
              className="hover:text-primary hidden text-sm font-medium transition-colors duration-300 sm:block"
            >
              Log in
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild>
                <Link href="">Get Started</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </header>
      <main className="flex-1 py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <motion.div
            className="mx-auto max-w-4xl"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <motion.div variants={fadeIn} className="mb-12 text-center">
              <h1 className="text-4xl font-bold tracking-tight">
                Book Your Free Blockchain Consultation
              </h1>
              <p className="text-muted-foreground mt-4 text-lg">
                Speak with our blockchain experts to discover the best solution for your business
                needs.
              </p>
            </motion.div>

            <motion.div
              className="bg-card overflow-hidden rounded-lg border p-6 shadow-sm md:p-8"
              variants={fadeIn}
            >
              {/* Calendly inline widget */}
              <div
                className="calendly-inline-widget"
                data-url="https://calendly.com/peaksoft/peakchain"
                style={{
                  minWidth: '320px',
                  height: '700px',
                }}
              ></div>
            </motion.div>

            <motion.div className="mt-8 text-center" variants={fadeIn}>
              <p className="text-muted-foreground">
                Can't find a suitable time?{' '}
                <Button variant="link" className="h-auto p-0">
                  Contact us
                </Button>{' '}
                directly and we'll arrange a custom appointment.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
