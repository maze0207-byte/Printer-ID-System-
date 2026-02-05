# ID Forge - Saxony Egypt University (SEU) ID Card Management System

## Overview

ID Forge is a full-stack web application for creating, managing, and printing ID cards for Saxony Egypt University students and staff. The system supports single card creation with a live preview designer, batch import via CSV files, and a print station for generating physical ID cards with proper dimensions (85.6mm × 53.98mm CR80 standard).

Key features include:
- Student/staff information form with photo upload
- Real-time ID card preview with QR code generation
- Batch processing via CSV upload
- Print station with multi-card grid layout
- Dashboard with statistics and charts
- Dual-language support (English/Arabic)
- SEU brand-consistent design throughout

## SEU Brand Guidelines

### Brand Colors
- **Primary Red**: #b11b1d (HSL: 359 75% 40%) - Used for active states, primary buttons
- **Gold**: #ebc03f (HSL: 45 82% 58%) - Used for accents, staff badges
- **Dark Grey**: #39383e (HSL: 240 5% 23%) - Used for sidebar, text

### Contrast-Safe Text Colors
- Dark gold text (#3d3200 or #5a4a1a) for gold backgrounds
- White text for red/dark grey backgrounds

### Typography
- **Primary Font**: Montserrat (Brandon Grotesque equivalent)
- **Arabic Font**: Noto Sans Arabic
- Font family CSS variable: `--font-arabic` for Arabic text

### Dual-Language Support
Navigation items and page headers display both English and Arabic labels for accessibility

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state, React Hook Form for form state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Build Tool**: Vite with path aliases (@/, @shared/, @assets/)

The frontend follows a page-based structure with shared components:
- `/pages` - Route components:
  - Dashboard - Statistics and overview
  - StructureManager - University hierarchy (colleges, departments, programs)
  - PersonsManager - Student/staff/visitor CRUD with filtering
  - ManageCards - Card management
  - CardDesigner - ID card preview and design
  - BatchImport - CSV bulk import
  - PrintStation - Multi-card printing
- `/components` - Reusable components including the IDCard preview component
- `/components/ui` - shadcn/ui primitives
- `/hooks` - Custom hooks for data fetching (use-cards.ts) and utilities

### Backend Architecture
- **Framework**: Express.js 5 with TypeScript
- **API Pattern**: RESTful endpoints under `/api` prefix
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Validation**: Zod schemas shared between client and server

The backend uses a clean separation:
- `server/routes.ts` - API route handlers
- `server/storage.ts` - Database access layer (IStorage interface)
- `server/db.ts` - Database connection pool
- `shared/schema.ts` - Drizzle table definitions and Zod schemas
- `shared/routes.ts` - API contract definitions with Zod validation

### Data Flow
1. Client hooks (use-cards.ts) call API endpoints
2. Express routes validate input using shared Zod schemas
3. Storage layer executes Drizzle queries
4. Responses are validated and returned to client

### Key Design Decisions
- **Shared Types**: Schema and route definitions are in `/shared` directory, accessible to both client and server, ensuring type safety across the stack
- **API Contract**: Routes are defined declaratively in `shared/routes.ts` with method, path, input/output schemas
- **Print Optimization**: CSS @media print rules maintain exact CR80 card dimensions for physical printing
- **University ID Generation**: Auto-generates IDs with format PREFIX-YEAR-NNNNN (e.g., STU-2026-00001)

### Database Schema (Phase 1)
- **colleges**: University colleges with English/Arabic names and codes
- **departments**: Departments linked to colleges
- **programs**: Academic programs linked to departments
- **levels**: Academic levels (Freshman, Sophomore, etc.)
- **persons**: Students, staff, and visitors with full profile data
- **cards**: ID cards with status tracking and print history
- **id_sequences**: Auto-incrementing ID sequences per prefix/year

### Implementation Status
**Phase 1 (Complete)**:
- University organizational structure (colleges → departments → programs → levels)
- Persons management (students, staff, visitors) with CRUD operations
- University ID auto-generation with sequential numbering
- Dashboard statistics with real-time data
- Dual-language labels (English/Arabic)
- Custom card dimensions (CR80, CR79, CR100, Custom)
- Batch printing with progress bar

**Phase 2 (In Progress - Electron Desktop)**:
- Electron desktop app with SQLite local database
- User roles and permissions (admin, operator, viewer)
- Audit logging system
- Direct printing without browser dialog
- Backup and restore functionality

**Phase 3 (Planned)**:
- Template designer with drag-drop
- PDF export
- Webcam photo capture
- Card expiry notifications
- Excel/CSV import with field mapping

## Electron Desktop Application

### Overview
The Electron desktop version provides offline operation with local SQLite database, direct printing capabilities, and enhanced security features.

### Project Structure
```
electron-app/
├── src/
│   ├── main.ts          # Electron main process with SQLite
│   └── preload.ts       # IPC bridge to frontend
├── resources/           # App icons
├── package.json         # Electron build config
├── tsconfig.json        # TypeScript config
├── DATABASE_ERD.md      # Database diagram with Arabic labels
└── README.md            # Desktop app documentation
```

### Database (SQLite)
Location varies by OS:
- Windows: `%APPDATA%/id-forge-desktop/id-forge.db`
- Mac: `~/Library/Application Support/id-forge-desktop/id-forge.db`
- Linux: `~/.config/id-forge-desktop/id-forge.db`

### Card Sizes Supported
| Template | Width (mm) | Height (mm) |
|----------|-----------|-------------|
| CR80 Standard | 85.6 | 53.98 |
| CR79 | 83.9 | 51.0 |
| CR100 | 97.0 | 67.0 |
| Custom | User-defined | User-defined |

### User Roles
- **admin**: Full access to all features
- **operator**: Create, edit, print cards
- **viewer**: Read-only access

### Building Desktop App
```bash
cd electron-app
npm install
npm run package:win   # Windows
npm run package:mac   # macOS
npm run package:linux # Linux
```

## External Dependencies

### Database
- **PostgreSQL**: Primary data store via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe query builder with automatic migrations via `drizzle-kit push`
- **connect-pg-simple**: PostgreSQL session store (if sessions are needed)

### Frontend Libraries
- **qrcode.react**: QR code generation on ID cards
- **papaparse**: CSV parsing for batch import
- **recharts**: Dashboard charts and statistics
- **framer-motion**: Card animations and transitions
- **html2canvas / jspdf**: PDF export functionality (referenced in requirements)

### UI Framework
- **Radix UI**: Headless component primitives (dialog, dropdown, tabs, etc.)
- **shadcn/ui**: Pre-styled component library built on Radix
- **Tailwind CSS**: Utility-first styling with custom theme extensions
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Development server with HMR
- **esbuild**: Production bundling for server
- **TypeScript**: Full type coverage across client/server