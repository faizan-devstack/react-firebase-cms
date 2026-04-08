# MiniShip CMS - Complete Documentation

## Project Overview
MiniShip CMS is a small-scale warehouse and order management dashboard built with React, Vite, TypeScript, Firebase (Firestore + Realtime Database + Storage), and shadcn/ui components.

**Version:** 1.0.0  
**Demo Dashboard:** Firebase-powered, real-time updates  
**Tech Stack:** React + Vite + TypeScript + Tailwind + shadcn/ui + Firebase  

---

## Files Created / Modified

### Core Application Files
- **src/App.tsx** — Main router (Login → Dashboard based on auth state)
- **src/main.tsx** — Entry point
- **src/firebase.ts** — Firebase initialization (unchanged)

### Authentication & Hooks
- **src/hooks/useAuth.ts** — Custom auth hook with login/logout/role management
- **src/components/cms/Login.tsx** — Login page with demo credentials

### Dashboard Components
- **src/pages/Home.tsx** — Main dashboard page with sticky header and footer
- **src/components/cms/Dashboard.tsx** — Stats cards + Tables/Queue sections
- **src/components/cms/OrdersTable.tsx** — Real-time orders table with CRUD
- **src/components/cms/OrderDetailModal.tsx** — Order details with Firebase Storage upload
- **src/components/cms/ExceptionQueue.tsx** — Exception orders table with resolve/delete
- **src/components/cms/SyncButton.tsx** — Demo button to add random orders

### Types & Data
- **src/lib/types.ts** — TypeScript interfaces for Order, Exception, User, etc.
- **src/lib/firestore.ts** — Firestore helper functions (CRUD, real-time listeners)

### UI Components
- **src/components/ui/button.tsx** — shadcn Button (existing)
- **src/components/ui/input.tsx** — shadcn Input (existing)
- **src/components/ui/footer.tsx** — Custom footer with version info
- **src/components/ui/skeleton.tsx** — Loading skeleton component

### Configuration
- **index.html** — Entry HTML
- **package.json** — Dependencies
- **tsconfig.json** — TypeScript config
- **vite.config.ts** — Vite config
- **tailwind.config.js** — Tailwind CSS (existing)

---

## Database Collections

### `cms_users` Collection
```json
{
  "email": "user@example.com",
  "role": "admin|warehouse|manager|viewer",
  "createdAt": Timestamp,
  "lastLogin": Timestamp
}
```

### `orders` Collection
```json
{
  "id": "auto-generated",
  "orderNumber": "ORD-1712592000000",
  "customerId": "CUST-123",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1 234 567 8900",
  "status": "pending|processing|shipped|delivered|cancelled|exception",
  "items": [
    {
      "id": "ITEM-1",
      "productId": "PROD-123",
      "productName": "Widget A",
      "quantity": 2,
      "price": 29.99,
      "sku": "SKU-001"
    }
  ],
  "totalAmount": 59.98,
  "shippingAddress": "123 Main St, City, State ZIP",
  "createdAt": Timestamp,
  "updatedAt": Timestamp,
  "trackingNumber": "optional",
  "notes": "Order notes and packing slip links"
}
```

### `exceptions` Collection
```json
{
  "id": "auto-generated",
  "orderId": "order-doc-id",
  "orderNumber": "ORD-1712592000000",
  "exceptionType": "out_of_stock|damaged|address_issue|payment_failed|other",
  "description": "Issue description",
  "severity": "low|medium|high",
  "status": "open|in_progress|resolved",
  "assignedTo": "optional-user-id",
  "createdAt": Timestamp,
  "updatedAt": Timestamp,
  "resolutionNotes": "optional"
}
```

### `orders/{orderId}/{packingSlip}` (Firebase Storage)
- Uploaded packing slips stored in Storage
- URL saved in order notes field
- Supports: PDF, JPG, PNG, DOC, DOCX

---

## Demo Credentials

### Login
1. **Admin Account**
   - Email: `admin@minship.demo`
   - Password: `admin@123`
   - Role: admin

2. **Warehouse Account**
   - Email: `warehouse@minship.demo`
   - Password: `warehouse@123`
   - Role: warehouse

