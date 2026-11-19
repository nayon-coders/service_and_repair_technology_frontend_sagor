import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Building2, 
  FileText, 
  AlertCircle, 
  Clock, 
  Layers, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Boxes,
  Truck,
  Car
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { fetchDashboardStats } from '../../services/dashboardService';
import { DashboardStats } from '../../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDashboardStats();
      setStats(res);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formatCurrency = (val: number | undefined) => {
    return `৳ ${(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="space-y-8">
      {/* 1. Welcome & Executive Banner */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Welcome back, {user?.name || 'Administrator'} 👋
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-300">
              Live Portal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            {currentDate} &bull; 1 Service &amp; Repair Technology Management System
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/management/salary"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Process Salary</span>
          </Link>

          <Link
            to="/settings/system"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Desktop Software</span>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
          <button onClick={loadData} className="text-xs font-bold text-rose-700 underline">
            Try Again
          </button>
        </div>
      )}

      {/* 2. Top Tier: Financial Health KPI Cards */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          Financial &amp; Cashflow Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Income */}
          <Link
            to="/management/income"
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition group block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Income (মোট আয়)
              </span>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-slate-900 block">
                {formatCurrency(stats?.financials.totalIncome)}
              </span>
              <span className="text-xs text-emerald-700 font-semibold mt-0.5 block">
                {stats?.financials.incomeCount || 0} received payments
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold">
              <span>View Incomes</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Total Expense */}
          <Link
            to="/management/expense"
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-rose-300 transition group block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Expense (মোট খরচ)
              </span>
              <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-slate-900 block">
                {formatCurrency(stats?.financials.totalExpense)}
              </span>
              <span className="text-xs text-rose-700 font-semibold mt-0.5 block">
                {stats?.financials.expenseCount || 0} operational expenditures
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-rose-600 font-semibold">
              <span>View Expenses</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Net Cashflow / Balance */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Net Balance (আয় - ব্যয়)
              </span>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                (stats?.financials.netBalance ?? 0) >= 0
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-amber-50 text-amber-600'
              }`}>
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2">
              <span className={`text-2xl font-black block ${
                (stats?.financials.netBalance ?? 0) >= 0 ? 'text-emerald-700' : 'text-amber-700'
              }`}>
                {formatCurrency(stats?.financials.netBalance)}
              </span>
              <span className={`text-xs font-bold mt-0.5 inline-block px-2 py-0.5 rounded ${
                (stats?.financials.netBalance ?? 0) >= 0
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'bg-amber-50 text-amber-900'
              }`}>
                {(stats?.financials.netBalance ?? 0) >= 0 ? 'Net Surplus' : 'Operating Deficit'}
              </span>
            </div>
          </div>

          {/* Total Monthly Payroll Commitment */}
          <Link
            to="/employees"
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-purple-300 transition group block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Staff Payroll (মাসিক বেতন)
              </span>
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-slate-900 block">
                {formatCurrency(stats?.employees.totalMonthlyPayroll)}
              </span>
              <span className="text-xs text-purple-700 font-semibold mt-0.5 block">
                {stats?.employees.activeCount || 0} active employees
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-600 font-semibold">
              <span>Employee Directory</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* 3. Middle Tier: Operations & Department Hub (4 Cards) */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-indigo-600" />
          Operational &amp; Domain Status
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Salary Records & Due */}
          <Link
            to="/management/salary"
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition block group"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-xs text-slate-700">Salary &amp; Payroll</span>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {stats?.salary.recordsCount || 0} Sheets
              </span>
            </div>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Paid Out:</span>
                <span className="font-bold text-emerald-700">{formatCurrency(stats?.salary.totalPaid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Carried Due:</span>
                <span className={`font-bold ${stats?.salary.totalDue ? 'text-rose-600' : 'text-slate-700'}`}>
                  {formatCurrency(stats?.salary.totalDue)}
                </span>
              </div>
            </div>
            <div className="mt-3 pt-2 text-[11px] font-bold text-blue-600 flex items-center justify-between">
              <span>Open Salary Seat</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Office Rent */}
          <Link
            to="/management/office-rent"
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-amber-300 hover:shadow-md transition block group"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-xs text-slate-700">Office Rent</span>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                {stats?.officeRent.recordsCount || 0} Records
              </span>
            </div>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Billed:</span>
                <span className="font-bold text-slate-900">{formatCurrency(stats?.officeRent.totalBilled)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Paid Status:</span>
                <span className="font-bold text-emerald-700">৳ {stats?.officeRent.totalPaid?.toLocaleString()} Settled</span>
              </div>
            </div>
            <div className="mt-3 pt-2 text-[11px] font-bold text-amber-700 flex items-center justify-between">
              <span>Rent Manager</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Lab Inventory */}
          <Link
            to="/service/lab-in"
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition block group"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-xs text-slate-700">Lab Parts &amp; Stock</span>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                {stats?.labInventory.totalParts || 0} Parts
              </span>
            </div>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">In Stock:</span>
                <span className="font-bold text-emerald-700">{stats?.labInventory.totalStockQuantity || 0} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dispatches:</span>
                <span className="font-bold text-slate-800">{stats?.labInventory.totalOutCount || 0} batches</span>
              </div>
            </div>
            <div className="mt-3 pt-2 text-[11px] font-bold text-indigo-600 flex items-center justify-between">
              <span>Manage Inventory</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* TA/DA Allowance */}
          <Link
            to="/management/ta-da"
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition block group"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-xs text-slate-700">TA / DA Claims</span>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {stats?.taDa.totalBills || 0} Claims
              </span>
            </div>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Billed:</span>
                <span className="font-bold text-slate-900">{formatCurrency(stats?.taDa.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pending Review:</span>
                <span className="font-bold text-amber-700">{stats?.taDa.pendingCount || 0} pending</span>
              </div>
            </div>
            <div className="mt-3 pt-2 text-[11px] font-bold text-blue-600 flex items-center justify-between">
              <span>View TA/DA</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* 4. Customer Billing & Challans (3 Cards) */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-purple-600" />
          Customer Invoices, Estimates &amp; Challans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bill Invoices */}
          <Link
            to="/customer/corporate/bill"
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition block group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {stats?.bills.totalCount || 0} Invoices
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Customer Bill Vouchers</h3>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {formatCurrency(stats?.bills.totalAmount)}
            </p>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Corporate: {stats?.bills.corporateCount || 0}</span>
              <span>Non-Corporate: {stats?.bills.nonCorporateCount || 0}</span>
            </div>
          </Link>

          {/* Requisitions / Estimates */}
          <Link
            to="/customer/corporate/requisition"
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition block group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-lg">
                <Boxes className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                {stats?.requisitions.totalCount || 0} Estimates
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Repair Cost Estimates</h3>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {formatCurrency(stats?.requisitions.totalEstimatedAmount)}
            </p>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Requisition Proposals</span>
              <span className="text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center">
                Open <ArrowRight className="w-3 h-3 ml-1" />
              </span>
            </div>
          </Link>

          {/* Gate Pass Challans */}
          <Link
            to="/customer/corporate/gate-pass"
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition block group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {stats?.gatePasses.totalCount || 0} Challans
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Gate Pass Challans</h3>
            <div className="mt-2 flex items-center gap-3">
              <div>
                <span className="text-xs text-slate-500 block">মেশিন গ্রহণ:</span>
                <span className="text-xl font-bold text-blue-700">{stats?.gatePasses.receivingCount || 0}</span>
              </div>
              <div className="border-l border-slate-200 pl-3">
                <span className="text-xs text-slate-500 block">মেশিন ফেরত:</span>
                <span className="text-xl font-bold text-emerald-700">{stats?.gatePasses.returnCount || 0}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-emerald-700 font-bold flex items-center justify-between">
              <span>Challan Operations</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* 5. Bottom Tier: Recent Activities & Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities Feed (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Recent Operations &amp; Transactions Feed
            </h3>
            <span className="text-xs font-semibold text-slate-500">Live DB Activity</span>
          </div>

          {stats?.recentActivities && stats.recentActivities.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {stats.recentActivities.map((act) => (
                <div key={act.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                      act.type === 'INCOME' ? 'bg-emerald-100 text-emerald-800' :
                      act.type === 'EXPENSE' ? 'bg-rose-100 text-rose-800' :
                      act.type === 'SALARY' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {act.type}
                    </span>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{act.title}</p>
                      <p className="text-slate-500 text-[11px]">{act.subtitle}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    {act.amount !== undefined && (
                      <p className={`font-mono font-bold text-sm ${
                        act.type === 'INCOME' ? 'text-emerald-700' : 'text-slate-900'
                      }`}>
                        ৳{act.amount.toLocaleString()}
                      </p>
                    )}
                    <span className="text-slate-400 text-[10px] block mt-0.5">{act.date}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              No recent activity recorded yet.
            </div>
          )}
        </div>

        {/* Quick Operations Shortcuts (1 Column) */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">Quick Action Shortcuts</h3>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
              Shortcuts
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <Link
              to="/management/salary"
              className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition font-semibold text-slate-800"
            >
              <span className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Process Staff Salary
              </span>
              <Plus className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              to="/management/income"
              className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition font-semibold text-slate-800"
            >
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Record New Income
              </span>
              <Plus className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              to="/management/expense"
              className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-rose-400 hover:shadow-xs transition font-semibold text-slate-800"
            >
              <span className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-600" />
                Record New Expense
              </span>
              <Plus className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              to="/service/lab-in"
              className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition font-semibold text-slate-800"
            >
              <span className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-indigo-600" />
                Lab Spare Parts Stock In
              </span>
              <Plus className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              to="/customer/corporate/gate-pass"
              className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition font-semibold text-slate-800"
            >
              <span className="flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-600" />
                Issue Gate Pass Challan
              </span>
              <Plus className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              to="/management/office-rent"
              className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-amber-400 hover:shadow-xs transition font-semibold text-slate-800"
            >
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-600" />
                Pay Office Rent
              </span>
              <Plus className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-200">
            <Link
              to="/settings/system"
              className="w-full text-center block py-2 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 shadow-xs transition"
            >
              Download Desktop App
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
