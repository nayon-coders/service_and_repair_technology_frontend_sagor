import React from 'react';
import { RequisitionManager } from '../../../components/requisition/RequisitionManager';

export const CorporateRequisitionPage: React.FC = () => {
  return (
    <RequisitionManager
      customerType="CORPORATE"
      title="Corporate Requisitions & Repair Estimates"
      subtitle="Generate, track, and print official hospital and clinical equipment repair cost estimates."
    />
  );
};