### Demo Data Generator
Click "Simulate ShipHero Sync" button to add 1-2 random orders to Firestore. Watch the dashboard update in real-time!

---

## Role-Based Access Control (RBAC)

| Feature | Admin | Manager | Warehouse | Viewer |
|---------|:-----:|:-------:|:---------:|:------:|
| View Orders | ✓ | ✓ | ✓ | ✓ |
| Create Orders | ✓ | ✓ | ✓ | ✗ |
| Edit Order Notes | ✓ | ✓ | ✓ | ✗ |
| Change Order Status | ✓ | ✓ | ✓ | ✗ |
| Mark as Exception | ✓ | ✓ | ✓ | ✗ |
| Resolve Exceptions | ✓ | ✓ | ✓ | ✗ |
| Delete Orders | ✓ | ✗ | ✗ | ✗ |
| Upload Packing Slip | ✓ | ✓ | ✓ | ✗ |

---

## Testing Real-Time Updates

### Method 1: Two Browser Tabs
1. Open MiniShip CMS in **Tab A** as Warehouse user
2. Open MiniShip CMS in **Tab B** as Admin user
3. In Tab A: Create a new order using "New Order" button
4. **Instantly** see the new order in Tab B's table
5. In Tab B: Change order status to "exception"
6. **Tab A** automatically updates
7. In Tab A: Click "Resolve" on exception
8. **Tab B** sees the order status change in real-time

### Method 2: Simulate Sync Button
1. Open dashboard in any tab
2. Click "Simulate ShipHero Sync" button
3. Watch stats and table update instantly
4. Open second tab in different role account
5. See all updates reflected immediately

### Method 3: Exception Queue
1. Create order in Tab A
2. Open order detail in Tab B, mark as exception
3. Go to Tab A "Exception Queue" section
4. See exception appear instantly
5. Click "Resolve" in Tab A
6. Watch order move back to orders table in Tab B

---

## Firebase Setup Instructions

### 1. Create Firebase Project
- Go to https://firebase.google.com
- Click "Go to console"
- Create new project: "minship-cms"
- Select region (us-east-1 recommended)

### 2. Enable Services
- **Authentication:**
  - Go to Authentication
  - Enable "Email/Password" provider
  - Create test users or use demo credentials

- **Firestore Database:**
  - Create database in "us-east-1" (or matching region)
  - Start in test mode (we'll add security rules)

- **Realtime Database:**
  - Create database in "us-east-1"
  - Leave default for testing

- **Storage:**
  - Enable Cloud Storage
  - Create bucket in "us-east-1"

### 3. Get Firebase Config
- Go to Project Settings → General tab
- Copy Firebase config
- Already in `src/firebase.ts`

---

## Firestore Security Rules

Copy and paste these rules in Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow authenticated users to read their own user doc
    match /cms_users/{uid} {
      allow read: if request.auth.uid == uid;
      allow write: if request.auth.uid == uid && request.auth.uid == resource.data.userId;
    }

    // Orders: Authenticated users can read all, write only if permitted role
    match /orders/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       request.auth.token.role in ['admin', 'manager', 'warehouse'];
      allow update: if request.auth != null && 
                       request.auth.token.role in ['admin', 'manager', 'warehouse'];
      allow delete: if request.auth != null && 
                       request.auth.token.role == 'admin';
    }

    // Exceptions: Authenticated users can read all, write only if permitted role
    match /exceptions/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       request.auth.token.role in ['admin', 'manager', 'warehouse'];
      allow update: if request.auth != null && 
                       request.auth.token.role in ['admin', 'manager', 'warehouse'];
      allow delete: if request.auth != null && 
                       request.auth.token.role == 'admin';
    }
  }
}
```

### Alternative: Permissive Rules (For Development/Testing)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Firebase Storage Security Rules

Go to Firebase Console → Storage → Rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload packing slips
    match /orders/{orderId}/{fileName} {
      allow read, write: if request.auth != null;
      allow delete: if request.auth.token.role == 'admin';
    }
  }
}
```

---

## Environment Setup

### Install Dependencies
```bash
npm install
# or
pnpm install
```

### Firebase Emulator (Optional)
For local development without Firebase:
```bash
npm install -g firebase-tools
firebase init emulators
firebase emulators:start
```

### Run Development Server
```bash
npm run dev
```

