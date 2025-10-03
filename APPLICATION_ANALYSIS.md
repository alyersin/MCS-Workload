# MCS WORKLOAD PORTAL - APPLICATION ANALYSIS

## 📋 EXECUTIVE SUMMARY

**MCS Workload Portal** is a Next.js 15-based web application for creating, submitting, and managing operational survey reports. It features Firebase authentication, PostgreSQL database backend, file upload capabilities, PDF generation, and a comprehensive order tracking system.

---

## 🏗️ ARCHITECTURE OVERVIEW

### **Technology Stack**

#### **Frontend**

- **Framework**: Next.js 15.3.4 (App Router)
- **UI Library**: Chakra UI 2.7.2 with custom theme
- **Styling**: Emotion + Styled Components
- **State Management**: React Hooks + Context API
- **Authentication**: NextAuth.js 4.24.11 + Firebase Auth

#### **Backend Services**

- **API Routes**: Next.js API routes (`/api/*`)
- **External Server**: Express.js server (`server.js`) running on port 5000
- **Database**: PostgreSQL (via `pg` library)
- **File Storage**: Local filesystem with organized structure
- **Process Manager**: PM2 (as per user preference)
- **Reverse Proxy**: Nginx

#### **Key Dependencies**

- **PDF Generation**: jsPDF 3.0.1
- **Email**: Nodemailer 6.10.1
- **File Upload**: Multer 2.0.2
- **File Compression**: Archiver 7.0.1
- **Firebase**: firebase 11.3.1 + firebase-admin 13.2.0

---

## 📁 PROJECT STRUCTURE

```
mcs-workload/
├── src/
│   ├── app/                          # NEXT.JS APP ROUTER
│   │   ├── api/                      # API ROUTES
│   │   │   ├── auth/[...nextauth]/   # NEXTAUTH AUTHENTICATION
│   │   │   ├── firebase-custom-token/ # FIREBASE TOKEN GENERATION
│   │   │   ├── send-pdf/             # PDF GENERATION & EMAIL
│   │   │   └── validate-secret/      # SECRET KEY VALIDATION
│   │   ├── services/                 # SERVICE FORM PAGES
│   │   │   ├── lashing/
│   │   │   ├── stripping/
│   │   │   ├── stuffing/
│   │   │   ├── stripping-restuffing/
│   │   │   ├── transloading/
│   │   │   │   ├── container-truck/
│   │   │   │   └── truck-container/
│   │   │   ├── transshipment-C2C/
│   │   │   └── vessel-barge/
│   │   ├── login/                    # LOGIN PAGE
│   │   ├── register/                 # REGISTRATION PAGE
│   │   ├── reset-password/           # PASSWORD RESET
│   │   ├── profile/                  # USER DASHBOARD
│   │   ├── layout.js                 # ROOT LAYOUT
│   │   ├── page.js                   # HOMEPAGE
│   │   └── globals.css               # GLOBAL STYLES
│   ├── components/
│   │   ├── Auth/                     # AUTHENTICATION COMPONENTS
│   │   │   ├── LoginModal.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── Layout/                   # LAYOUT COMPONENTS
│   │   │   ├── Header.jsx
│   │   │   └── Footer.jsx
│   │   ├── Modals/                   # MODAL COMPONENTS
│   │   │   ├── CompleteOrderModal.jsx
│   │   │   ├── CompletedOrderDetailsModal.jsx
│   │   │   ├── GDPRModal.jsx
│   │   │   ├── NoticeModal.jsx
│   │   │   ├── SecretKeyModal.jsx
│   │   │   ├── TestAuthModal.jsx
│   │   │   └── UploadProgressModal.jsx
│   │   ├── Providers/                # CONTEXT PROVIDERS
│   │   │   └── SessionProvider.jsx
│   │   ├── UI/                       # UI COMPONENTS
│   │   │   ├── ColorModeSwitch.jsx
│   │   │   └── StyledHamburger.jsx
│   │   └── SurveyForm.jsx            # MAIN FORM COMPONENT
│   ├── hooks/                        # CUSTOM HOOKS
│   │   ├── useAuth.js
│   │   └── useSecretAccess.js
│   ├── utils/                        # UTILITY FUNCTIONS
│   │   ├── ensureFirebaseAuth.js
│   │   ├── firebaseAdmin.js
│   │   ├── firebaseClient.js
│   │   └── uploadFile.js
│   ├── lib/
│   │   └── registry.js               # STYLED COMPONENTS REGISTRY
│   └── theme.js                      # CHAKRA UI THEME
├── server.js                         # EXPRESS BACKEND SERVER
├── public/                           # STATIC ASSETS
├── package.json
├── next.config.mjs
├── .npmrc                           # NPM CONFIGURATION
└── vercel.json                      # VERCEL DEPLOYMENT CONFIG
```

