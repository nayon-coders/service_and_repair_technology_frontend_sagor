import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { ModulePageLayout } from '../../components/layout/ModulePageLayout';

export const OthersPage: React.FC = () => {
  return (
    <ModulePageLayout
      title="Other Management Expenses"
      category="Management"
      description="Miscellaneous organizational expenditures, incidental operational costs, and general administrative ledger entries."
      icon={MoreHorizontal}
      actionLabel="Add Miscellaneous Entry"
    />
  );
};

