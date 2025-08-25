# 🚀 Elite Barber - SaaS CRM & Scheduling System

A comprehensive barbershop SaaS platform with multitenancy, subscription management, and complete E2E testing.

## 🎯 Features Implemented

### ✅ Multi-Dashboard System
- **Admin Dashboard** - System-wide management for platform administrators
- **Barbershop Dashboard** - Individual barbershop management interface  
- **User Dashboard** - Client portal for appointment management

### ✅ SaaS Subscription System
- **Multiple Plans**: Basic (R$ 49,90), Premium (R$ 99,90), Enterprise (R$ 199,90)
- **Feature-based Limitations**: Barber limits, client limits, advanced features
- **Trial Period**: 7 days free trial for new signups
- **Subscription Management**: Plan upgrades, cancellation, billing

### ✅ Multitenancy Architecture
- **Isolated Data**: Each barbershop sees only their own data
- **Row-Level Security**: Database-level isolation using RLS policies
- **Barbershop-Scoped Resources**: Services, barbers, appointments, clients

### ✅ Complete Appointment System
- **Online Booking**: Customer-facing booking interface
- **Calendar Management**: Full calendar view with time slot management
- **Status Tracking**: Scheduled → Confirmed → Completed → Cancelled
- **Automated Notifications**: WhatsApp integration for confirmations

### ✅ Financial POS System
- **Payment Processing**: Single and mixed payment methods (PIX, Card, Cash)
- **Transaction Tracking**: Complete financial history and reporting
- **Revenue Analytics**: Monthly revenue, growth metrics, payment method breakdown
- **Export Capabilities**: Financial report exports

### ✅ Advanced Client Management
- **Customer Profiles**: Complete client history and preferences
- **Loyalty Tracking**: Visit frequency, total spent, cancellation rates
- **Communication Tools**: WhatsApp integration for client contact
- **Analytics**: Client segmentation, behavior analysis

## 🧪 Comprehensive E2E Testing

### Test Coverage
- ✅ **Admin Login & Dashboard** (admin-login.spec.ts)
- ✅ **Barbershop Authentication** (barbershop-auth.spec.ts)
- ✅ **Barbershop Dashboard** (barbershop-dashboard.spec.ts)
- ✅ **Appointment Booking** (appointment-booking.spec.ts)
- ✅ **Financial POS System** (financial-pos.spec.ts)
- ✅ **Client Management** (client-management.spec.ts)
- ✅ **SaaS Subscription Flow** (saas-subscription.spec.ts)

### Running Tests

```bash
# Install dependencies
npm install

# Run all E2E tests
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Run tests in headed mode (visible browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug
```

### Test Environment Setup

1. **Start the application**:
   ```bash
   npm run dev
   ```
   *Aplicação estará disponível em `http://localhost:8050`*

2. **Run tests in another terminal**:
   ```bash
   npm run test:e2e
   ```
   *Testes configurados para testar na porta 8050*

## 📊 Database Schema

### SaaS Tables
- `barbershops` - Individual barbershop instances
- `subscription_plans` - Available subscription plans
- `barbershop_users` - Links users to barbershops
- `payment_transactions` - Subscription billing history

### Core Tables (Multitenancy)
- `appointments` - Scoped by barbershop_id
- `barbers` - Scoped by barbershop_id
- `services` - Scoped by barbershop_id
- `clients` - Scoped by barbershop_id
- `financial_transactions` - Scoped by barbershop_id

## 🔐 Authentication & Authorization

### User Roles
- **admin** - Platform administrator access
- **barbershop** - Barbershop owner/manager access
- **user** - Regular client access

### Demo Credentials

#### Admin Dashboard
- Email: `admin@demo.com`
- Password: `admin123`

#### Barbershop Dashboard
- Email: `barbershop@demo.com`
- Password: `demo123`

## 🚦 Getting Started

### 1. Clone & Install
```bash
git clone <repository-url>
cd agendar-simples-barbearia
npm install
```

### 2. Environment Setup
```bash
# Copy environment variables
cp .env.example .env.local

# Configure Supabase credentials
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
```bash
# Run Supabase migrations
npx supabase db push
```

### 4. Start Development
```bash
# Start dev server
npm run dev

# Start E2E tests
npm run test:e2e
```

## 📝 Test Scenarios Covered

### 🔐 Authentication Tests
- Admin login with valid/invalid credentials
- Barbershop login/signup flow
- User registration and login
- Role-based access control

### 📅 Appointment Management Tests
- Online booking form validation
- Calendar date/time selection
- Service and barber selection
- Appointment status updates
- Customer confirmation flow

### 💰 Financial System Tests
- Payment processing (single/mixed methods)
- Transaction recording
- Revenue calculation and reporting
- Payment method analytics
- Export functionality

### 👥 Client Management Tests
- Client data aggregation
- Cancellation rate calculation
- Communication tools (WhatsApp)
- Client history tracking
- Analytics and reporting

### 🏢 SaaS Features Tests
- Subscription plan selection
- Multitenancy data isolation
- Plan limit enforcement
- Trial period handling
- Billing and payment processing

### 🎛️ Dashboard Tests
- Admin system management
- Barbershop operations management
- User appointment portal
- Navigation and UI interactions
- Data visualization and reports

## 🏗️ Architecture Highlights

### Frontend
- **React 18** with TypeScript
- **Vite** for development and building
- **Tailwind CSS** with custom styling
- **React Router** for navigation
- **React Query** for data management
- **Framer Motion** for animations

### Backend & Database
- **Supabase** for backend services
- **PostgreSQL** with Row-Level Security
- **Real-time subscriptions**
- **Authentication & authorization**
- **File storage** for uploads

### Testing
- **Playwright** for E2E testing
- **Cross-browser testing** (Chrome, Firefox, Safari)
- **Mobile responsiveness testing**
- **Comprehensive test coverage**

## 📈 Performance & Scalability

- **Optimized builds** with code splitting
- **Database indexing** for query performance
- **Row-Level Security** for data isolation
- **Caching strategies** with React Query
- **Responsive design** for all devices

## 🔧 Development Tools

- **ESLint** for code quality
- **TypeScript** for type safety
- **Prettier** for code formatting
- **Git hooks** for pre-commit checks
- **Playwright** for E2E testing

## 📦 Deployment

The application is configured for deployment on Vercel with:
- Automatic builds on git push
- Environment variable management
- Optimized production builds
- CDN distribution

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Run the full test suite
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Elite Barber SaaS** - Transforming barbershop management with modern technology! 💈✨