---

## 🔐 AUTHENTICATION FLOW

### **Multi-Layer Authentication System**

1. **NextAuth.js** - Session management with JWT strategy
2. **Firebase Authentication** - User identity and credentials
3. **Secret Key Access** - Additional layer for service forms

### **Authentication Process**

```
User Login → Firebase Auth → NextAuth JWT → Session Creation
                ↓
        Firebase Custom Token → Client-side Firebase Auth
                ↓
        Form Access → Secret Key Validation → Service Submission
```

### **Key Files**

- `src/app/api/auth/[...nextauth]/route.js` - NextAuth configuration
- `src/utils/firebaseClient.js` - Client-side Firebase
- `src/utils/firebaseAdmin.js` - Server-side Firebase Admin
- `src/hooks/useAuth.js` - Authentication hook
- `src/hooks/useSecretAccess.js` - Secret key validation hook

---

## 📝 FORM SUBMISSION WORKFLOW

### **Complete Form Submission Flow**

```
1. USER FILLS FORM
   ↓
2. SECRET KEY VALIDATION
   ↓
3. FILE UPLOAD (if any)
   - Upload to server.js via /upload endpoint
   - Files organized: uploads/{userId}/{formType}/{date}/{submissionFolder}/
   ↓
4. PDF GENERATION
   - POST to /api/send-pdf
   - Generate PDF with form data
   - Send email via nodemailer
   ↓
5. ORDER CREATION
   - POST to server.js /api/orders
   - Create order in PostgreSQL
   - Generate unique order ID
   ↓
6. SUCCESS NOTIFICATION
   - Toast notifications
   - Form reset
```

### **Form Types (Services)**

1. **Transloading**

   - Container → Truck
   - Truck → Container

2. **Stripping**

   - Container → Storage

3. **Stuffing**

   - Storage → Container

4. **Transfers**

   - Stripping & Restuffing
   - C2C Transfer (Container-to-Container)

5. **Vessel/Barge Survey**

6. **Lashing Report**

### **Form Field Categories**

- **General Information**: Report number, date
- **Port & Operator**: Location, operator, custom options
- **Principal**: Principal name, custom input
- **Cargo Details**: Description, weight, shipper, consignee
- **Survey Findings**: Textarea for findings
- **Other Details**: Additional notes (NOW INCLUDED IN PDF ✅)
- **File Attachments**: Images, PDFs, ZIP files

---

## 🗄️ DATABASE STRUCTURE

### **PostgreSQL Tables**

#### **`orders` Table**

```sql
- id (SERIAL PRIMARY KEY)
- order_id (VARCHAR UNIQUE) - Generated: TYPE-YYYYMMDD-RANDOM
- user_id (VARCHAR) - Firebase UID
- order_type (VARCHAR) - Service type
- status (VARCHAR) - "In Progress" or "Completed"
- details (JSONB) - Complete form data
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### **`completed_orders` Table**

```sql
- id (SERIAL PRIMARY KEY)
- order_id (VARCHAR UNIQUE)
- user_id (VARCHAR) - Original creator's Firebase UID
- order_type (VARCHAR)
- completion_date (TIMESTAMP)
- original_order_data (JSONB) - Snapshot of original order
- created_by (VARCHAR) - Original creator UID
- completed_by (VARCHAR) - Master account UID who completed it
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### **Database Connection**

- **Host**: localhost
- **Port**: 5432
- **Database**: mcs_orders
- **User**: alyersin
- **Password**: 8642317! (⚠️ HARDCODED - SHOULD USE ENV VARS)

---

## 🚀 ORDER TRACKING SYSTEM

### **Order Lifecycle**

```
FORM SUBMISSION
    ↓
ORDER CREATED ("In Progress")
    ↓
USER DASHBOARD (View orders)
    ↓
MASTER ACCOUNT (View all orders)
    ↓
ORDER COMPLETION (Upload report files)
    ↓
ORDER STATUS → "Completed"
    ↓
MOVED TO COMPLETED_ORDERS TABLE
    ↓
FILES STORED IN: uploads/COMPLETED ORDERS/{orderId}/
```

### **User Roles**

1. **Regular Users**

   - Create orders
   - View own orders
   - View own completed orders
   - Download completed order files

2. **Master Account** (UID: `quoewgWQEOYmsYbv7JNsNPhR1rh1`)
   - View ALL orders
   - Complete orders
   - Upload completion files
   - View all completed orders

