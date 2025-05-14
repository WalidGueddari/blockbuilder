import { SmartContract } from '@/components/modules/v1/smartcontract/create-contract-overview';
import ProtectedRoute from '@/views/private-route';

export default function Home() {
  return (
    <div>
      <ProtectedRoute>
        <SmartContract />
      </ProtectedRoute>
    </div>
  );
}
