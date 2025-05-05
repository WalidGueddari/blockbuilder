import DeployedContractsPage from '@/components/modules/v1/smartcontract/deployed-contracts';
import ProtectedRoute from '@/views/private-route';

export default function Home() {
  return (
    <div>
      <ProtectedRoute>
        <DeployedContractsPage />
      </ProtectedRoute>
    </div>
  );
}
