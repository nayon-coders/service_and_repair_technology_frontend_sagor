import React from 'react';
import { BillVoucherManager } from '../../../components/billing/BillVoucherManager';

export const NonCorporateBillPage: React.FC = () => {
  return (
    <BillVoucherManager
      customerType="NON_CORPORATE"
      title="Non-Corporate Bill Vouchers"
      subtitle="Manage retail, private clinic, and individual equipment repair & service bill vouchers."
    />
  );
};
