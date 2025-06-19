import ClientProvider from '@/components/providers/client-provider';
import { Toaster } from '@/components/ui/toaster';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

// Import the ClientProvider
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BlockBuilder beta',
  description: 'A BlockChain Builder To Create A Customized BlockChain Network',
  icons: '../../public/logo icon white.png',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProvider>
          <Toaster />
          {children}
        </ClientProvider>
      </body>
    </html>
  );
}
