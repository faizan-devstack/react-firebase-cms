import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { addOrder } from '@/lib/firestore';
import { RefreshCw, Loader2 } from 'lucide-react';

const DEMO_CUSTOMERS = [
  { name: 'Alice Johnson', email: 'alice@example.com', phone: '+1 234 567 8900' },
  { name: 'Bob Smith', email: 'bob@example.com', phone: '+1 345 678 9012' },
  { name: 'Charlie Brown', email: 'charlie@example.com', phone: '+1 456 789 0123' },
  { name: 'Diana Prince', email: 'diana@example.com', phone: '+1 567 890 1234' },
  { name: 'Eve Wilson', email: 'eve@example.com', phone: '+1 678 901 2345' },
];

const DEMO_ADDRESSES = [
  '123 Main St, New York, NY 10001',
  '456 Oak Ave, Los Angeles, CA 90001',
  '789 Pine Rd, Chicago, IL 60601',
  '321 Elm St, Houston, TX 77001',
  '654 Maple Dr, Phoenix, AZ 85001',
];

export default function SyncButton() {
  const [isSyncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const generateRandomOrder = () => {
    const customer = DEMO_CUSTOMERS[Math.floor(Math.random() * DEMO_CUSTOMERS.length)];
    const address = DEMO_ADDRESSES[Math.floor(Math.random() * DEMO_ADDRESSES.length)];
    const randomInt = Math.floor(Math.random() * 10000);

    return {
      orderNumber: `ORD-${Date.now()}-${randomInt}`,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      customerId: `CUST-${randomInt}`,
      status: 'pending' as const,
      items: [],
      totalAmount: 0,
      shippingAddress: address,
      notes: 'Demo order from ShipHero sync',
    };
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage(null);

    try {
      // Add 1-2 random orders
      const orderCount = Math.random() > 0.5 ? 1 : 2;
      for (let i = 0; i < orderCount; i++) {
        await addOrder(generateRandomOrder());
        // Small delay between adds to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      setSyncMessage(`✓ Successfully synced ${orderCount} order${orderCount !== 1 ? 's' : ''}!`);

      // Clear message after 3 seconds
      setTimeout(() => setSyncMessage(null), 3000);
    } catch (error: any) {
      setSyncMessage(`✗ Sync failed: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className='flex flex-col items-center gap-3'>
      <Button
        onClick={handleSync}
        disabled={isSyncing}
        size='lg'
        className='gap-2 w-full sm:w-auto shadow-lg'
      >
        {isSyncing ? (
          <>
            <Loader2 className='h-5 w-5 animate-spin' />
            Syncing...
          </>
        ) : (
          <>
            <RefreshCw className='h-5 w-5' />
            Simulate ShipHero Sync
          </>
        )}
      </Button>

      {/* Sync Message */}
      {syncMessage && (
        <div
          className={`text-sm font-medium px-4 py-2 rounded-lg ${
            syncMessage.includes('✓')
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          }`}
        >
          {syncMessage}
        </div>
      )}

      {/* Info Text */}
      <p className='text-xs text-muted-foreground text-center'>
        Click to simulate syncing 1-2 random orders from ShipHero. Watch the dashboard update in
        real-time!
      </p>
    </div>
  );
}
