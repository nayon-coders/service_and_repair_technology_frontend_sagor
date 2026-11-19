import React from 'react';
import { BillVoucherManager } from '../../../components/billing/BillVoucherManager';

export const CorporateBillPage: React.FC = () => {
  return (
    <BillVoucherManager
      customerType="CORPORATE"
      title="Corporate Bill Vouchers"
      subtitle="Manage corporate repair bills, hospital/clinical equipment vouchers, and print official invoices."
    />
  );
};
