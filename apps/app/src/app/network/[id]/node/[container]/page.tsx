import ProtectedRoute from '@/views/private-route';
import React from 'react';

import ClientPage from './client-page';

const NetworkPage = () => {
  return (
    <div>
      <ProtectedRoute>
        <ClientPage />
      </ProtectedRoute>
    </div>
  );
};

export default NetworkPage;
