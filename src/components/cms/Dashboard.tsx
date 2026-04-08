import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Order, ExceptionQueueItem } from '@/lib/types';
import { listenToOrders, listenToOpenExceptions } from '@/lib/firestore';
import { TrendingUp, Package, Truck, AlertTriangle } from 'lucide-react';
import OrdersTable from './OrdersTable';
import ExceptionQueue from './ExceptionQueue';
import SyncButton from './SyncButton';

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
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
      iconBg: 'bg-blue-100 dark:bg-blue-900',
      trend: 'All time',
    },
    {
      id: 'pending',
      label: 'Pending',
      value: pendingOrders,
      icon: TrendingUp,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950',
      iconBg: 'bg-amber-100 dark:bg-amber-900',
      trend: 'Ready to process',
    },
    {
      id: 'shipped',
      label: 'Shipped',
      value: shippedOrders,
      icon: Truck,
      color: 'text-green-600 bg-green-50 dark:bg-green-950',
      iconBg: 'bg-green-100 dark:bg-green-900',
      trend: `${processingOrders} processing`,
    },
    {
      id: 'exceptions',
      label: '⚠️ Exceptions',
      value: openExceptions,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-50 dark:bg-red-950',
      iconBg: 'bg-red-100 dark:bg-red-900',
      trend: 'Need attention',
    },
  ];

  if (loading) {
    return (
      <div className='space-y-4'>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className='h-32 bg-muted rounded-lg animate-pulse' />
        ))}
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Sync Button */}
      <div className='flex justify-center'>
        <SyncButton />
      </div>

      {/* Stat Cards Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.id} className='border border-border'>
              <div className={`p-6 space-y-3 ${stat.color}`}>
                {/* Icon */}
                <div className={`w-fit p-2.5 rounded-lg ${stat.iconBg}`}>
                  <Icon className='h-5 w-5' />
                </div>

                {/* Label and Value */}
                <div>
                  <p className='text-sm font-medium opacity-75'>{stat.label}</p>
                  <div className='flex items-end justify-between mt-1'>
                    <p className='text-3xl font-bold'>{stat.value}</p>
                  </div>
                </div>

                {/* Trend/Subtitle */}
                <p className='text-xs opacity-60 pt-2 border-t border-current border-opacity-10'>
                  {stat.trend}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Order Status Breakdown */}
      <Card className='border border-border'>
        <div className='p-6 space-y-4'>
          <h2 className='text-lg font-semibold text-foreground'>Order Status Breakdown</h2>
          <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
            <div className='bg-muted/50 rounded-lg p-4 text-center space-y-1'>
              <p className='text-2xl font-bold text-foreground'>{pendingOrders}</p>
              <Badge variant='outline' className='justify-center w-full'>
                Pending
              </Badge>
            </div>
            <div className='bg-muted/50 rounded-lg p-4 text-center space-y-1'>
              <p className='text-2xl font-bold text-blue-600'>{processingOrders}</p>
              <Badge variant='outline' className='justify-center w-full'>
                Processing
              </Badge>
            </div>
            <div className='bg-muted/50 rounded-lg p-4 text-center space-y-1'>
              <p className='text-2xl font-bold text-green-600'>{shippedOrders}</p>
              <Badge variant='outline' className='justify-center w-full'>
                Shipped
              </Badge>
            </div>
            <div className='bg-muted/50 rounded-lg p-4 text-center space-y-1'>
              <p className='text-2xl font-bold text-green-700'>{deliveredOrders}</p>
              <Badge variant='outline' className='justify-center w-full'>
                Delivered
              </Badge>
            </div>
            <div className='bg-muted/50 rounded-lg p-4 text-center space-y-1'>
              <p className='text-2xl font-bold text-red-600'>{openExceptions}</p>
              <Badge variant='outline' className='justify-center w-full'>
                Exceptions
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Info */}
      {openExceptions > 0 && (
        <Card className='border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900'>
          <div className='p-4 flex items-start gap-3'>
            <AlertTriangle className='h-5 w-5 text-red-600 shrink-0 mt-0.5' />
            <div>
              <p className='font-semibold text-red-900 dark:text-red-100'>
                {openExceptions} exception{openExceptions !== 1 ? 's' : ''} requiring attention
              </p>
              <p className='text-sm text-red-700 dark:text-red-200 mt-1'>
                Review the exception queue to resolve pending issues.
              </p>
            </div>
          </div>

      {/* Exception Queue */}
      <ExceptionQueue />
        </Card>
      )}

      {/* Orders Table */}
      <OrdersTable />
    </div>
  );
}
