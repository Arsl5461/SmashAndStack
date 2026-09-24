export interface ApiSuccess<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RoleSummary {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  permissions?: string[];
  isSystem?: boolean;
}

export interface StoreSummary {
  _id: string;
  name: string;
  storeCode: string;
  status?: string;
  city?: string;
  manager?: { name: string; email: string };
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  organizationId: string;
  role: RoleSummary;
  permissions: string[];
  stores: StoreSummary[];
  defaultStore?: string;
  isSuperAdmin: boolean;
}

export interface DashboardOverview {
  range: { start: string; end: string; groupBy: string };
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    totalOrders: number;
    activeStores: number;
    profitMargin: number;
    revenueGrowth: number;
    expenseGrowth: number;
    profitGrowth: number;
    ordersGrowth: number;
  };
  revenueVsExpense: Array<{ date: string; revenue: number; expenses: number; netProfit: number }>;
  profitLossData: Array<{ period: string; revenue: number; expenses: number; netProfit: number }>;
  expenseBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  storePerformance: Array<{
    storeId: string;
    storeName: string;
    storeCode: string;
    revenue: number;
    expenses: number;
    profit: number;
    orders: number;
    rank: number;
  }>;
  recentTransactions: Array<{
    id: string;
    store: string;
    description: string;
    category: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    date: string;
    status: string;
  }>;
  topExpenses: Array<{
    id: string;
    title: string;
    category: string;
    store: string;
    amount: number;
    date: string;
  }>;
}
