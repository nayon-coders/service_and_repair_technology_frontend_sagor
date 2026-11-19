import React from 'react';
import { RequisitionManager } from '../../../components/requisition/RequisitionManager';

export const NonCorporateRequisitionPage: React.FC = () => {
  return (
    <RequisitionManager
      customerType="NON_CORPORATE"
      title="Non-Corporate Requisitions & Estimates"
      subtitle="Manage individual, private clinic, and retail equipment repair cost estimates."
    />
  );
};
