# AutoTrade AI - Autonomous Crypto Trading Dashboard

## Overview

AutoTrade AI is a fully autonomous AI-powered cryptocurrency futures trading platform that supports both Binance and Bybit exchanges. The application provides real-time trading simulation, momentum analysis, and a comprehensive dashboard for monitoring trading positions and performance metrics.

The system is built as a full-stack TypeScript application with a React frontend and Express backend, featuring real-time data updates, trading simulation capabilities, and exchange API integration support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React with TypeScript as the primary UI framework
- Vite for development server and build tooling with hot module replacement
- Wouter for client-side routing (lightweight React Router alternative)
- TailwindCSS for styling with custom design tokens
- Shadcn/ui component library (New York variant) for pre-built UI components

**State Management**
- TanStack Query (React Query) for server state management and data fetching
- Query client configured with infinite stale time and disabled automatic refetching
- Local component state for UI interactions

**Key Design Patterns**
- Component composition with shared UI primitives from Shadcn
- Real-time data polling at regular intervals (3-10 second intervals)
- Responsive layout with mobile-first approach
- Custom hooks for common functionality (mobile detection, toast notifications)

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for REST API
- HTTP server (not HTTPS in development)
- Custom middleware for JSON body parsing with raw body preservation
- Request logging middleware tracking duration and response codes

**API Design**
- RESTful endpoints organized by resource type (positions, logs, config)
- CRUD operations for trading positions
- Read-only endpoints for logs and statistics
- Configuration endpoints for exchange connections

**Trading Engine**
- Autonomous trading simulation system that generates trades at configurable intervals
- Momentum analysis engine evaluating price trends, volatility, and trading signals
- Support for two trading modes: HFT_SCALPER and TECHNICAL_SWING
- Price history tracking for technical analysis (50-point rolling window)
- Automatic position entry/exit based on momentum indicators

**Build System**
- ESBuild for server-side bundling with selective dependency bundling
- Vite for client-side bundling
- Separation of bundled vs external dependencies to optimize cold start times

### Data Storage

**Database**
- PostgreSQL via Supabase (managed serverless PostgreSQL)
- Drizzle ORM for type-safe database operations
- Schema-first approach with Drizzle-Zod integration for validation

**Database Schema**
- **Positions Table**: Stores all trading positions (open and closed) with entry/exit prices, PnL, leverage, stop-loss/take-profit levels
- **AI Logs Table**: Records all trading decisions, analysis events, and system activities
- **System Config Table**: Stores exchange API credentials and system settings

**Storage Layer**
- Repository pattern implementation (IStorage interface)
- Abstraction layer between database and business logic
- Support for CRUD operations on positions, logs, and configuration

### External Dependencies

**Trading Exchanges**
- Binance API integration (credentials stored in system config)
- Bybit API integration (credentials stored in system config)
- Currently simulation mode - exchange connections configurable via settings

**Database Provider**
- Supabase Managed PostgreSQL (connection via DATABASE_URL environment variable)
- Standard PostgreSQL connection with connection pooling for performance
- Deployed via Vercel with Supabase credentials in environment

**UI Component Libraries**
- Radix UI primitives for accessible, unstyled components
- Lucide React for icons
- Recharts for data visualization and trading charts
- Embla Carousel for UI carousels

**Development Tools**
- Replit-specific Vite plugins (cartographer, dev banner, runtime error overlay)
- Custom meta images plugin for OpenGraph image handling
- TypeScript for type safety across the stack

**Key Third-Party Services**
- No external authentication service (ready for implementation)
- No payment processing (ready for implementation)
- Database provisioned through Supabase

**Environment Configuration**
- DATABASE_URL (required) - PostgreSQL connection string
- NODE_ENV - development/production mode
- REPL_ID - Replit deployment identifier (optional)

## Deployment

### Vercel Deployment Setup

The project is configured for Vercel deployment with:
- `vercel.json` - Vercel configuration with build command and environment settings
- `.vercelignore` - Files excluded from Vercel builds
- Full-stack support: Node.js backend (Express) + React frontend (Vite)

**To deploy to Vercel:**
1. Push code to GitHub repository
2. Connect GitHub account to Vercel (https://vercel.com)
3. Import the repository - Vercel will automatically:
   - Run `npm run build` (builds both client and server)
   - Deploy the Express backend to Node.js runtime
   - Serve static React frontend from dist/public
   - Set environment variables (add DATABASE_URL in Vercel project settings)
4. The app runs as a single Node.js application serving both API and static files