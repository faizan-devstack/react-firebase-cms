# MiniShip CMS

A small-scale warehouse and order management dashboard built with **React**, **Vite**, **TypeScript**, **Firebase**, and **shadcn/ui**.

**Version:** 1.0.0 | **Status:** Production-ready

---

## 🚀 Quick Start (5 Minutes)

### 1. Install & Run
```bash
npm install
npm run dev
```
Access at: `http://localhost:5173`

### 2. Login with Demo Credentials
| Account | Email | Password | Role |
|---------|-------|----------|------|
| Admin | `admin@minship.demo` | `admin@123` | admin |
| Warehouse | `warehouse@minship.demo` | `warehouse@123` | warehouse |

### 3. Explore Features
- Create orders, edit status, upload packing slips
- Mark exceptions and resolve them in real-time
- Click "Simulate ShipHero Sync" to add demo orders
- Open 2 tabs to see real-time updates across devices

---

## ✨ Features

### ✅ Authentication & Security
- Email/password Firebase authentication
- Auto-create accounts on signup
- Role-based access control (Admin, Manager, Warehouse, Viewer)
- Persistent user state across refreshes

### ✅ Dashboard & Real-Time Stats
- Live stat cards (Total, Pending, Shipped, Exceptions)
- Real-time Firestore listeners (auto-update instantly)
- Order status breakdown grid
- Exception alert banner

### ✅ Orders Management
- Real-time orders table with sorting
- Create/edit/delete orders
- Change status (pending → processing → shipped → delivered)
- Add order notes
- Upload packing slips to Firebase Storage
- Track customer info and items per order

### ✅ Exception Queue
- Real-time exception orders list
- Resolve exceptions (move back to pending)
- Delete orders (admin only)
- Confirmation dialogs for destructive actions

### ✅ Role-Based Access Control (RBAC)
| Feature | Admin | Manager | Warehouse | Viewer |
|---------|:-----:|:-------:|:---------:|:------:|
| View Orders | ✓ | ✓ | ✓ | ✓ |
| Create Orders | ✓ | ✓ | ✓ | ✗ |
| Edit Status/Notes | ✓ | ✓ | ✓ | ✗ |
| Mark Exception | ✓ | ✓ | ✓ | ✗ |
| Resolve Exception | ✓ | ✓ | ✓ | ✗ |
| Delete Orders | ✓ | ✗ | ✗ | ✗ |

### ✅ Responsive Design
- Mobile-first layout (1-2-4 col grid on mobile-tablet-desktop)
- Sticky navbar and footer
- Horizontal scroll tables on mobile
- Touch-friendly buttons (44px+ minimum)
- Dark/light mode compatible

### ✅ Real-Time Features
- Firestore onSnapshot listeners
- Multi-tab synchronization (open 2 tabs → see instant updates)
- Auto-cleanup on component unmount
- No N+1 queries

### ✅ Firebase Storage
- Upload packing slips (PDF, JPG, PNG, DOC, DOCX)
- Download URLs stored in order notes
- File type validation and progress feedback

---

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Fast build tool
- **TypeScript** - Type safety
- **Firebase** - Authentication, Firestore, Storage
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Lucide React** - Icons
- **React Router v6** - Navigation

---

## 📁 Project Structure

```
src/
├── components/
│   ├── cms/
│   │   ├── Login.tsx              Login page with demo credentials
│   │   ├── Dashboard.tsx          Stats cards + tables + queue
│   │   ├── OrdersTable.tsx        Real-time orders table
│   │   ├── OrderDetailModal.tsx   Edit orders + upload files
│   │   ├── ExceptionQueue.tsx     Exception management
│   │   └── SyncButton.tsx         Demo order generator
│   └── ui/                        shadcn/ui components
├── lib/
│   ├── firestore.ts               CRUD + real-time listeners
│   └── types.ts                   TypeScript interfaces
├── hooks/
│   └── useAuth.ts                 Auth + role management
├── pages/
│   └── Home.tsx                   Main layout (navbar + footer)
├── App.tsx                        Router
├── firebase.ts                    Firebase config
└── main.tsx                       Entry point
```

---

## 📊 Firestore Collections

| Collection | Purpose |
|-----------|---------|
| `cms_users` | User roles & metadata |
| `orders` | All orders (real-time) |
| `exceptions` | Exception records (real-time) |
| `orders/{id}/*` (Storage) | Uploaded packing slips |

---

## 🔄 Test Real-Time Updates

1. Open MiniShip in **Tab A** (Warehouse) and **Tab B** (Admin)
2. **Tab A:** Create order → **Tab B** updates instantly
3. **Tab B:** Mark as exception → **Tab A** shows exception queue
4. **Tab A:** Resolve → **Tab B** updates instantly

