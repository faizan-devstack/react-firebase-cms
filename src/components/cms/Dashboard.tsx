import { useEffect, useState } from 'react';
import { Card, } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Order, ExceptionQueueItem } from '@/lib/types';
import { listenToOrders, listenToOpenExceptions } from '@/lib/firestore';
import { TrendingUp, Package, Truck, AlertTriangle, ArrowUpRight } from 'lucide-react';
import OrdersTable from './OrdersTable';
import ExceptionQueue from './ExceptionQueue';

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [exceptions, setExceptions] = useState<ExceptionQueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to all orders
    const unsubscribeOrders = listenToOrders((updatedOrders) => {
      setOrders(updatedOrders);
      setLoading(false);
    });

    // Listen to open exceptions
    const unsubscribeExceptions = listenToOpenExceptions((updatedExceptions) => {
      setExceptions(updatedExceptions);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeExceptions();
    };
  }, []);

  // Calculate stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const processingOrders = orders.filter((o) => o.status === 'processing').length;
  const shippedOrders = orders.filter((o) => o.status === 'shipped').length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
  const openExceptions = exceptions.filter((e) => e.status === 'open').length;

  const stats = [
    {
      id: 'total',
      label: 'Total Orders',
      value: totalOrders,
      icon: Package,
      linear: 'from-blue-500/20 to-blue-600/20 dark:from-blue-500/30 dark:to-blue-600/30',
      borderColor: 'border-blue-500/30 dark:border-blue-400/40',
      iconBg: 'bg-blue-500/20 dark:bg-blue-500/30',
      iconColor: 'text-blue-400 dark:text-blue-300',
      trend: 'All time',
      trendIcon: ArrowUpRight,
    },
    {
      id: 'pending',
      label: 'Pending Orders',
      value: pendingOrders,
      icon: TrendingUp,
      linear: 'from-amber-500/20 to-amber-600/20 dark:from-amber-500/30 dark:to-amber-600/30',
      borderColor: 'border-amber-500/30 dark:border-amber-400/40',
      iconBg: 'bg-amber-500/20 dark:bg-amber-500/30',
      iconColor: 'text-amber-400 dark:text-amber-300',
      trend: 'Ready to process',
      trendIcon: ArrowUpRight,
    },
    {
      id: 'shipped',
      label: 'Shipped',
      value: shippedOrders,
      icon: Truck,
      linear: 'from-green-500/20 to-green-600/20 dark:from-green-500/30 dark:to-green-600/30',
      borderColor: 'border-green-500/30 dark:border-green-400/40',
      iconBg: 'bg-green-500/20 dark:bg-green-500/30',
      iconColor: 'text-green-400 dark:text-green-300',
      trend: `${processingOrders} in progress`,
      trendIcon: TrendingUp,
    },
    {
      id: 'exceptions',
      label: 'Exceptions',
      value: openExceptions,
      icon: AlertTriangle,
      linear: 'from-red-500/20 to-red-600/20 dark:from-red-500/30 dark:to-red-600/30',
      borderColor: 'border-red-500/30 dark:border-red-400/40',
      iconBg: 'bg-red-500/20 dark:bg-red-500/30',
      iconColor: 'text-red-400 dark:text-red-300',
      trend: 'Need attention',
      trendIcon: AlertTriangle,
    },
  ];

  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='space-y-3'>
          <div className='h-8 bg-canvas-bg-subtle rounded animate-pulse w-48' />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className='h-40 bg-canvas-bg-subtle rounded-2xl animate-pulse' />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Header Section */}
      <div>
        <h1 className='text-4xl font-bold text-canvas-text-contrast'>Dashboard</h1>
        <p className='text-canvas-text mt-2'>Welcome back! Here's your warehouse overview.</p>
      </div>

      {/* Stat Cards Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trendIcon;
          return (
            <div
              key={stat.id}
              className={`group relative overflow-hidden rounded-2xl bg-linear-to-br ${stat.linear} border ${stat.borderColor} p-6 backdrop-blur-sm transition-all duration-300 hover:border-opacity-100`}
            >
              {/* Animated background glow */}
              <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                <div className='absolute inset-0 bg-linear-to-br from-white/5 to-transparent' />
              </div>

              <div className='relative z-10'>
                {/* Icon */}
                <div className={`w-fit p-3 rounded-xl ${stat.iconBg} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>

                {/* Label and Value */}
                <div className='space-y-2 mb-4'>
                  <p className='text-sm font-medium text-canvas-text'>{stat.label}</p>
                  <div className='flex items-baseline gap-2'>
                    <p className='text-4xl font-bold text-canvas-text-contrast'>{stat.value}</p>
                  </div>
                </div>

                {/* Trend/Subtitle */}
                <div className='flex items-center gap-1 text-xs'>
                  <TrendIcon className={`h-3 w-3 ${stat.value > 0 ? 'text-green-400 dark:text-green-300' : 'text-red-400 dark:text-red-300'}`} />
                  <span className='text-canvas-text'>{stat.trend}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Status Breakdown */}
      <Card className='border border-canvas-border bg-canvas-bg'>
        <div className='p-8 space-y-6'>
          <div>
            <h2 className='text-2xl font-bold text-canvas-text-contrast'>Order Pipeline</h2>
            <p className='text-canvas-text text-sm mt-1'>Current status distribution across all orders</p>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
            {/* Pending */}
            <div className='group relative rounded-xl bg-linear-to-br from-amber-500/10 to-amber-600/10 dark:from-amber-500/20 dark:to-amber-600/20 border border-amber-500/20 dark:border-amber-400/30 p-4 text-center space-y-2 transition-all hover:border-amber-500/40'>
              <p className='text-3xl font-bold text-amber-500 dark:text-amber-300'>{pendingOrders}</p>
              <Badge variant='outline' className='justify-center w-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/20 dark:border-amber-400/30'>
                Pending
              </Badge>
            </div>

            {/* Processing */}
            <div className='group relative rounded-xl bg-linear-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 border border-blue-500/20 dark:border-blue-400/30 p-4 text-center space-y-2 transition-all hover:border-blue-500/40'>
              <p className='text-3xl font-bold text-blue-500 dark:text-blue-300'>{processingOrders}</p>
              <Badge variant='outline' className='justify-center w-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/20 dark:border-blue-400/30'>
                Processing
              </Badge>
            </div>

            {/* Shipped */}
            <div className='group relative rounded-xl bg-linear-to-br from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 border border-green-500/20 dark:border-green-400/30 p-4 text-center space-y-2 transition-all hover:border-green-500/40'>
              <p className='text-3xl font-bold text-green-500 dark:text-green-300'>{shippedOrders}</p>
              <Badge variant='outline' className='justify-center w-full bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-300 border-green-500/20 dark:border-green-400/30'>
                Shipped
              </Badge>
            </div>

            {/* Delivered */}
            <div className='group relative rounded-xl bg-linear-to-br from-emerald-500/10 to-emerald-600/10 dark:from-emerald-500/20 dark:to-emerald-600/20 border border-emerald-500/20 dark:border-emerald-400/30 p-4 text-center space-y-2 transition-all hover:border-emerald-500/40'>
              <p className='text-3xl font-bold text-emerald-500 dark:text-emerald-300'>{deliveredOrders}</p>
              <Badge variant='outline' className='justify-center w-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/20 dark:border-emerald-400/30'>
                Delivered
              </Badge>
            </div>

            {/* Exceptions */}
            <div className='group relative rounded-xl bg-linear-to-br from-red-500/10 to-red-600/10 dark:from-red-500/20 dark:to-red-600/20 border border-red-500/20 dark:border-red-400/30 p-4 text-center space-y-2 transition-all hover:border-red-500/40'>
              <p className='text-3xl font-bold text-red-500 dark:text-red-300'>{openExceptions}</p>
              <Badge variant='outline' className='justify-center w-full bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-300 border-red-500/20 dark:border-red-400/30'>
                Exceptions
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Alert Section - Only show if exceptions exist */}
      {openExceptions > 0 && (
        <div className='rounded-2xl bg-linear-to-br from-red-500/15 to-red-600/15 dark:from-red-500/25 dark:to-red-600/25 border border-red-500/30 dark:border-red-400/40 p-6 backdrop-blur-sm'>
          <div className='flex items-start gap-4'>
            <div className='p-3 rounded-lg bg-red-500/20 dark:bg-red-500/30'>
              <AlertTriangle className='h-6 w-6 text-red-500 dark:text-red-300' />
            </div>
            <div className='flex-1 min-w-0'>
              <h3 className='text-lg font-semibold text-red-600 dark:text-red-300'>
                {openExceptions} Exception{openExceptions !== 1 ? 's' : ''} Pending
              </h3>
              <p className='text-sm text-red-600/80 dark:text-red-300/80 mt-1'>
                Immediate attention required. Review the exception queue below to resolve these issues.
              </p>
            </div>
          </div>

          {/* Exception Queue */}
          <div className='mt-6'>
            <ExceptionQueue />
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div>
        <h2 className='text-2xl font-bold text-canvas-text-contrast mb-4'>Recent Orders</h2>
        <OrdersTable />
      </div>
    </div>
  );
}
