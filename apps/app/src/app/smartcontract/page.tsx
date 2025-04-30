import SmartContractGenerator from '@/components/modules/v1/smartcontract/create-overview';
import ProtectedRoute from '@/views/private-route';

export default function Home() {
  return (
    <div>
      <ProtectedRoute>
        <SmartContractGenerator />
      </ProtectedRoute>
    </div>
  );
}