Multi-tab sync works seamlessly with Firestore listeners!

---

## 🔧 Firebase Setup

### 1. Create Firebase Project
- Go to https://firebase.google.com
- Create project "minship-cms"
- Enable: Authentication (Email/Password), Firestore, Storage

### 2. Update Config
Your `src/firebase.ts` already has the config. Add your Firebase credentials if needed.

### 3. Deploy Security Rules

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /cms_users/{uid} {
      allow read: if request.auth.uid == uid;
    }
    match /orders/{document=**} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null && 
          request.auth.token.role in ['admin', 'manager', 'warehouse'];
      allow delete: if request.auth?.token?.role == 'admin';
    }
    match /exceptions/{document=**} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null && 
          request.auth.token.role in ['admin', 'manager', 'warehouse'];
      allow delete: if request.auth?.token?.role == 'admin';
    }
  }
}
```

**Storage Rules:**
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /orders/{orderId}/{fileName} {
      allow read, write: if request.auth != null;
      allow delete: if request.auth.token.role == 'admin';
    }
  }
}
```

### 4. Create Demo Users (in Firebase Console)
- `admin@minship.demo` / `admin@123` (role: admin)
- `warehouse@minship.demo` / `warehouse@123` (role: warehouse)

---

## 🎯 Common Use Cases

### Create Order
1. Click "New Order" button
2. Enter customer name, email, phone, address
3. System creates order automatically

### Mark Exception
1. Click order in table
2. Click "Mark Exception" button
3. Order moves to Exception Queue (real-time)

### Resolve Exception
1. Go to Exception Queue
2. Click "Resolve" button
3. Order returns to Pending (real-time)

### Upload Packing Slip
1. Click order detail
2. Select file (PDF, JPG, PNG, DOC, DOCX)
3. Firebase Storage saves it, URL stored in order notes

### Delete Order (Admin Only)
1. Go to Exception Queue
2. Click "Delete" button
3. Confirm deletion (Warehouse users don't see this button)

---

## 🎨 Responsive Breakpoints

| Breakpoint | Layout |
|-----------|--------|
| Mobile (<640px) | 1-col cards, full-width tables, horizontal scroll |
| Tablet (640-1024px) | 2-col cards, scrollable tables |
| Desktop (>1024px) | 4-col cards, full-width tables |

---

## 📦 Build & Deploy

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Deploy
- **Vercel:** `npm i -g vercel && vercel`
- **Firebase Hosting:** `firebase init hosting && firebase deploy`
- **Netlify:** Connect GitHub repo for auto-deploy

---

## 🔐 Security Features

- ✅ Firebase Auth with email/password
- ✅ Custom claims stored in Firestore
- ✅ Role-based access control (RBAC)
- ✅ Firestore Security Rules enforce permissions
- ✅ Storage Rules restrict file uploads/deletes
- ✅ No sensitive data in localStorage
- ✅ Auto-logout on auth state change

---

## 🎓 Learning Resources

This project demonstrates:
- **React Hooks** - useState, useEffect, custom hooks
- **Real-Time Databases** - Firestore listeners & multi-tab sync
- **Firebase Integration** - Auth, Firestore, Storage
- **TypeScript** - Type safety in React
- **RBAC Pattern** - Role-based access control
- **Responsive Design** - Mobile-first Tailwind CSS
- **Component Composition** - Reusable UI components

---

## 📝 Customization

### Add New Roles
1. Update `UserRole` type in `useAuth.ts`
2. Add RBAC checks in components
3. Update Firestore Security Rules

### Add New Stat
1. Edit `Dashboard.tsx` → stats array
2. Calculate from orders array
3. Add styling/colors

### Change Theme Colors
1. Edit `src/index.css` custom properties
2. Update Tailwind `tailwind.config.js`
3. Components auto-update via Tailwind classes

### Add New Order Status
1. Update `OrderStatus` type in `lib/types.ts`
2. Add color mapping in `OrdersTable.tsx`
3. Update status dropdown in `OrderDetailModal.tsx`

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Login fails | Auto-creates account. Use any email/password. |
| Real-time not syncing | Check Firestore rules allow read/write. Open console for errors. |
| File upload fails | Check Storage rules. Verify file size & type. |
| Orders not appearing | Verify `orders` collection exists. Check browser console. |

---

## 🚀 Future Enhancements

- [ ] CSV export
- [ ] Email notifications
- [ ] Advanced filtering & search
- [ ] Order history & audit log
- [ ] ShipHero API integration
- [ ] Customer portal
- [ ] Inventory management
- [ ] Mobile app version

---

## 📄 License

Open source project for learning & commercial use.

**MiniShip CMS v1.0.0** — Built with React + Firebase + shadcn/ui 🚀
