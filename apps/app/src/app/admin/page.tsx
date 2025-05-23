import { DashboardPage } from '@/components/modules/v2/admin';
import AdminRoute from '@/views/admine-route';
import ProtectedRoute from '@/views/private-route';

export default function Home() {
  return (
    <div>
      <ProtectedRoute>
        {/* <AdminRoute> */}
        <DashboardPage />
        {/* </AdminRoute> */}
      </ProtectedRoute>
    </div>
  );
}
