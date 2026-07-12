# ECOMAX 360 — Sales ERP Dashboard (Frontend)

> **React 19** · **Vite** · **Tailwind CSS v4** · **Role-Based Access Control (RBAC)** · **Dark-Mode SaaS Aesthetics**

ECOMAX 360 is an enterprise-grade Sales ERP Dashboard frontend designed for ECOMAX/CALYONIX's internal business and sales operations. The system provides a highly polished, responsive, and role-restricted dashboard interface that handles the complete B2B sales lifecycle — from initial customer enquiries and lead qualification to quotations, purchase orders, proforma invoices, sales invoices, work orders, AMC management, and post-sales service ticketing.

---

## 🎯 End Goal & Project Vision

The primary objective of **ECOMAX 360** is to unify and automate the disparate workflows of the internal sales, service, and administrative teams:

- **Departmental Alignment**: Enable seamless handoffs between sales executives, service engineers, procurement leads, and directors.
- **Role-Based Workspaces**: Render custom interfaces, sidebar navigation, page views, and actions based on the logged-in user's role (`sales`, `service`, `admin`, `director`).
- **Document Integrity**: Track full compliance across commercial documents (e.g. converting a Pre-Sales lead to an Enquiry, referencing a Quotation for a Proforma Invoice, and generating a Purchase Order).
- **Director-Level Insight**: Provide real-time data visualizations of aggregate revenue pipelines, top-performing products, sales distribution, and active service pipelines.

---

## 💻 Tech Stack & Dependencies

The frontend application is constructed using a modern, lightweight, and blazing-fast client-side stack:

| Layer / Library    | Technology / Package                  | Purpose                                                                  |
| :----------------- | :------------------------------------ | :----------------------------------------------------------------------- |
| **Core Framework** | React 19 + Vite                       | Component architecture, HMR development, and bundle optimization.        |
| **Styling**        | Tailwind CSS v4 (`@tailwindcss/vite`) | Modern, compilation-free styling engine with CSS variables and themes.   |
| **Routing**        | React Router DOM v7                   | Nested route configurations, query parameters, and private route guards. |
| **API Client**     | Axios                                 | Configured with interceptors for automatic JWT bearer token attachments. |
| **Icons**          | Lucide React                          | Clean, scalable vector outline iconography.                              |
| **Charts**         | Recharts                              | Interactive SVG charting for analytics and KPI metrics.                  |
| **Notifications**  | React Hot Toast                       | Toast alert micro-interactions for backend events and updates.           |
| **Loading States** | React Loading Skeleton                | Smooth, animated skeleton components for pending API fetches.            |

---

## 🗂 Project Structure

```
ECOMAX_DASHBOARD_FRONTEND/
├── public/                      # Static assets (favicons, public images)
├── src/
│   ├── assets/                  # Local images and graphic assets
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx      # Navigation menu (collapsible, role-filtered badge counters)
│   │   │   └── TopNavbar.jsx    # User status bar, real-time date/clock, profile menu
│   │   └── ErrorBoundary.jsx    # React fallback UI wrapper to catch component failures
│   ├── context/
│   │   └── AuthContext.jsx      # Global state for credentials, login/logout, and RBAC roles
│   ├── pages/
│   │   ├── admin/
│   │   │   └── AdminPage.jsx    # User management CRUD (creation, editing, role mapping)
│   │   ├── analytics/
│   │   │   └── DirectorDashboard.jsx # Executive aggregated reports and interactive charts
│   │   ├── auth/
│   │   │   └── LoginPage.jsx    # Branded login panel with custom password visibility toggle
│   │   ├── sales/
│   │   │   ├── SalesPage.jsx            # Sales overview statistics and summaries
│   │   │   ├── EnquiriesPage.jsx        # Customer request tracking with stage categories
│   │   │   ├── QuotationsPage.jsx       # Custom line-item quoting with automatic tax calculations
│   │   │   ├── ProformaInvoicesPage.jsx # Reference-quoted proforma document creation
│   │   │   ├── SalesInvoicesPage.jsx    # Billing workflow and approval routing
│   │   │   ├── PurchaseOrdersPage.jsx   # Procurement, shipping addresses, and delivery dates
│   │   │   ├── WorkOrdersPage.jsx       # Order execution tracking
│   │   │   ├── PreSalesMasterPage.jsx   # Top-of-funnel lead pipeline management
│   │   │   ├── LeadManagementPage.jsx   # Mid-funnel customer interaction
│   │   │   ├── OpportunitiesPage.jsx    # Deal closure progression
│   │   │   ├── AMCClientsPage.jsx       # Annual Maintenance Contract agreements
│   │   │   ├── NonAMCPage.jsx           # On-demand maintenance tracking
│   │   │   └── VendorsPage.jsx          # Vendor master records
│   │   ├── service/
│   │   │   └── ServicePage.jsx          # Service request queues, priority states, and ticketing
│   │   ├── NotFound.jsx         # Custom 404 page
│   │   └── Unauthorized.jsx     # Custom 403 page
│   ├── utils/
│   │   └── axiosInstance.js     # Global Axios client with authorization interceptors
│   ├── App.css                  # Core application-level typography overrides
│   ├── App.jsx                  # React Router mapping, Private Route wraps, and entry structure
│   ├── index.css                # Tailwind imports, typography selections, and custom utility classes
│   └── main.jsx                 # Application bootstrapping and React context registration
├── eslint.config.js             # Formatter rules and syntax checking configurations
├── index.html                   # HTML page template
├── package.json                 # Project dependencies, devDependencies, and running scripts
├── vercel.json                  # Single-page-app routing overrides for Vercel deployment
└── vite.config.js               # Vite configurations with `@vitejs/plugin-react` and `@tailwindcss/vite`
```

