import { NetworkListingOverview } from '@/components/modules/v1/network';
import ProtectedRoute from '@/views/private-route';

export default function Home() {
  return (
    <div>
      <ProtectedRoute>
        <NetworkListingOverview />
      </ProtectedRoute>
    </div>
  );
}
