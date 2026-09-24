import { CircleDollarSign, Store, ShoppingBag, TrendingUp, Wallet } from 'lucide-react';
import { KpiCard } from './KpiCard';
import type { DashboardOverview } from '../../types';

export function DashboardStats({ summary }: { summary: DashboardOverview['summary'] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <KpiCard label="Total Revenue" value={summary.totalRevenue} growth={summary.revenueGrowth} icon={CircleDollarSign} tone="red" />
      <KpiCard label="Total Expenses" value={summary.totalExpenses} growth={summary.expenseGrowth} icon={Wallet} tone="orange" />
      <KpiCard label="Net Profit" value={summary.netProfit} growth={summary.profitGrowth} icon={TrendingUp} tone="green" />
      <KpiCard label="Total Orders" value={summary.totalOrders} growth={summary.ordersGrowth} icon={ShoppingBag} tone="blue" money={false} />
      <KpiCard label="Active Stores" value={summary.activeStores} growth={0} icon={Store} tone="yellow" money={false} />
    </div>
  );
}
