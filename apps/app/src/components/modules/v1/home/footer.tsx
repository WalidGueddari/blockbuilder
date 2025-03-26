'use client';

import { motion } from 'framer-motion';
import { Blocks } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
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

  const footerSections = [
    {
      title: 'Product',
      links: [
        { name: 'Features', href: '#features' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Integrations', href: '/integrations' },
        { name: 'Changelog', href: '/changelog' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', href: '/docs' },
        { name: 'Guides', href: '/guides' },
        { name: 'Blog', href: '/blog' },
        { name: 'Support', href: '/support' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Contact', href: '/contact' },
        { name: 'Partners', href: '/partners' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy', href: '/privacy' },
        { name: 'Terms', href: '/terms' },
        { name: 'Security', href: '/security' },
        { name: 'Cookies', href: '/cookies' },
      ],
    },
  ];

  const socialLinks = [
    { icon: 'twitter', href: '#' },
    { icon: 'linkedin', href: '#' },
    { icon: 'discord', href: '#' },
  ];

  return (
    <footer className="bg-background relative z-10 w-full border-t">
      <div className="container flex flex-col gap-8 px-4 py-10 md:px-6 lg:flex-row lg:gap-12">
        <motion.div
          className="flex flex-col gap-4 lg:w-1/3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-2">
            <Blocks className="text-primary h-6 w-6" />
            <span className="text-xl font-bold">BlockBuilder</span>
          </div>
          <p className="text-muted-foreground">
            The all-in-one platform for building blockchain applications without code.
          </p>
          <div className="flex gap-4">
            {socialLinks.map((social, i) => (
              <motion.div key={i} whileHover={{ scale: 1.2, y: -2 }} whileTap={{ scale: 0.9 }}>
                <Link
                  href={social.href}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  {social.icon === 'twitter' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                    </svg>
                  )}
                  {social.icon === 'linkedin' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect width="4" height="12" x="2" y="9"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  )}
                  {social.icon === 'discord' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M12 2H2v10h10V2zM22 2h-8v10h8V2zM12 14H2v8h10v-8zM22 14h-8v8h8v-8z"></path>
                    </svg>
                  )}
                  <span className="sr-only">{social.icon}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div
          className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {footerSections.map((section, i) => (
            <motion.div key={i} className="space-y-3" variants={fadeIn}>
              <h3 className="text-sm font-medium">{section.title}</h3>
              <motion.ul
                className="space-y-2"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {section.links.map((link, j) => (
                  <motion.li key={j} variants={fadeIn} custom={j} transition={{ delay: j * 0.05 }}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
      <div className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 md:px-6 lg:flex-row">
          <motion.p
            className="text-muted-foreground text-center text-sm lg:text-left"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            © {new Date().getFullYear()} BlockBuilder. All rights reserved.
          </motion.p>
          <motion.p
            className="text-muted-foreground text-center text-sm lg:text-left"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Built with ❤️ for the blockchain community
          </motion.p>
        </div>
      </div>
    </footer>
  );
}
