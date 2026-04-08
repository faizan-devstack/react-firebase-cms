import { useState, useEffect } from 'react';
import type { Order, OrderStatus } from '@/lib/types';
import { listenToOrders, addOrder } from '@/lib/firestore';
import { useAuth } from '@/hooks/useAuth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Plus, Eye, Loader2 } from 'lucide-react';
import OrderDetailModal from './OrderDetailModal';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  shipped: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  exception: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function OrdersTable() {
  const { role } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNewOrderDialog, setShowNewOrderDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // RBAC: Check if user can create orders
  const canCreateOrder = role === 'admin' || role === 'manager' || role === 'warehouse';

  // Listen to orders in real-time
  useEffect(() => {
    const unsubscribe = listenToOrders((updatedOrders) => {
      setOrders(
        updatedOrders.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleNewOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const formData = new FormData(e.currentTarget);
    try {
      await addOrder({
        orderNumber: `ORD-${Date.now()}`,
        customerName: formData.get('customerName') as string,
        customerEmail: formData.get('customerEmail') as string,
        customerPhone: formData.get('customerPhone') as string,
        customerId: `CUST-${Date.now()}`,
        status: 'pending',
        items: [],
        totalAmount: 0,
        shippingAddress: formData.get('shippingAddress') as string,
        notes: formData.get('notes') as string,
      });
      setShowNewOrderDialog(false);
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <Card className='border border-border'>
        <div className='p-6 space-y-3'>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className='h-12 bg-muted rounded animate-pulse' />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className='border border-border'>
        <div className='p-6 space-y-4'>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-lg font-semibold text-foreground'>Orders</h2>
              <p className='text-sm text-muted-foreground'>{orders.length} total orders</p>
            </div>

            {/* New Order Dialog - RBAC Protected */}
            {canCreateOrder ? (
              <Dialog open={showNewOrderDialog} onOpenChange={setShowNewOrderDialog}>
                <DialogTrigger asChild>
                  <Button size='sm' className='gap-2'>
                    <Plus className='h-4 w-4' />
                    New Order
                  </Button>
                </DialogTrigger>
              <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                  <DialogTitle>Create New Order</DialogTitle>
                  <DialogDescription>
                    Enter customer details to create a new order.
                  </DialogDescription>
                </DialogHeader>

                {submitError && (
                  <div className='bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex gap-3'>
                    <AlertCircle className='h-5 w-5 text-destructive shrink-0 mt-0.5' />
                    <p className='text-sm text-destructive'>{submitError}</p>
                  </div>
                )}

                <form onSubmit={handleNewOrder} className='space-y-4'>
                  <div className='space-y-2'>
                    <label className='block text-sm font-medium text-foreground'>
                      Customer Name
                    </label>
                    <Input
                      name='customerName'
                      placeholder='John Doe'
                      required
                      disabled={isSubmitting}
                      className='bg-muted/50'
                    />
                  </div>

                  <div className='space-y-2'>
                    <label className='block text-sm font-medium text-foreground'>Email</label>
                    <Input
                      name='customerEmail'
                      type='email'
                      placeholder='john@example.com'
                      required
                      disabled={isSubmitting}
                      className='bg-muted/50'
                    />
                  </div>

                  <div className='space-y-2'>
                    <label className='block text-sm font-medium text-foreground'>Phone</label>
                    <Input
                      name='customerPhone'
                      placeholder='+1 234 567 8900'
                      required
                      disabled={isSubmitting}
                      className='bg-muted/50'
                    />
                  </div>

                  <div className='space-y-2'>
                    <label className='block text-sm font-medium text-foreground'>
                      Shipping Address
                    </label>
                    <Textarea
                      name='shippingAddress'
                      placeholder='123 Main St, City, State ZIP'
                      required
                      disabled={isSubmitting}
                      className='bg-muted/50'
                    />
                  </div>

                  <div className='space-y-2'>
                    <label className='block text-sm font-medium text-foreground'>
                      Notes (optional)
                    </label>
                    <Textarea
                      name='notes'
                      placeholder='Any special instructions...'
                      disabled={isSubmitting}
                      className='bg-muted/50'
                    />
                  </div>

                  <div className='flex gap-2 justify-end pt-4'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => {
                        setShowNewOrderDialog(false);
                        setSubmitError(null);
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type='submit' disabled={isSubmitting} className='gap-2'>
                      {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
                      {isSubmitting ? 'Creating...' : 'Create Order'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            ) : (
              <Button size='sm' disabled title='Only managers and operators can create orders' className='gap-2'>
                <Plus className='h-4 w-4' />
                New Order
              </Button>
            )}
          </div>

          {/* Table */}
          {orders.length === 0 ? (
            <div className='py-12 text-center'>
              <p className='text-muted-foreground'>
                No orders yet. Click "New Order" to create one.
              </p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow className='hover:bg-transparent border-border'>
                    <TableHead className='text-foreground font-semibold'>Order #</TableHead>
                    <TableHead className='text-foreground font-semibold'>Customer</TableHead>
                    <TableHead className='text-foreground font-semibold'>Status</TableHead>
                    <TableHead className='text-foreground font-semibold text-right'>Items</TableHead>
                    <TableHead className='text-foreground font-semibold'>Created</TableHead>
                    <TableHead className='text-foreground font-semibold text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow
                      key={order.id}
                      className='border-border hover:bg-muted/50 cursor-pointer transition-colors'
                      onClick={() => handleViewOrder(order)}
                    >
                      <TableCell className='font-semibold text-foreground'>
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className='font-medium text-foreground'>{order.customerName}</p>
                          <p className='text-xs text-muted-foreground'>{order.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${STATUS_COLORS[order.status]} capitalize`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right text-foreground'>
                        {order.items.length}
                      </TableCell>
                      <TableCell className='text-sm text-muted-foreground'>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className='text-right'>
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewOrder(order);
                          }}
                          className='gap-1'
                        >
                          <Eye className='h-4 w-4' />
                          <span className='hidden sm:inline'>View</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          open={showDetailModal}
          onOpenChange={setShowDetailModal}
          onOrderUpdated={(updatedOrder) => {
            setSelectedOrder(updatedOrder);
          }}
        />
      )}
    </>
  );
}
