'use client';

import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function CtaSection() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

  const scaleUp = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  // Pulse animation for CTA buttons
  const pulseAnimation = {
    scale: [1, 1.03, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'reverse' as const,
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
      const url = baseUrl ? `${baseUrl.replace(/\/$/, '')}/contact` : '/api/v1/contact';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Thank you! We have received your email.');
        setEmail('');
        toast && toast({ title: 'Success', description: 'Contact email sent!' });
      } else {
        setMessage(data.message || 'Failed to send. Please try again.');
        toast && toast({ title: 'Error', description: data.message || 'Failed to send.' });
      }
    } catch (err: any) {
      setMessage('Something went wrong. Please try again.');
      toast && toast({ title: 'Error', description: 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="cta"
      className={`w-full py-12 md:py-24 lg:py-32 ${
        isDarkMode
          ? 'from-primary/80 text-primary-foreground bg-gradient-to-br to-purple-900'
          : 'from-primary text-primary-foreground bg-gradient-to-br to-purple-700'
      } relative overflow-hidden`}
    >
      <div className="bg-grid-white/10 bg-grid-8 absolute inset-0 opacity-10"></div>
      <motion.div
        className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-purple-500 opacity-30 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: 'reverse',
        }}
      />
      <motion.div
        className="bg-primary absolute -bottom-40 -left-40 h-80 w-80 rounded-full opacity-30 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: 'reverse',
          delay: 2,
        }}
      />
      <div className="container relative z-10 px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Ready to Launch Your Blockchain?
            </h2>
            <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join innovators and builders creating the next generation of blockchain networks with
              zero coding required.
            </p>
          </div>
          <motion.div className="mx-auto w-full max-w-sm space-y-2" variants={scaleUp}>
            <form className="flex flex-col gap-2 sm:flex-row" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="border-input bg-background/80 ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm text-white backdrop-blur-sm transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:text-black"
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button type="submit" variant="secondary" className="shrink-0" disabled={loading}>
                  {loading ? 'Sending...' : 'Get Started'}
                </Button>
              </motion.div>
            </form>
            {message && <p className="text-primary-foreground/80 mt-2 text-xs">{message}</p>}
            <p className="text-primary-foreground/80 text-xs">
              By signing up, you agree to our{' '}
              <Link href="/" className="hover:text-primary-foreground underline underline-offset-2">
                Terms & Conditions
              </Link>
            </p>
          </motion.div>
          <motion.div className="mt-4 flex gap-4" variants={staggerContainer}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              variants={scaleUp}
              animate={pulseAnimation}
            >
              <Button size="lg" variant="secondary" asChild>
                <Link href="/">Start Free Trial</Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} variants={scaleUp}>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
                asChild
              >
                <Link href="/consultation">Schedule a Consultation</Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
