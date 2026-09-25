import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DashboardOverview } from '../../types';
import { formatCurrency } from '../../utils/cn';

export function StorePerformanceChart({ data }: { data: DashboardOverview['storePerformance'] }) {
  return (
    <div className="card p-5">
      <h3 className="mb-4 text-lg font-normal">Store Performance</h3>
      <div className="h-[260px]">
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical">
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="storeName" width={120} tick={{ fontSize: 12, fill: '#8B95A5' }} />
            <Tooltip
              contentStyle={{ background: '#1B232E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
              labelStyle={{ color: '#E8EDF4' }}
              itemStyle={{ color: '#C5CDD8' }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Bar dataKey="revenue" fill="#E31B23" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function StoreRanking({ data }: { data: DashboardOverview['storePerformance'] }) {
  return (
    <div className="card p-5">
      <h3 className="mb-4 text-lg font-normal">Top Performing Stores</h3>
      <div className="space-y-3">
        {data.slice(0, 5).map((store) => (
          <div key={store.storeId} className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-3">
            <div>
              <p className="text-xs font-medium text-brand-red">#{store.rank}</p>
              <p className="font-medium">{store.storeName}</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-medium">{formatCurrency(store.revenue)}</p>
              <p className="text-emerald-400">Profit {formatCurrency(store.profit)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
