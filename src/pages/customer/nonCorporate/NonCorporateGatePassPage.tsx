import React from 'react';
import { GatePassManager } from '../../../components/gatepass/GatePassManager';

export const NonCorporateGatePassPage: React.FC = () => {
  return (
    <GatePassManager
      customerType="NON_CORPORATE"
      title="Non-Corporate Gate Pass & Delivery Slips"
      subtitle="Manage single-entry gate passes, equipment loan slips, and customer dispatch challans."
    />
  );
};
