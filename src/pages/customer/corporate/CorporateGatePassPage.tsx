import React from 'react';
import { GatePassManager } from '../../../components/gatepass/GatePassManager';

export const CorporateGatePassPage: React.FC = () => {
  return (
    <GatePassManager
      customerType="CORPORATE"
      title="Corporate Gate Pass & Material Challan"
      subtitle="Issue, track, and print official hospital and institutional equipment delivery gate passes and loan challans."
    />
  );
};