### **API Endpoints**

#### **Order Management**

- `POST /api/orders` - Create new order
- `GET /api/orders/:userId` - Get user's in-progress orders
- `GET /api/orders` - Get all in-progress orders (Master only)
- `GET /api/all-orders/:userId` - Get all user orders (including completed)
- `GET /api/all-orders` - Get all orders (Master only)

#### **Order Completion**

- `POST /api/orders/complete-order` - Complete an order
- `GET /api/completed-orders/:userId` - Get user's completed orders
- `GET /api/completed-orders` - Get all completed orders (Master only)
- `GET /api/completed-order-files/:orderId` - List files for completed order
- `GET /api/download-completed-file/:orderId/:fileName` - Download single file
- `GET /api/download-all-completed-files/:orderId` - Download all files as ZIP

#### **File Upload**

- `POST /upload` - Upload files during form submission

#### **Debug Endpoints**

- `GET /api/debug/completed-orders` - Check all completed orders
- `GET /api/debug/completed-orders/:userId` - Check user's completed orders
- `GET /api/debug/order/:orderId` - Check specific order status

---

## 📧 EMAIL & PDF SYSTEM

### **PDF Generation**

- **Route**: `/api/send-pdf`
- **Library**: jsPDF
- **Format**: Professional layout with sections
- **Sections**:
  1. General Information
  2. Port & Operator
  3. Principal
  4. Cargo Details
  5. Survey Findings
  6. Other Details ✅ (Recently added)
  7. Uploaded Files (metadata)

### **Email Configuration**

- **Service**: Gmail (via nodemailer)
- **Environment Variables**:
  - `EMAIL_USER` - Sender email
  - `EMAIL_PASS` - App password
  - `PDF_EMAIL_RECIPIENTS` - Recipient emails

---

## 🎨 UI/UX FEATURES

### **Design System**

- **Framework**: Chakra UI
- **Theme**: Custom teal-based theme
- **Color Mode**: Light/Dark mode support (system preference)
- **Responsive**: Mobile-first design with breakpoints

### **Key UI Components**

1. **Header**

   - Logo
   - Navigation menu
   - Service dropdown
   - User avatar/login button
   - Color mode toggle

2. **Forms (SurveyForm.jsx)**

   - Dynamic field generation
   - Dynamic lists (add/remove items)
   - Dynamic cargo groups
   - Custom conditional fields
   - File upload with progress
   - Form validation

3. **Profile/Dashboard**

   - Tabs: Dashboard, Profile, Settings
   - Order statistics
   - Order management
   - Completed orders view
   - File download capabilities

4. **Modals**
   - Login modal
   - Secret key modal
   - Upload progress modal
   - Complete order modal
   - Completed order details modal
   - GDPR banner

---

## 🔧 CONFIGURATION & ENVIRONMENT

### **Required Environment Variables**

```env
# FIREBASE
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# NEXTAUTH
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# EMAIL
EMAIL_USER=
EMAIL_PASS=
PDF_EMAIL_RECIPIENTS=

# ORDER API
NEXT_PUBLIC_ORDER_API_URL=http://localhost:5000/api/orders
# OR for production:
# NEXT_PUBLIC_ORDER_API_URL=https://mcs-workload.duckdns.org/api/orders
```

### **Server Configuration**

- **Frontend**: Vercel (Next.js deployment)
- **Backend**: Self-hosted Express server
  - Domain: `mcs-workload.duckdns.org`
  - Port: 5000
  - Process Manager: PM2
  - Web Server: Nginx (reverse proxy)

### **CORS Configuration**

Allowed origins:

- `http://localhost:3000`
- `https://mcs-workload.vercel.app`
- `https://mcs-workload.duckdns.org`

---

## 📦 FILE UPLOAD SYSTEM

### **Upload Structure**

```
uploads/
├── temp/                                    # TEMPORARY UPLOADS
├── {userId}/                                # USER-SPECIFIC FOLDERS
│   ├── {formType}/                         # SERVICE TYPE
│   │   └── {MM.DD.YYYY}/                   # DATE
│   │       └── {submissionFolder}/         # UNIQUE SUBMISSION
│   │           └── files...
└── COMPLETED ORDERS/                        # COMPLETED ORDER FILES
    └── {orderId}/
        └── report files...
```

### **File Upload Flow**

1. **Frontend** - User selects files
2. **Upload** - POST to `server.js:5000/upload`
3. **Organization** - Files moved to structured folder
4. **Metadata** - File info sent with PDF email
5. **Completion** - Master uploads completion files to COMPLETED ORDERS

