import DraftsPage from '@/components/modules/v1/smartcontract/drafts-page';
import ProtectedRoute from '@/views/private-route';

export default function Home() {
  return (
    <div>
      <ProtectedRoute>
        <DraftsPage />
      </ProtectedRoute>
    </div>
  );
}
