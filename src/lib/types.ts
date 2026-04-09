/**
 * MiniShip CMS Types
 * Types for warehouse/order management system
 */

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'exception';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  sku: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: string;
  createdAt: Date;
  updatedAt: Date;
  expectedDelivery?: Date;
  trackingNumber?: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  reorderLevel: number;
  price: number;
  location: string;
  lastUpdated: Date;
}

export interface ExceptionQueueItem {
  id: string;
  orderId: string;
  orderNumber: string;
  exceptionType: 'out_of_stock' | 'damaged' | 'address_issue' | 'payment_failed' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved';
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolutionNotes?: string;
}

export interface DashboardStats {
  totalOrders: number;
  ordersProcessing: number;
  ordersShipped: number;
  pendingExceptions: number;
  lowStockItems: number;
  totalRevenue: number;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'warehouse';
  createdAt: Date;
  lastLogin?: Date;
}
