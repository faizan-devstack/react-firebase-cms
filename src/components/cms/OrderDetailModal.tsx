import { useState } from 'react';
import type { Order, OrderStatus } from '@/lib/types';
import { updateOrder, addException } from '@/lib/firestore';
import { useAuth } from '@/hooks/useAuth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '@/firebase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AlertCircle, Loader2, Upload } from 'lucide-react';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  shipped: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  exception: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const STATUS_OPTIONS: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'exception',
  'cancelled',
];

interface OrderDetailModalProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderUpdated?: (order: Order) => void;
}

export default function OrderDetailModal({
  order,
  open,
  onOpenChange,
  onOrderUpdated,
}: OrderDetailModalProps) {
  const { role } = useAuth();
  const storage = getStorage(app);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>(order.status);
  const [notes, setNotes] = useState(order.notes || '');
  const [error, setError] = useState<string | null>(null);
  const [packingSlipUrl, setPackingSlipUrl] = useState(order.trackingNumber || '');

  // RBAC: Check permissions
  const isAdmin = role === 'admin';
  const canMarkException = isAdmin || role === 'warehouse' || role === 'manager';

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      // Create unique file name with timestamp
      const fileName = `packing-slip-${order.id}-${Date.now()}-${file.name}`;
      const fileRef = ref(storage, `orders/${order.id}/${fileName}`);

      // Upload file
      await uploadBytes(fileRef, file);

      // Get download URL
      const downloadUrl = await getDownloadURL(fileRef);

      // Save URL to order notes
      await updateOrder(order.id, {
        notes: `${notes}\n[Packing Slip: ${fileName}](${downloadUrl})`,
      });

      setPackingSlipUrl(downloadUrl);
      setNotes(`${notes}\n[Packing Slip: ${fileName}](${downloadUrl})`);

      // Clear input
      if (e.target) e.target.value = '';
    } catch (err: any) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleStatusChange = async () => {
    if (newStatus === order.status && notes === (order.notes || '')) return;

    setIsUpdating(true);
    setError(null);

    try {
      await updateOrder(order.id, {
        status: newStatus,
        notes,
      });

      const updatedOrder: Order = {
        ...order,
        status: newStatus,
        notes,
        updatedAt: new Date(),
      };
      onOrderUpdated?.(updatedOrder);
    } catch (err: any) {
      setError(err.message || 'Failed to update order');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkException = async () => {
    setIsUpdating(true);
    setError(null);

    try {
      // Create an exception for this order
      await addException({
        orderId: order.id,
        orderNumber: order.orderNumber,
        exceptionType: 'other',
        description: notes || 'Exception marked from order detail',
        severity: 'medium',
        status: 'open',
      });

      // Update order status to exception
      await updateOrder(order.id, {
        status: 'exception',
        notes,
      });

      const updatedOrder: Order = {
        ...order,
        status: 'exception',
        notes,
        updatedAt: new Date(),
      };
      onOrderUpdated?.(updatedOrder);
      setNewStatus('exception');
    } catch (err: any) {
      setError(err.message || 'Failed to mark exception');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{order.orderNumber}</DialogTitle>
          <DialogDescription>View and manage order details</DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Error Alert */}
          {error && (
            <div className='bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex gap-3'>
              <AlertCircle className='h-5 w-5 text-destructive shrink-0 mt-0.5' />
              <p className='text-sm text-destructive'>{error}</p>
            </div>
          )}

          {/* Current Status */}
          <Card className='border border-border bg-muted/30 p-4'>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-muted-foreground'>Current Status</p>
              <Badge
                className={`${STATUS_COLORS[order.status]} capitalize text-base px-3 py-1`}
              >
                {order.status}
              </Badge>
            </div>
          </Card>

          {/* Customer Info */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-sm font-medium text-muted-foreground mb-1'>Customer Name</p>
              <p className='font-medium text-foreground'>{order.customerName}</p>
            </div>
            <div>
              <p className='text-sm font-medium text-muted-foreground mb-1'>Email</p>
              <p className='text-sm text-foreground'>{order.customerEmail}</p>
            </div>
            <div>
              <p className='text-sm font-medium text-muted-foreground mb-1'>Phone</p>
              <p className='text-sm text-foreground'>{order.customerPhone}</p>
            </div>
            <div>
              <p className='text-sm font-medium text-muted-foreground mb-1'>Order Date</p>
              <p className='text-sm text-foreground'>
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <p className='text-sm font-medium text-muted-foreground mb-2'>Shipping Address</p>
            <div className='bg-muted/50 border border-border rounded p-3 text-sm text-foreground whitespace-pre-wrap'>
              {order.shippingAddress}
            </div>
          </div>

          {/* Items */}
          {order.items.length > 0 && (
            <div>
              <p className='text-sm font-medium text-muted-foreground mb-2'>
                Items ({order.items.length})
              </p>
              <div className='space-y-2'>
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className='bg-muted/50 border border-border rounded p-3 flex justify-between'
                  >
                    <div>
                      <p className='font-medium text-foreground'>{item.productName}</p>
                      <p className='text-xs text-muted-foreground'>SKU: {item.sku}</p>
                    </div>
                    <div className='text-right'>
                      <p className='font-medium text-foreground'>
                        {item.quantity} × ${item.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total Amount */}
          {order.totalAmount > 0 && (
            <div className='bg-primary/5 border border-primary/20 rounded p-4'>
              <div className='flex justify-between items-center'>
                <p className='font-medium text-foreground'>Total Amount</p>
                <p className='text-2xl font-bold text-primary'>
                  ${order.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Tracking Info */}
          {order.trackingNumber && (
            <div>
              <p className='text-sm font-medium text-muted-foreground mb-1'>Tracking Number</p>
              <p className='font-mono text-sm text-foreground'>{order.trackingNumber}</p>
            </div>
          )}

          {/* Notes Editor */}
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-foreground'>Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='Add or edit order notes...'
              disabled={isUpdating}
              className='min-h-24 bg-muted/50'
            />
          </div>

          {/* Firebase Storage - Upload Packing Slip */}
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-foreground'>
              Upload Packing Slip
            </label>
            <div className='flex gap-2'>
              <label className='flex-1'>
                <input
                  type='file'
                  onChange={handleFileUpload}
                  disabled={isUploading || isUpdating}
                  className='hidden'
                  accept='.pdf,.jpg,.jpeg,.png,.doc,.docx'
                />
                <Button
                  type='button'
                  variant='outline'
                  className='w-full gap-2 cursor-pointer'
                  disabled={isUploading || isUpdating}
                  asChild
                >
                  <span>
                    {isUploading ? (
                      <>
                        <Loader2 className='h-4 w-4 animate-spin' />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className='h-4 w-4' />
                        Choose File
                      </>
                    )}
                  </span>
                </Button>
              </label>
            </div>
            <p className='text-xs text-muted-foreground'>
              PDF, JPG, PNG, DOC, DOCX (Max size varies by Firebase plan)
            </p>
            {packingSlipUrl && (
              <div className='bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded p-2'>
                <p className='text-xs text-green-800 dark:text-green-200'>
                  ✓ Packing slip uploaded successfully
                </p>
              </div>
            )}
          </div>

          {/* Status Change Dropdown */}
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-foreground'>Change Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
              disabled={isUpdating}
              className='w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className='flex gap-2 justify-end pt-4 border-t border-border flex-wrap'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Close
            </Button>

            {canMarkException && order.status !== 'exception' && (
              <Button
                type='button'
                variant='destructive'
                onClick={handleMarkException}
                disabled={isUpdating}
                className='gap-2'
              >
                {isUpdating ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <AlertCircle className='h-4 w-4' />
                )}
                Mark Exception
              </Button>
            )}

            {(newStatus !== order.status || notes !== (order.notes || '')) && (
              <Button
                type='button'
                onClick={handleStatusChange}
                disabled={isUpdating}
                className='gap-2'
              >
                {isUpdating ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Updating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            )}
          </div>

          {/* Permissions Notice */}
          {!canMarkException && (
            <div className='bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded p-3 text-xs text-blue-800 dark:text-blue-200'>
              <p>
                <span className='font-medium'>Note:</span> Your role ({role || 'viewer'}) does not
                have permission to mark exceptions. Contact an administrator.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
