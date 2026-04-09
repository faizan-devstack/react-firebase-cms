import { useState, useEffect } from 'react';
import type { Order } from '@/lib/types';
import { listenToOrdersByStatus, updateOrderStatus } from '@/lib/firestore';
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
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Trash2, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ExceptionQueue() {
  const { role } = useAuth();
  const [exceptionOrders, setExceptionOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Listen to orders with exception status
  useEffect(() => {
    const unsubscribe = listenToOrdersByStatus('exception', (orders) => {
      setExceptionOrders(
        orders.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleResolve = async (orderId: string, currentNotes: string) => {
    setResolvingId(orderId);
    try {
      // Change status back to pending for review/reprocessing
      await updateOrderStatus(
        orderId,
        'pending',
        currentNotes ? `[RESOLVED FROM EXCEPTION] ${currentNotes}` : '[RESOLVED FROM EXCEPTION]'
      );
    } catch (error) {
      console.error('Error resolving exception:', error);
    } finally {
      setResolvingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedOrderId) return;

    setDeletingId(selectedOrderId);
    try {
      // Mark as cancelled instead of true deletion (safer for audit)
      await updateOrderStatus(selectedOrderId, 'cancelled', '[DELETED FROM EXCEPTIONS]');
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting order:', error);
    } finally {
      setDeletingId(null);
      setSelectedOrderId(null);
    }
  };

  const isAdmin = role === 'admin';
  const isWarehouse = role === 'warehouse';
  const canResolve = isAdmin || isWarehouse;
  const canDelete = isAdmin;

  if (loading) {
    return (
      <Card className='border border-canvas-border'>
        <div className='p-6 space-y-3'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='h-12 bg-canvas-bg-subtle rounded animate-pulse' />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className='border border-red-200 dark:border-red-900 bg-alert-bg dark:bg-alert-bg'>
        <div className='p-6 space-y-4'>
          {/* Header */}
          <div className='flex items-center gap-3'>
            <AlertCircle className='h-6 w-6 text-alert-solid' />
            <div>
              <h2 className='text-lg font-semibold text-canvas-text-contrast'>Exception Queue</h2>
              <p className='text-sm text-canvas-text'>
                {exceptionOrders.length} order{exceptionOrders.length !== 1 ? 's' : ''} requiring
                attention
              </p>
            </div>
          </div>

          {/* Role Info */}
          <div className='bg-canvas-base/50 border border-canvas-border rounded p-3 text-xs text-canvas-text space-y-1'>
            <p>
              <span className='font-medium'>Your Role:</span> {role || 'unknown'}
            </p>
            <p>
              <span className='font-medium'>Permissions:</span>{' '}
              {canResolve ? '✓ Resolve exceptions' : ''} {canDelete ? '✓ Delete orders' : ''}
            </p>
          </div>

          {/* Table */}
          {exceptionOrders.length === 0 ? (
            <div className='py-12 text-center'>
              <CheckCircle className='h-12 w-12 text-green-600 mx-auto mb-3 opacity-50' />
              <p className='text-canvas-text font-medium'>No exceptions!</p>
              <p className='text-sm text-canvas-text'>All orders are processing normally.</p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow className='hover:bg-transparent border-canvas-border'>
                    <TableHead className='text-canvas-text-contrast font-semibold'>Order #</TableHead>
                    <TableHead className='text-canvas-text-contrast font-semibold'>Customer</TableHead>
                    <TableHead className='text-canvas-text-contrast font-semibold'>Reason / Notes</TableHead>
                    <TableHead className='text-canvas-text-contrast font-semibold'>Created</TableHead>
                    <TableHead className='text-canvas-text-contrast font-semibold text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exceptionOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className='border-canvas-border hover:bg-canvas-bg-hover transition-colors'
                    >
                      <TableCell className='font-semibold text-canvas-text-contrast'>
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className='font-medium text-canvas-text-contrast'>{order.customerName}</p>
                          <p className='text-xs text-canvas-text'>{order.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className='text-sm text-canvas-text'>
                        <div className='max-w-xs truncate'>
                          {order.notes || '(no notes)'}
                        </div>
                      </TableCell>
                      <TableCell className='text-sm text-canvas-text'>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex gap-2 justify-end'>
                          {/* Resolve Button */}
                          <Button
                            size='sm'
                            variant='outline'
                            className='gap-1'
                            onClick={() => handleResolve(order.id, order.notes || '')}
                            disabled={resolvingId === order.id || !canResolve}
                          >
                            {resolvingId === order.id ? (
                              <Loader2 className='h-4 w-4 animate-spin' />
                            ) : (
                              <CheckCircle className='h-4 w-4' />
                            )}
                            <span className='hidden sm:inline'>Resolve</span>
                          </Button>

                          {/* Delete Button - Admin Only */}
                          {canDelete && (
                            <Button
                              size='sm'
                              variant='ghost'
                              className='gap-1 text-destructive hover:text-destructive hover:bg-destructive/10'
                              onClick={() => {
                                setSelectedOrderId(order.id);
                                setShowDeleteDialog(true);
                              }}
                              disabled={deletingId === order.id}
                            >
                              {deletingId === order.id ? (
                                <Loader2 className='h-4 w-4 animate-spin' />
                              ) : (
                                <Trash2 className='h-4 w-4' />
                              )}
                              <span className='hidden sm:inline'>Delete</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Permissions Notice */}
          {!canDelete && isWarehouse && (
            <div className='bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded p-3 text-xs text-blue-800 dark:text-blue-200'>
              <p>
                <span className='font-medium'>Warehouse Operator:</span> You can resolve exceptions
                but cannot delete orders. Contact an administrator to remove orders.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the order as cancelled and remove it from the exception queue. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteConfirm}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {deletingId ? <Loader2 className='h-4 w-4 animate-spin mr-2' /> : null}
            Delete Order
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
