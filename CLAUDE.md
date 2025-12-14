# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **AI-generated experimental Warenwirtschaftssystem (ERP/inventory management system)** built with Nuxt 3. The system manages products, prices, inventory locations, customers, invoices, and includes specialized modules for wholesale and restaurant operations. This is a proof-of-concept demonstrating AI-assisted code generation capabilities, not intended for production use.

## Build and Development Commands

```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview

# Seed database with test data
yarn seed

# Run tests
yarn test              # Run tests in watch mode
yarn test:run          # Run tests once
yarn test:ui           # Run tests with UI interface
yarn test:coverage     # Run tests with coverage report
```

## Database Management

**Database**: MySQL with Prisma ORM

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name <migration_name>

# Reset database (warning: deletes all data)
npx prisma migrate reset

# Open Prisma Studio to view/edit data
npx prisma studio

# Apply migrations in production
npx prisma migrate deploy
```

**Environment**: Configure `DATABASE_URL` in `.env` file:
```
DATABASE_URL="mysql://user:password@localhost:3306/database_name"
```

## Architecture Overview

### Tech Stack
- **Framework**: Nuxt 3 (Vue.js)
- **Database**: MySQL via Prisma ORM
- **Styling**: UnoCSS with Wind preset and Icons
- **Auth**: nuxt-auth-utils
- **i18n**: @nuxtjs/i18n (German/English)
- **Package Manager**: Yarn 1.22.22

### Directory Structure

**`/pages`**: File-based routing with nested routes
- Main modules: `produkte/`, `kunden/`, `lieferanten/`, `rechnungen/`, `standorte/`, `restaurant/`, `kassen/`
- Pattern: `index.vue` (list), `create.vue` (create), `edit/[id].vue` (edit), `details/[id].vue` (detail view)

**`/server/api`**: API endpoints following Nuxt server conventions
- Naming pattern: `{resource}.{method}.ts` (e.g., `produkte.get.ts`, `kunden.post.ts`)
- Subdirectories for complex endpoints (e.g., `/berichte`, `/audience-templates`)
- All endpoints use Prisma client from `/lib/prisma.ts`

**`/components`**: Vue components (reusable UI elements)
- Form components: `ProduktForm.vue`, `RechnungForm.vue`
- Modal components: `SupplierModal.vue`, `PriceModal.vue`, `ConfirmModal.vue`, `ConflictDiffModal.vue`
- Data display: `InvoiceDetails.vue`, `ProductPrices.vue`, `ProductImages.vue`

**`/lib`**: Shared utilities
- `prisma.ts`: Singleton Prisma client instance

**`/composables`**: Vue composables for shared state
- `useActiveProject.ts`: Manages active project selection and dynamic menu building
- `useToast.ts`: Toast notification system

**`/layouts`**: Page layouts
- `default.vue`: Main application layout with sidebar navigation
- `pos.vue`: Point-of-sale focused layout
- `login.vue`: Authentication page layout

**`/i18n/locales`**: Internationalization files
- `de.json`, `en.json`: Translation files

**`/prisma`**: Database schema and migrations
- `schema.prisma`: Complete database schema
- `/migrations`: Database migration history

### Database Schema Architecture

The database has a **modular architecture** with core and extension modules:

**Core Modules:**
- **Products**: `Produkte`, `Produktkategorien`, `ProduktBilder`, `KategorieBilder`, `Einheiten`, `ProduktLieferanten`
- **Pricing**: `Preise`, `Umsatzsteuersaetze`, `Rabatte`, `Rabattstaffeln`
- **Inventory**: `Bestand`, `Lagerbewegungen`, `Standorte`
- **Customers**: `Kunden`, `Kundengruppen`, `Kundenkarten`, `KundenRabattAnwendung`
- **Orders & Invoices**: `Bestellungen`, `Bestellpositionen`, `Rechnungen`, `Rechnungspositionen`, `RechnungsRabatte`
- **Returns**: `Retouren`, `Retourenpositionen`, `Gutschriften`
- **Suppliers**: `Lieferanten`, `ProduktLieferanten`
- **Users**: `Benutzer`
- **Payments**: `Zahlungen`

**Restaurant Module** (`RestaurantBestellungen`, `RestaurantTische`, `Tischbereiche`, `Reservierungen`):
- Table management with areas and visual positioning
- Restaurant-specific orders separate from regular orders
- Reservations with customer linking
- Kitchen workflow statuses

**Wholesale Module Extensions:**
- **Price Contracts**: `Preisvertraege`, `Vertragspositionen` - Customer-specific contract pricing
- **Sales Representatives**: `Vertreter`, `KundenVertreter`, `Provisionen` - Commission tracking
- **Credit Management**: `Kreditlimits`, `Mahnungen` - Credit limits and dunning
- **Logistics**: `Lieferungen`, `Touren`, `Liefernachweise` - Delivery tours and proof of delivery
- **Quotes**: `Angebote`, `Angebotspositionen` - Quote/proposal system

**Cash Register Module** (`Kassen`, `Kassenbuchungen`):
- Multiple cash registers per location
- Cash transactions with invoice linking
- POS interface for retail operations

**Hotel Module** (`Zimmer`, `Zimmerkategorien`, `HotelBuchungen`, `HotelGaeste`, `HotelZusatzleistungen`):
- Room management with categories
- Guest bookings and check-in/check-out
- Additional services tracking

**Shop Module** (`ShopProdukte`, `ShopKategorien`, `ShopBestellungen`, `ShopWarenkorb`, `ShopBewertungen`):
- E-commerce product catalog
- Shopping cart and order management
- Customer reviews

**Module System** (`Projekt`, `AudienceTemplate`, `ModuleDefinition`, `ModuleKonfiguration`, `ProjektModule`):
- Dynamic module activation per project
- Audience templates define default module sets for different business types

### Key Architectural Patterns

**Conflict Resolution**: The system includes a conflict management mechanism (see `ConflictDiffModal.vue`) to handle concurrent data modifications using optimistic locking via `LetzteAenderung` timestamp fields.

**Soft Deletes**: Models use status fields (e.g., `IstAktiv`, `Kundenstatus`) rather than hard deletes.

**Multi-currency Support**: Most financial entities include `Waehrung` field (default: "EUR").

**Audit Trail**: Standard fields on most tables:
- `Erstelldatum`: Creation timestamp
- `LetzteAenderung`: Last modification timestamp
- `ErstelltVonBenutzerID`/`BenutzerID`: User tracking

**Image Uploads**: Product and category images stored in `/public/uploads/{produkte|kategorien}/`

## i18n Configuration

**Default locale**: German (`de`)
**Available locales**: `de`, `en`
**Strategy**: `no_prefix` (no locale prefix in URLs)

Translation keys are referenced in components using `$t('key.path')`. When adding new features, update both `i18n/locales/de.json` and `i18n/locales/en.json`.

## Authentication

Uses `nuxt-auth-utils` for authentication. User model is `Benutzer` with role-based access (`Rolle` field).

## Styling with UnoCSS

The project uses UnoCSS with Wind preset (Tailwind-compatible). Utility classes are available throughout components.

**Icons**: Use Iconify icons via UnoCSS preset-icons, e.g., `<div class="i-mdi-account" />`

**Pre-defined Shortcuts** (from `nuxt.config.ts`):
- Buttons: `btn-primary`, `btn-secondary`, `btn-success`, `btn-danger`, `btn-warning`, `btn-ghost`
- Sizes: `btn-xs`, `btn-sm`, `btn-md`, `btn-lg`, `btn-xl`
- Cards: `card`, `card-header`, `card-body`, `card-footer`
- Form: `input`
- Badges: `badge-primary`, `badge-success`, `badge-warning`, `badge-danger`, `badge-info`

**Custom Colors**: `primary`, `secondary`, `success`, `warning`, `danger`, `info` (each with shades 50-950)

## Common Development Patterns

**API Endpoint Structure**:
```typescript
import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  // GET with query params
  const query = getQuery(event)

  // POST/PUT with body
  const body = await readBody(event)

  // Database operations
  const result = await prisma.modelName.operation()

  return result
})
```

**Page Component Pattern**:
- List pages: Fetch data, display table, handle CRUD operations
- Edit pages: Use dynamic route `[id].vue`, fetch single record, use form component
- Create pages: Use form component with empty initial data

**Form Handling**: Forms often use refs for form data and methods for validation/submission.

## Testing

**Framework**: Vitest with happy-dom/jsdom environment

**Test Structure**:
- `/tests/unit/api/`: API endpoint tests
- `/tests/unit/components/`: Vue component tests
- `/tests/integration/`: Integration tests (e.g., invoice workflow)
- `/tests/helpers/`: Test factories and utilities
- `/tests/mocks/prisma.mock.ts`: Prisma client mock

**Running Single Tests**:
```bash
yarn test tests/unit/api/produkte.test.ts     # Run specific test file
yarn test -t "should create product"          # Run tests matching name
```

## Important Notes

- **German Language**: Most database fields, comments, and UI elements are in German
- **Experimental Status**: Code is AI-generated and may have inconsistencies
- **Version Conflicts**: Check for optimistic locking conflicts on updates using `LetzteAenderung` field
- **File Uploads**: Handle multipart form data for image uploads to product/category endpoints
- **Seeding**: Use `yarn seed` to populate test data (uses Faker.js via @faker-js/faker)
