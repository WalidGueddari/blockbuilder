import ProtectedRoute from '@/views/private-route';

export default function Home() {
  return (
    <div>
      <ProtectedRoute>
        <div>Hello World</div>
      </ProtectedRoute>
    </div>
  );
}
