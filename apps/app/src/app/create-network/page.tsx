import { NetworkCreateOverview } from '@/components/modules/v2/network';
import ProtectedRoute from '@/views/private-route';

export default function Home() {
  return (
    <div>
      <ProtectedRoute>
        <NetworkCreateOverview />
      </ProtectedRoute>
    </div>
  );
}
