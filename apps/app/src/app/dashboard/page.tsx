import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProtectedRoute from '@/views/private-route';
import { Activity, Globe, Server } from 'lucide-react';

export default function DashboardPage() {
  const cards = [
    {
      title: 'Total Networks',
      value: 3,
      description: '2 active networks',
      icon: <Globe className="h-4 w-4 text-blue-500" />,
    },
    {
      title: 'Active Nodes',
      value: 12,
      description: 'Across all networks',
      icon: <Server className="h-4 w-4 text-purple-500" />,
    },
    {
      title: 'Total Operations',
      value: '1,284',
      description: 'Last 30 days',
      icon: <Activity className="h-4 w-4 text-cyan-500" />,
    },
  ];
  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div>
          <h1 className="bg-gradient-to-br from-white to-gray-400 bg-clip-text text-3xl font-bold tracking-tighter text-transparent">
            Welcome Back
          </h1>
          <p className="mt-2 text-gray-400">Here's an overview of your infrastructure</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card, index) => (
            <Card key={index} className="border-gray-800 bg-black/40 backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">{card.title}</CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{card.value}</div>
                <p className="mt-1 text-xs text-gray-400">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
