import { NetworkList } from '@/components/modules/network/pages';
// Import NetworkList component
import ProtectedRoute from '@/views/private-route';
import { Activity } from 'lucide-react';

export default function Home() {
  return (
    <div>
      <ProtectedRoute>
        <h2 className="text-primary mb-6 flex items-center text-2xl font-semibold">
          <Activity className="mr-2" /> Networks List
        </h2>
        <NetworkList />
      </ProtectedRoute>
    </div>
  );
}
