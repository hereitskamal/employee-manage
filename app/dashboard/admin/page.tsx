'use client';
import React, { useState, useMemo, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { TrendingUp, Users, DollarSign, Package, Calendar, Filter, Search } from 'lucide-react';

const AdminDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [todayPresentCount, setTodayPresentCount] = useState(0);
  const [totalHours, setTotalHours] = useState('0 hours, 0 minutes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real data from backend
  const [stats, setStats] = useState({
    today: { revenue: 0, count: 0 },
    week: { revenue: 0, count: 0 },
    month: { revenue: 0, count: 0 },
    overall: { revenue: 0, count: 0, average: 0 }
  });

  const [revenueData, setRevenueData] = useState<Array<{ period: string; revenue: number; sales: number }>>([]);
  const [profitsData, setProfitsData] = useState<Array<{ value: number; name: string }>>([]);
  const [activityData, setActivityData] = useState<Array<{ name: string; amount: number; category: string; color: string }>>([]);

  // Fetch sales statistics
  useEffect(() => {
    const fetchSalesStats = async () => {
      try {
        const response = await fetch('/api/sales/stats');
        if (!response.ok) throw new Error('Failed to fetch sales stats');
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching sales stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load sales statistics');
      }
    };

    fetchSalesStats();
  }, []);

  // Fetch sales analysis and revenue trends
  useEffect(() => {
    const fetchSalesAnalysis = async () => {
      try {
        setLoading(true);
        const period = selectedPeriod === 'daily' ? 'daily' : selectedPeriod === 'weekly' ? 'weekly' : 'monthly';
        const response = await fetch(`/api/sales/analysis?period=${period}`);
        if (!response.ok) throw new Error('Failed to fetch sales analysis');
        const data = await response.json();

        // Transform revenue trends for chart
        if (data.revenueTrends && Array.isArray(data.revenueTrends)) {
          const transformed = data.revenueTrends.map((item: any, index: number) => {
            let periodLabel = '';
            if (period === 'daily') {
              // Format as day name
              const date = new Date(item._id);
              periodLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
            } else if (period === 'weekly') {
              periodLabel = `Week ${index + 1}`;
            } else {
              // Monthly - format as month name
              const date = new Date(item._id + '-01');
              periodLabel = date.toLocaleDateString('en-US', { month: 'short' });
            }
            return {
              period: periodLabel,
              revenue: item.revenue || 0,
              sales: item.count || 0
            };
          });
          setRevenueData(transformed);
        }

        // Transform top products for activity data
        if (data.topProducts && Array.isArray(data.topProducts)) {
          const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f59e0b', '#8b5cf6'];
          const transformed = data.topProducts.slice(0, 5).map((product: any, index: number) => ({
            name: product.productName || 'Unknown Product',
            amount: product.totalRevenue || 0,
            category: product.productCategory || 'Uncategorized',
            color: colors[index % colors.length]
          }));
          setActivityData(transformed);
        }

        // Create profits data from monthly stats (last 4 months or use overall stats)
        if (data.stats) {
          const profitValues = [
            { value: data.stats.totalRevenue * 0.25, name: `$${(data.stats.totalRevenue * 0.25 / 1000).toFixed(1)}K` },
            { value: data.stats.totalRevenue * 0.20, name: `$${(data.stats.totalRevenue * 0.20 / 1000).toFixed(1)}K` },
            { value: data.stats.totalRevenue * 0.15, name: `$${(data.stats.totalRevenue * 0.15 / 1000).toFixed(1)}K` },
            { value: data.stats.totalRevenue * 0.10, name: `$${(data.stats.totalRevenue * 0.10 / 1000).toFixed(1)}K` }
          ];
          setProfitsData(profitValues);
        }
      } catch (err) {
        console.error('Error fetching sales analysis:', err);
        setError(err instanceof Error ? err.message : 'Failed to load sales analysis');
      } finally {
        setLoading(false);
      }
    };

    fetchSalesAnalysis();
  }, [selectedPeriod]);

  // Fetch today's attendance data
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`/api/attendance/daily?date=${today}`);
        if (!response.ok) throw new Error('Failed to fetch attendance');
        const data = await response.json();
        
        if (data.statistics) {
          setTodayPresentCount(data.statistics.present || 0);
          
          // Calculate total hours from attendance records
          if (data.records && Array.isArray(data.records)) {
            const presentRecords = data.records.filter((r: any) => r.status === 'present');
            let totalMinutes = 0;
            
            presentRecords.forEach((record: any) => {
              if (record.loginTime && record.logoutTime) {
                const login = new Date(record.loginTime);
                const logout = new Date(record.logoutTime);
                const diffMs = logout.getTime() - login.getTime();
                const diffMinutes = Math.floor(diffMs / (1000 * 60));
                totalMinutes += diffMinutes;
              }
            });
            
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            setTotalHours(`${hours} hours, ${minutes} minutes`);
          }
        }
      } catch (err) {
        console.error('Error fetching attendance:', err);
        // Don't set error for attendance, just log it
      }
    };

    fetchAttendance();
  }, []);

  const totalRevenue = stats?.overall?.revenue || 0;
  const weekRevenue = stats?.week?.revenue || 0;
  const monthRevenue = stats?.month?.revenue || 0;

  const growthRate = useMemo(() => {
    if (weekRevenue === 0) return 0;
    return ((monthRevenue - weekRevenue) / weekRevenue) * 100;
  }, [weekRevenue, monthRevenue]);

  const revenueTrend = useMemo(() => {
    const todayRev = stats?.today?.revenue || 0;
    const weekRev = stats?.week?.revenue || 0;
    if (weekRev === 0) return 0;
    return ((todayRev - weekRev / 7) / (weekRev / 7)) * 100;
  }, [stats]);

  const salesTrend = useMemo(() => {
    const todaySales = stats?.today?.count || 0;
    const weekSales = stats?.week?.count || 0;
    if (weekSales === 0) return 0;
    return ((todaySales - weekSales / 7) / (weekSales / 7)) * 100;
  }, [stats]);

  // Revenue Chart Options
  const revenueChartOptions = useMemo(() => ({
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'white',
      borderColor: '#f0f0f0',
      borderRadius: 12,
      padding: 16,
      textStyle: {
        color: '#333',
      },
      formatter: (params: any) => {
        let result = `${params[0].axisValue}<br/>`;
        params.forEach((param: any) => {
          if (param.seriesName === 'Revenue') {
            result += `${param.marker}${param.seriesName}: $${param.value.toLocaleString()}<br/>`;
          } else {
            result += `${param.marker}${param.seriesName}: ${param.value}<br/>`;
          }
        });
        return result;
      },
    },
    legend: {
      data: ['Revenue', 'Sales Count'],
      top: '5%',
      icon: 'circle',
    },
    xAxis: {
      type: 'category',
      data: revenueData.length > 0 ? revenueData.map((item) => item.period) : [],
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: '#e5e7eb',
        },
      },
      axisLabel: {
        color: '#9ca3af',
      },
    },
    yAxis: [
      {
        type: 'value',
        axisLine: {
          show: false,
        },
        axisLabel: {
          color: '#9ca3af',
          formatter: (value: number) => `$${value.toLocaleString()}`,
        },
        splitLine: {
          lineStyle: {
            color: '#f3f4f6',
          },
        },
      },
      {
        type: 'value',
        position: 'right',
        axisLine: {
          show: false,
        },
        axisLabel: {
          color: '#9ca3af',
        },
        splitLine: {
          show: false,
        },
      },
    ],
    series: [
      {
        name: 'Revenue',
        type: 'line',
        data: revenueData.length > 0 ? revenueData.map((item) => item.revenue) : [],
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#3b82f6',
        },
        itemStyle: {
          color: '#3b82f6',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
            ],
          },
        },
        yAxisIndex: 0,
      },
      {
        name: 'Sales Count',
        type: 'line',
        data: revenueData.length > 0 ? revenueData.map((item) => item.sales) : [],
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#10b981',
        },
        itemStyle: {
          color: '#10b981',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.05)' },
            ],
          },
        },
        yAxisIndex: 1,
      },
    ],
  }), [revenueData]);

  // Annual Profits Pie Chart
  const profitsPieOptions = useMemo(() => ({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'white',
      borderColor: '#f0f0f0',
      borderRadius: 12,
      padding: 16,
      formatter: '{b}: ${c}',
    },
    series: [
      {
        type: 'pie',
        radius: ['0%', '30%'],
        center: ['50%', '50%'],
        data: profitsData.length > 3 ? [profitsData[3]] : [{ value: 0, name: '$0' }],
        label: {
          show: true,
          position: 'center',
          formatter: '{b}',
          fontSize: 16,
          fontWeight: 'bold',
          color: 'white',
        },
        itemStyle: {
          color: '#ff6666',
        },
      },
      {
        type: 'pie',
        radius: ['35%', '50%'],
        center: ['50%', '50%'],
        data: profitsData.length > 2 ? [profitsData[2]] : [{ value: 0, name: '$0' }],
        label: {
          show: true,
          position: 'center',
          formatter: '{b}',
          fontSize: 16,
          fontWeight: 'bold',
          color: 'white',
        },
        itemStyle: {
          color: '#ff9999',
        },
      },
      {
        type: 'pie',
        radius: ['55%', '70%'],
        center: ['50%', '50%'],
        data: profitsData.length > 1 ? [profitsData[1]] : [{ value: 0, name: '$0' }],
        label: {
          show: true,
          position: 'center',
          formatter: '{b}',
          fontSize: 16,
          fontWeight: 'bold',
          color: 'white',
        },
        itemStyle: {
          color: '#ffb3b3',
        },
      },
      {
        type: 'pie',
        radius: ['75%', '85%'],
        center: ['50%', '50%'],
        data: profitsData.length > 0 ? [profitsData[0]] : [{ value: 0, name: '$0' }],
        label: {
          show: true,
          position: 'center',
          formatter: '{b}',
          fontSize: 16,
          fontWeight: 'bold',
          color: '#666',
        },
        itemStyle: {
          color: '#ffcccb',
        },
      },
    ],
  }), [profitsData]);

  // System Lock Gauge
  const systemLockOptions = useMemo(() => ({
    series: [
      {
        type: 'gauge',
        startAngle: 90,
        endAngle: -270,
        radius: '90%',
        pointer: {
          show: false,
        },
        progress: {
          show: true,
          overlap: false,
          roundCap: true,
          clip: false,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#ff6666' },
                { offset: 1, color: '#ff9999' },
              ],
            },
          },
        },
        axisLine: {
          lineStyle: {
            width: 20,
            color: [[1, '#f3f4f6']],
          },
        },
        splitLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
        data: [
          {
            value: Math.round(growthRate),
            detail: {
              valueAnimation: true,
              offsetCenter: ['0%', '0%'],
            },
          },
        ],
        title: {
          show: false,
        },
        detail: {
          fontSize: 32,
          fontWeight: 'bold',
          color: '#1f2937',
          formatter: '{value}%',
        },
      },
    ],
  }), [growthRate]);

  // Mini Stock Chart
  const miniStockOptions = useMemo(() => ({
    grid: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      show: false,
      data: revenueData.length > 0 ? revenueData.map((item) => item.period) : [],
    },
    yAxis: {
      type: 'value',
      show: false,
    },
    series: [
      {
        data: revenueData.length > 0 ? revenueData.map((item) => item.revenue) : [],
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: '#ff6666',
          width: 2,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255, 102, 102, 0.3)' },
              { offset: 1, color: 'rgba(255, 102, 102, 0.05)' },
            ],
          },
        },
      },
    ],
  }), [revenueData]);

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    trend,
    color,
  }: {
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    title: string;
    value: string;
    subtitle?: string;
    trend?: number;
    color: string;
  }) => (
    <div className="bg-white rounded-3xl p-4 border border-gray-100 hover:shadow-xl transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        {trend !== undefined && (
          <div className={`text-sm font-semibold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
          </div>
        )}
      </div>
      <div className="text-sm text-gray-500 mb-2">{title}</div>
      <div className="text-3xl font-normal text-gray-700 mb-1">{value}</div>
      {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-500"><span className="font-medium text-gray-900">Welcome back!</span> Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl bg-white text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading dashboard data...</div>
          </div>
        )}

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            icon={DollarSign}
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            subtitle="All time revenue"
            trend={revenueTrend}
            color="#3b82f6"
          />
          <StatCard
            icon={TrendingUp}
            title="Total Sales"
            value={`${(stats?.overall?.count || 0).toLocaleString()}`}
            subtitle="Total sales count"
            trend={salesTrend}
            color="#10b981"
          />
          <StatCard
            icon={Users}
            title="Team Present"
            value={`${todayPresentCount}`}
            subtitle={totalHours}
            color="#8b5cf6"
          />
          <StatCard
            icon={Package}
            title="Weekly Sales"
            value={`${stats?.week?.count || 0}`}
            subtitle="Sales this week"
            color="#f59e0b"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Annual Profits */}
          <div className="bg-white rounded-2xl p-6  border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-medium text-gray-600">Annual profits</h2>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <span className="text-gray-600">2023</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-200"></div>
                  <span className="text-gray-600">2022</span>
                </div>
              </div>
            </div>
            <div className="h-64">
              <ReactECharts option={profitsPieOptions} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>

          {/* Activity Manager */}
          <div className="bg-white rounded-2xl p-6  border border-gray-100 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-medium text-gray-600">Activity manager</h2>
                <p className="text-sm text-gray-400">Team Insights Today</p>
              </div>
            </div>
            <div className="space-y-4">
              {activityData.length > 0 ? activityData.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div
                    className="w-10 h-10 rounded-full flex items-center  opacity-80 justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: activity.color }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{activity.name}</div>
                    <div className="text-xs text-gray-500">{activity.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">${activity.amount.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">USD</div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-400">No activity data available</div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* System Lock & Main Stocks */}
          <div className="lg:col-span-1 space-y-6">
            {/* System Lock Circle */}
            <div className="bg-white rounded-2xl p-6  border border-gray-100">
              <h2 className="font-medium text-gray-600">System Lock</h2>
              <p className="text-sm text-gray-400 mb-4">Growth rate</p>
              <div className="h-48">
                <ReactECharts option={systemLockOptions} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>

            {/* Main Stocks Card */}
            <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-sm opacity-90 mb-2">Main Stocks</div>
              <div className="text-xs opacity-75 mb-4">Extended & Limited</div>
              <div className="text-2xl font-bold mb-1">+9.3%</div>
              <div className="text-3xl font-bold mb-4">
                ${(stats?.week?.revenue || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="h-16">
                <ReactECharts option={miniStockOptions} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>

            {/* Review Card */}
            <div className="bg-white rounded-2xl p-6  border border-gray-100">
              <h2 className="font-medium text-gray-600 mb-2">Review rating</h2>
              <p className="text-sm text-gray-600 mb-6">How is your business management going?</p>
              <div className="flex justify-between">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl transition-colors"
                  >
                    {rating === 1 ? '😞' : rating === 2 ? '😐' : rating === 3 ? '😊' : rating === 4 ? '😄' : '🤩'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-6  border border-gray-100">
            <h2 className="font-medium text-gray-600">Revenue Overview</h2>
            <div className="h-96">
              <ReactECharts option={revenueChartOptions} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;