# Shanghai Namutong International Trade Co. Ltd
### Wholesale & Import BD E-Commerce Platform

A production-ready full-stack wholesale and direct-import e-commerce platform for Bangladesh. Features bilingual support (Bangla & English), catalog browsing, product search & category filters, direct ordering workflow with stock validation, PDF/print invoice generation, WhatsApp/Phone contact integration, and a protected Admin Dashboard for managing products, categories, orders, and store settings.

---

## 🚀 Quick Start Guide

Follow these steps to run the complete project locally on your machine:

### 1. Extract ZIP
Extract the downloaded ZIP archive into any folder on your computer.

### 2. Open Terminal
Open your terminal (macOS/Linux) or Command Prompt / PowerShell (Windows) and navigate into the extracted project folder:
```bash
cd /path/to/extracted-folder
```

### 3. Install Dependencies
Install all required Node.js packages using npm:
```bash
npm install
```
*(You can also use `pnpm install` or `bun install` if preferred).*

### 4. Configure Environment Variables (`.env`)
Copy the sample environment file to create your own `.env` file:

**macOS / Linux:**
```bash
cp .env.example .env
```

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**Windows (CMD):**
```cmd
copy .env.example .env
```

Open `.env` in any text editor and adjust values if needed:
```env
# Optional Gemini AI API Key (if using AI features)
GEMINI_API_KEY=""

# Local/Hosting URL
APP_URL="http://localhost:3000"

# Admin Dashboard Credentials
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
```

---

## 💻 Running the Application

### 5. Start Development Server
Run the development server with live reload and integrated full-stack API server:
```bash
npm run dev
```

The application will start on:
👉 **http://localhost:3000** (or your specified port)

Open your web browser and navigate to `http://localhost:3000`. You will see the complete, fully functional store with all products, categories, bilingual toggle, and checkout.

---

### 6. Build and Run in Production

To build the optimized client bundle and compile the standalone production server:
```bash
npm run build
```

Then start the production server:
```bash
npm start
```
The compiled application is served from `dist/` with high-performance production asset handling.

---

## 🔐 Admin Authentication Setup

The Admin Dashboard provides full management of products, categories, orders, and store settings.

- **Default Admin Login URL**: Click **"অ্যাডমিন লগইন (Admin)"** in the top navigation bar or website footer, or navigate directly to the Admin section.
- **Default Credentials**:
  - **Username / Email**: `admin` *(or `admin@shanghainamutong.com`)*
  - **Password**: `admin123`
- **Customizing Credentials**:
  Update `ADMIN_USERNAME` and `ADMIN_PASSWORD` in your `.env` file. The server automatically uses constant-time token verification for secure administration.

---

## 🗄️ Database & Storage Architecture

This project includes a built-in persistent JSON database located at:
```
data/store_db.json
```

- **Zero-Setup Database**: No external database service installation (like PostgreSQL, MySQL, or MongoDB) is required to run the project.
- **Automatic Initialization**: On server startup, `server/db.ts` verifies the existence of `data/store_db.json`. If it does not exist, it automatically initializes it with full seed data for categories, products, and default store configurations.
- **Real-Time Data Persistence**:
  - New orders submitted through the checkout flow are saved immediately into the database.
  - Product additions, price updates, stock adjustments, and category changes from the Admin Panel are persisted directly.
  - Stock is protected and deducted only after order payment confirmation, avoiding inventory discrepancies.
- **Client Fallback**: A local-storage sync layer is also built into the client, ensuring the application remains functional even in strictly static environments.

---

## 📂 Project Structure

```
├── .env.example          # Environment variables template
├── package.json          # Node dependencies & project scripts
├── package-lock.json     # Locked dependency tree for deterministic npm install
├── index.html            # Main HTML entry with SEO & meta tags
├── vite.config.ts        # Vite configuration with embedded backend API middleware
├── tsconfig.json         # TypeScript configuration
├── server.ts             # Full-stack server entry point (Express + Vite)
├── server/
│   ├── apiRouter.ts      # REST API route handlers (/api/products, /api/orders, etc.)
│   ├── auth.ts           # Admin authentication & session security
│   └── db.ts             # Persistent JSON database engine & seed catalog
├── public/
│   ├── shanghai_namutong_logo.svg     # Brand logo
│   └── shanghai_namutong_symbol.svg   # Brand icon / favicon
├── src/
│   ├── App.tsx           # Primary application component & routing
│   ├── main.tsx          # React DOM entry point
│   ├── index.css         # Global styles with Tailwind CSS
│   ├── types.ts          # Global TypeScript interfaces & types
│   ├── context/
│   │   └── LanguageContext.tsx  # Bilingual state (Bangla & English)
│   ├── data/
│   │   └── products.ts   # Default fallback catalog
│   ├── components/       # Storefront & Admin modular components
│   │   ├── Header.tsx                 # Navigation, search, category pills & language toggle
│   │   ├── Banner.tsx                 # Promotion & highlights banner
│   │   ├── ProductCard.tsx            # Wholesale product display card
│   │   ├── ProductPage.tsx            # Single product detail view
│   │   ├── CheckoutPage.tsx           # Checkout form & shipping calculation
│   │   ├── OrderConfirmationPage.tsx  # Order placed confirmation screen
│   │   ├── OrderInvoicePrint.tsx      # Printable & downloadable PDF invoice
│   │   ├── QuickContactButtons.tsx    # Live WhatsApp/Phone/Facebook chat widget
│   │   ├── Footer.tsx                 # Footer links, contact info & credentials
│   │   ├── AdminLayout.tsx            # Protected admin layout & navigation
│   │   ├── AdminDashboard.tsx         # Sales metrics & business overview
│   │   ├── AdminProductManager.tsx    # Add, edit, delete, stock & image management
│   │   ├── AdminCategoriesManager.tsx # Category CRUD manager
│   │   ├── AdminOrdersManager.tsx     # Order status & payment verification
│   │   ├── AdminSettingsManager.tsx   # Store settings, phone, email & address
│   │   └── AdminLoginPage.tsx         # Admin authentication form
│   └── utils/
│       ├── apiClient.ts               # Client API communicator
│       ├── adminAuth.ts               # Client-side session validator
│       ├── generateOrderPdf.ts        # PDF receipt & invoice generator
│       ├── imageCompressor.ts         # Image optimizer for uploads
│       └── productUtils.ts            # Formatting & currency utilities
└── data/
    └── store_db.json     # Persistent database file
```

---

## 🛠️ Available NPM Scripts

- `npm run dev`: Starts the development server with live reload on port 3000.
- `npm run build`: Builds the production client bundle and standalone backend server (`dist/server.cjs`).
- `npm start`: Starts the built production server using Node.js.
- `npm run lint`: Runs TypeScript type checking (`tsc --noEmit`).
- `npm run preview`: Previews the production build locally.
- `npm run clean`: Cleans the `dist` directory.

---

## 🌐 Bilingual Support

The store features a one-click language toggle in the header:
- **বাংলা (Bangla)**: Full native localization tailored for wholesale buyers in Bangladesh.
- **English**: International interface for overseas trade and English-speaking buyers.