---

## 🔒 SECURITY FEATURES

### **Authentication Layers**

1. NextAuth session management
2. Firebase authentication
3. Secret key validation for forms
4. Protected routes with `ProtectedRoute.jsx`

### **Data Security**

- JWT tokens for sessions
- Firebase Admin SDK for server-side auth
- CORS restrictions
- Input validation
- SQL parameterized queries (prevents SQL injection)

### **⚠️ Security Concerns**

- **HARDCODED CREDENTIALS** in `server.js` (database password)
- Should use environment variables instead
- Secret keys should be encrypted

---

## 🐛 KNOWN ISSUES & RECENT FIXES

### **Fixed Issues** ✅

1. **"Other Details" field not appearing in PDF** - FIXED

   - Added `otherDetails` to PDF sections
   - Added multiline support for long text

2. **Build errors on Vercel**
   - Added `.npmrc` for npm configuration
   - Added `vercel.json` for build commands

### **Potential Issues** ⚠️

1. **Hardcoded Database Credentials**

   - Location: `server.js` lines 124-130
   - Risk: Security vulnerability
   - Solution: Use environment variables

2. **No .env File in Repository**

   - Need to document required environment variables
   - Users need to create their own `.env` file

3. **File Storage on Local Filesystem**

   - Not scalable for multiple server instances
   - Consider cloud storage (AWS S3, Firebase Storage)

4. **No Database Migrations**
   - Tables created manually in code
   - Consider using migration tools (e.g., Prisma, Knex)

---

## 🚀 DEPLOYMENT

### **Frontend (Vercel)**

```bash
# AUTOMATIC DEPLOYMENT
git push origin main

# VERCEL CONFIGURATION
- Build Command: npm run build
- Output Directory: .next
- Install Command: npm install
- Framework: Next.js
```

### **Backend (Self-Hosted)**

```bash
# START SERVER WITH PM2
pm2 start server.js --name mcs-backend

# NGINX CONFIGURATION
# Proxy requests to localhost:5000
location /api {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

---

## 📊 ANALYTICS

- **Google Analytics**: Integrated (ID: G-QBBPBNN7H5)
- **Tracking**: Page views, user interactions

---

## 🔄 FUTURE IMPROVEMENTS

### **Recommended Enhancements**

1. **Security**

   - Move database credentials to environment variables
   - Implement rate limiting
   - Add CSRF protection
   - Encrypt secret keys

2. **Scalability**

   - Move file storage to cloud (S3, Firebase Storage)
   - Implement database connection pooling
   - Add Redis for caching
   - Consider database migrations tool

3. **Features**

   - Real-time order status updates (WebSockets)
   - Email notifications for order status changes
   - Advanced search and filtering
   - Export order history as CSV/Excel
   - Mobile app (React Native)

4. **Code Quality**

   - Add TypeScript
   - Implement comprehensive testing (Jest, Cypress)
   - Add error boundaries
   - Implement logging system (Winston, Pino)
   - Add API documentation (Swagger)

5. **Performance**

   - Implement lazy loading for components
   - Add image optimization
   - Implement service workers for offline support
   - Add server-side caching

6. **User Experience**
   - Add form autosave
   - Implement drag-and-drop file upload
   - Add preview before PDF generation
   - Implement undo/redo for forms
   - Add keyboard shortcuts

---

## 📝 DEVELOPMENT WORKFLOW

### **Local Development**

```bash
# INSTALL DEPENDENCIES
npm install

# RUN FRONTEND (PORT 3000)
npm run dev

# RUN BACKEND (PORT 5000)
node server.js
# OR WITH PM2
pm2 start server.js --name mcs-backend --watch

# BUILD FOR PRODUCTION
npm run build

# START PRODUCTION SERVER
npm start
```

### **Code Style**

- **Comments**: UPPERCASE, concise, on-point (per user preference)
- **Environment Variables**: Stored in `.env` file (per user preference)
- **Process Management**: PM2 (per user preference)

---

## 🎯 KEY TAKEAWAYS

1. **Well-Structured Application** - Clear separation of concerns
2. **Comprehensive Features** - Full lifecycle management from form to completion
3. **User-Centric Design** - Role-based access with master account
4. **Production-Ready** - Deployed on Vercel + self-hosted backend
5. **Extensible Architecture** - Easy to add new service types
6. **Security Conscious** - Multiple authentication layers

---

## 📞 TECHNICAL SUPPORT

For updates and improvements, refer to this analysis document and the codebase structure above.

**Last Updated**: October 2, 2025
**Version**: 0.1.0
**Status**: Production
