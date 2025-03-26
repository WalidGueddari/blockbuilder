'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Blocks } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function Header() {
  const [activeSection, setActiveSection] = useState('');

  // Intersection Observer setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 },
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);

  return (
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
        >
          {[
            { name: 'Home', href: '#home' },
            { name: 'Features', href: '#features' },
            { name: 'How It Works', href: '#how-it-works' },
            { name: 'Pricing', href: '#pricing' },
            { name: 'FAQ', href: '#faq' },
          ].map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className={`hover:text-primary text-sm font-medium transition-all duration-300 ${activeSection === item.href.substring(1) ? 'text-primary' : ''}`}
            >
              {item.name}
              {activeSection === item.href.substring(1) && (
                <motion.div
                  className="bg-primary mt-0.5 h-0.5"
                  layoutId="activeSection"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </motion.nav>
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
              <Link href="/signup">Get Started</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
}