---

## ⚙️ Project Running Modes

This frontend workspace is designed to operate in two distinct modes depending on your environment.

### 1. Mock / Serverless Mode (Default)

In this mode, the frontend is self-contained. It bypasses backend HTTP calls and utilizes a pre-configured mock session to allow review of UI/UX flows, layouts, and forms immediately without launching databases or server runtimes.

- **Auth State**: Handled in memory. Logging in with _any_ credentials will grant standard mock access.
- **API Requests**: Simulated locally; fail-safe fallbacks prevent the UI from throwing unhandled exceptions.

### 2. Connected Mode (Production / Full Integration)

In this mode, the frontend connects directly to a live MongoDB backend instance (e.g. port `5001`). To enable this:

1. **Restore Axios Base URL**: Open [axiosInstance.js](file:///Users/omkarmadkar07/Downloads/Internship%20Project/Internship%20Project/ECOMAX_DASHBOARD_FRONTEND/src/utils/axiosInstance.js) and uncomment the real `baseURL` configuration, commenting out the dummy placeholder URL.
2. **Restore Authentication**: Open [AuthContext.jsx](file:///Users/omkarmadkar07/Downloads/Internship%20Project/Internship%20Project/ECOMAX_DASHBOARD_FRONTEND/src/context/AuthContext.jsx) and uncomment the `axiosInstance` imports and real API checking blocks (`checkUser` and `login`), while commenting out the simulated block.
3. **Set Environment Variable**: Add a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5001
   ```

---

## 🚀 How to Run Locally

Follow these quick commands to spin up the local development server:

### Prerequisites

- **Node.js** v18 or above installed on your local computer.

### Installation & Run

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Start the Development Server**:

   ```bash
   npm run dev
   ```

   Once started, the development server will run at:
   👉 **`http://localhost:5173/`**

   Live Link:

   👉 **`https://ecomax-dashboard-frontend.vercel.app/dashboard`**

---

## 🔐 Credentials & Access Control

When fully integrated with the backend database, users are logged in under role permissions using the following credentials:

| Role Workspace  | Email Address         | Default Password | Primary Dashboard Permissions                                         |
| :-------------- | :-------------------- | :--------------- | :-------------------------------------------------------------------- |
| 🛡️ **Admin**    | `admin@ecomax.com`    | `admin123`       | Direct control of system-wide users and roles database CRUD.          |
| 📈 **Sales**    | `sales@ecomax.com`    | `sales123`       | CRUD for leads, enquiries, quotations, proformas, invoices, POs.      |
| 🛠️ **Service**  | `service@ecomax.com`  | `service123`     | View and edit maintenance schedules, service tickets, and AMC status. |
| 💼 **Director** | `director@ecomax.com` | `director123`    | Read-only analytics overview, charts, and revenue aggregation pages.  |

---

## 🎨 UI & UX Design Language

- **Theme**: Deep space slate backgrounds combined with sleek dark navy navigation headers (`#1a2a4a`) and crisp white dashboard content modules.
- **Component Outlines**: Smooth 20px rounded-edge cards (`rounded-[20px]`) featuring subtle shadows.
- **Micro-interactions**: Vibrant cyan color tones (`#00d0e6`) for CTA hover states, smooth transitions, and animated tab triggers.
- **Table Records**: Compact 13px line spacing with soft slate division borders and zebra table formatting on hover.
