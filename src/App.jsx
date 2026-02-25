import React from 'react';
import DashboardLayout from './layouts/DashboardLayout';
import Inbox from './pages/Inbox';

function App() {
  return (
    <DashboardLayout>
      <Inbox />
    </DashboardLayout>
  );
}

export default App;