# MiniShip CMS - Quick Start Guide

## 🚀 Getting Started (5 Minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

Access at: `http://localhost:5173`

### Step 3: Login
Use one of these demo accounts:

| Account | Email | Password | Role |
|---------|-------|----------|------|
| Admin | `admin@minship.demo` | `admin@123` | admin |
| Warehouse | `warehouse@minship.demo` | `warehouse@123` | warehouse |

### Step 4: Explore Features
1. **Dashboard Stats** - See real-time order counts
2. **Create Order** - Click "New Order" button
3. **Simulate Sync** - Add random orders instantly
4. **Orders Table** - View all orders, click to edit
5. **Exception Queue** - Mark/resolve exceptions
6. **Upload Packing Slip** - Upload PDF/image files

---

## 🔄 Test Real-Time Updates

### Open Two Browser Tabs
1. Tab A: Login as Warehouse user
2. Tab B: Login as Admin user
3. **Tab A:** Create order → **Tab B** updates instantly
4. **Tab B:** Mark as exception → **Tab A** shows exception
5. **Tab A:** Resolve → **Tab B** updates instantly

You'll see the dashboard sync in real-time across all tabs!

---

## 🎯 Test Each Feature

### Create Order
1. Click "New Order" button
2. Fill customer name, email, phone
3. Enter shipping address
4. Click "Create Order"
5. See new order in table immediately

### Edit Order
1. Click any order in table
2. Change status dropdown
3. Add notes
4. Click "Save Changes"

### Mark Exception
1. Click order detail modal
2. Click "Mark Exception" button
3. Order moves to Exception Queue
4. See exception appear in Exception Queue section

### Resolve Exception
1. Go to "Exception Queue" section
2. Click "Resolve" button on any exception
3. Order returns to main orders table with pending status

### Upload Packing Slip
1. Click order → detail modal
2. Scroll to "Upload Packing Slip" section
3. Click "Choose File"
4. Select PDF, JPG, PNG, DOC, or DOCX
5. See "✓ Packing slip uploaded" confirmation
6. URL appears in order notes

### Admin Delete Order
1. Login as Admin
2. Go to Exception Queue
3. Click "Delete" button (warehouse users won't see this)
4. Confirm deletion
5. Order marked as cancelled

---

## 🛡️ Test Role-Based Access

### Warehouse vs Admin Permissions

#### Warehouse User Can:
✓ View all orders  
✓ Create orders  
✓ Edit order status/notes  
✓ Mark as exception  
✓ Resolve exceptions  
✓ Upload packing slips  

#### Warehouse User Cannot:
✗ Delete orders (button disabled/hidden)  
✗ See delete option in exception queue  

#### Admin User Can:
✓ Everything warehouse can do  
✓ Delete orders from exception queue  
✓ All admin functions  

### Test It:
1. Login as Warehouse → see "New Order" button active
2. Login as Viewer → see "New Order" button disabled
3. Create order as Admin
4. Switch to Warehouse → still can edit
5. Switch to Admin → can delete

---

## 📊 Dashboard Sections Explained

### Top Bar: Sync Button
- **"Simulate ShipHero Sync"** - Adds 1-2 random demo orders
- Watch stats and table update instantly
- Great for testing real-time features

### Stats Cards (Row 1)
- **Total Orders** - All orders in system
- **Pending** - Orders waiting to be processed
- **Shipped** - Orders on their way
- **⚠️ Exceptions** - Orders with issues

### Status Breakdown (Row 2)
- **5-column grid** showing:
  - Pending count (yellow)
  - Processing count (blue)
  - Shipped count (green)
  - Delivered count (emerald)
  - Exceptions count (red)

### Orders Table
- **All orders** sorted by newest first
- Click any row to open detail modal
- See customer, status, items count, creation date
- "View" button to open details

### Exception Queue
- **Only exception orders** shown here
- 4 columns: Order #, Customer, Reason, Created, Actions
- "Resolve" button → moves back to pending
- "Delete" button (admin only) → marks as cancelled
- Shows active user role and permissions

---

## 🔧 Firestore Collections (Already Exists)

### cms_users
Created automatically when you login with demo credentials

### orders
Orders go here. Sample structure:
```
{
  orderNumber: "ORD-1712592000000"
  customerName: "John Doe"
  status: "pending"
  items: []
  createdAt: Timestamp
}
```

### exceptions
Exception records go here

### Storage (orders/{orderId}/...)
Uploaded packing slips stored here

---

## 🎨 Customization Quick Tips

### Change Colors
- Edit Tailwind classes in components
- Example: `bg-red-100` → `bg-purple-100`

### Add New Stat
- Edit `Dashboard.tsx` stats array
- Add calculation from orders array

### Change Demo Credentials
- Edit `DEMO_ACCOUNTS` in `Login.tsx`

### Add New Role
- Update `UserRole` type in `useAuth.ts`
- Add RBAC check in components

---

## 📱 Mobile Testing

- Dashboard is responsive
- On mobile: hamburger menu would be next
- Currently: user email hidden, badge shown
- Tables scroll horizontally on small screens

---

## 🐛 Troubleshooting

### Button Not Appearing?
Check your role in navbar. Some buttons disabled for certain roles.

### Order Not Updating?
1. Check browser console for errors
2. Refresh page
3. Verify Firestore rules allow read/write

### Upload Not Working?
1. Check file size (small files work better)
2. Verify Storage rules configured
3. Check browser console network tab

### Real-time Not Syncing?
1. Open two tabs
2. Create in one → should appear in other instantly
3. If not: check Firestore listener console logs

---

## 🚀 Production Build

```bash
npm run build
```

Creates optimized build in `dist/` folder

Deploy to:
- **Vercel** (npm i -g vercel → vercel)
- **Firebase Hosting** (firebase deploy)
- **Netlify** (connect GitHub → auto-deploy)

---

## 📚 File Structure Reference

```
src/
├── components/cms/
│   ├── Login.tsx           ← Login page
│   ├── Dashboard.tsx       ← Main dashboard
│   ├── OrdersTable.tsx     ← Orders list
│   ├── OrderDetailModal.tsx ← Order editing
│   ├── ExceptionQueue.tsx  ← Exception list
│   └── SyncButton.tsx      ← Demo sync button
├── lib/
│   ├── firestore.ts        ← Database functions
│   └── types.ts            ← TypeScript types
├── hooks/
│   └── useAuth.ts          ← Auth hook
├── pages/
│   └── Home.tsx            ← Dashboard page
└── App.tsx                 ← Router
```

---

## ⚡ Tips & Tricks

1. **Test Multiple Tabs** - Open 2-3 tabs with different roles
2. **Use Simulate Sync** - Click button multiple times to see stats grow
3. **Exception Workflow** - Create → mark exception → resolve
4. **File Upload** - Upload small PDF/image files
5. **Check Console** - DevTools shows Firestore operations

---

## 🎓 Learning Path

1. **Understand Auth** - Login flow, roles, permissions
2. **Explore Orders** - Create, edit, view, delete operations
3. **Master Real-Time** - Open 2 tabs, see instant updates
4. **Admin Features** - Test delete, exception resolution
5. **File Upload** - Try packing slip upload feature

---

## 📞 Next Steps

- Read `MINSHIP_DOCS.md` for full documentation
- Check comments in code files
- Explore Firestore console
- Try deploying to cloud

**Enjoy testing MiniShip CMS! 🚀**
