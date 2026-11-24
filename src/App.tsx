import React from 'react';
import { AppRoutes } from './routes';
import { LicenseLockModal } from './components/common/LicenseLockModal';

const App: React.FC = () => {
  return (
    <>
      <LicenseLockModal />
      <AppRoutes />
    </>
  );
};

export default App;

