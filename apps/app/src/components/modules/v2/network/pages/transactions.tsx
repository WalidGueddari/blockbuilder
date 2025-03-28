'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([
    {
      id: '1',
      hash: '0x1234...5678',
      from: '0xabcd...ef01',
      to: '0x2345...6789',
      value: '0.5 ETH',
      timestamp: '2023-05-15 14:30:45',
    },
    {
      id: '2',
      hash: '0x8765...4321',
      from: '0x2345...6789',
      to: '0xabcd...ef01',
      value: '1.2 ETH',
      timestamp: '2023-05-15 15:45:22',
    },
    {
      id: '3',
      hash: '0xfedc...ba98',
      from: '0x3456...7890',
      to: '0x4567...8901',
      value: '0.3 ETH',
      timestamp: '2023-05-15 16:12:08',
    },
    {
      id: '4',
      hash: '0xabcdef...1234',
      from: '0x4567...8901',
      to: '0x5678...9012',
      value: '2.5 ETH',
      timestamp: '2023-05-15 17:20:30',
    },
    {
      id: '5',
      hash: '0x9876...5432',
      from: '0x5678...9012',
      to: '0x6789...0123',
      value: '0.8 ETH',
      timestamp: '2023-05-15 18:15:10',
    },
    {
      id: '6',
      hash: '0x5432...1098',
      from: '0x6789...0123',
      to: '0x7890...1234',
      value: '1.0 ETH',
      timestamp: '2023-05-15 19:30:55',
    },
    {
      id: '7',
      hash: '0x2109...8765',
      from: '0x7890...1234',
      to: '0x8901...2345',
      value: '0.7 ETH',
      timestamp: '2023-05-15 20:45:12',
    },
    {
      id: '8',
      hash: '0x0987...6543',
      from: '0x8901...2345',
      to: '0x9012...3456',
      value: '1.5 ETH',
      timestamp: '2023-05-15 21:30:40',
    },
  ]);

  return (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 shadow-sm transition-all duration-200"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
              <Activity className="text-primary h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">{tx.hash}</p>
              <p className="text-muted-foreground text-xs">{tx.timestamp}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">{tx.value}</p>
            <p className="text-muted-foreground text-xs">
              From: {tx.from.substring(0, 6)}...
              {tx.from.substring(tx.from.length - 4)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
export default Transactions;