Access at `http://localhost:5173`

---

## Features Implemented

✅ **Authentication**
- Email/password login
- Role-based access control (RBAC)
- Demo credentials for testing
- Firestore-based role storage

✅ **Orders Management**
- Real-time order table with Firestore listener
- Create new orders (name, email, phone, address, notes)
- View order details with full information
- Change order status (pending → processing → shipped → delivered)
- Add/edit order notes
- Mark orders as exceptions

✅ **Exception Queue**
- Real-time exception list (orders with status = exception)
- Resolve exceptions (back to pending)
- Delete orders (admin only)
- Role-based permissions

✅ **Dashboard Statistics**
- Total orders count
- Pending, processing, shipped, delivered breakdown
- Open exceptions count
- Real-time updates via Firestore listeners

✅ **Firebase Integration**
- Firestore CRUD operations with Timestamp handling
- Real-time listeners with auto-cleanup
- Firebase Storage for packing slip uploads
- Firebase Authentication with custom claims

✅ **Responsive UI**
- Mobile-first design
- Sticky navbar
- Responsive tables with horizontal scroll
- Responsive stat cards (1-2-4 columns)
- Footer with version info

✅ **UX Polish**
- Loading skeletons
- Error messages with alerts
- Success feedback
- Disabled states for unauthorized actions
- Tooltip/title attributes for disabled buttons

✅ **Demo Features**
- "Simulate ShipHero Sync" button adds random orders
- Pre-filled demo credentials
- Show/hide buttons based on role

---

## Common Issues & Solutions

### Issue: Login fails with "user-not-found"
**Solution:** This is expected. The app auto-creates accounts. Just use any email/password.

### Issue: Real-time updates not working
**Solution:** 
- Check Firestore rules allow read access
- Ensure user is authenticated
- Open browser DevTools → Network → check no CORS errors

### Issue: File upload fails
**Solution:**
- Check Storage rules allow authenticated uploads
- Verify file size (development Firebase has limits)
- Check browser console for specific error

### Issue: Orders not appearing in table
**Solution:**
- Check `orders` collection exists in Firestore
- Verify user has read permission in Security Rules
- Check browser console for listener errors

---

## Customization Guide

### Add New Order Status
1. Update `OrderStatus` type in `src/lib/types.ts`
2. Add color mapping in `STATUS_COLORS` in OrdersTable.tsx
3. Update status dropdown in OrderDetailModal.tsx

### Add New Roles
1. Update role type in `useAuth.ts`
2. Add RBAC checks in components
3. Update Firestore Security Rules

### Customize Dashboard Stats
1. Modify stat calculations in `Dashboard.tsx`
2. Change icon/colors for stat cards
3. Add/remove stat cards as needed

### Change Theme Colors
1. Edit `src/index.css` custom properties
2. Update Tailwind `tailwind.config.js`
3. Component colors auto-update via Tailwind classes

---

## Performance Notes

- Real-time listeners auto-cleanup on unmount
- Firestore queries optimized with `where` filters
- No N+1 queries
- Efficient state updates (React 18)
- Lazy loading via responsive tables

---

## Deployment Checklist

- [ ] Firebase project created and configured
- [ ] Firestore collections created
- [ ] Firebase Storage enabled
- [ ] Security Rules deployed
- [ ] Demo user accounts created
- [ ] `src/firebase.ts` config updated
- [ ] Production build tested (`npm run build`)
- [ ] Environment variables set (if using)
- [ ] Deployment platform configured (Vercel, Firebase Hosting, etc.)

---

## Next Steps / Future Enhancements

- [ ] Export orders to CSV
- [ ] Email notifications on status change
- [ ] Batch order operations
- [ ] Inventory management dashboard
- [ ] Customer portal (view their orders)
- [ ] Advanced filtering & search
- [ ] Order history & audit log
- [ ] Performance analytics
- [ ] Integration with ShipHero API
- [ ] Mobile app version

---

## Support

For issues:
1. Check browser console for errors
2. Verify Firebase setup
3. Check Firestore Security Rules
4. Review demo credentials
5. Test in incognito mode (clear cache)

---

**MiniShip CMS v1.0.0**  
Built with React + Firebase + shadcn/ui  
© 2026
