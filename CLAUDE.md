# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run start:dev        # Start dev server (port 8082) with development env
npm run start:staging    # Start with staging environment
npm run start:prod       # Start with production environment
npm run android          # Launch Android with dev env
npm run ios              # Launch iOS with dev env
```

### Builds (via EAS)
```bash
npm run build -- --env development --platform android   # Android dev build
npm run build -- --env staging --platform ios           # iOS staging build
npm run build:android:bundle                             # Android bundle build
```

### Code Quality
```bash
npm run lint             # ESLint via Expo lint
```

There is no test suite configured in this project.

## Architecture

### Routing
Expo Router with file-based routing. All screens live in `app/`. The root `app/_layout.tsx` wraps the app with `TripProvider`, `SafeAreaProvider`, and `ThemeProvider`. Navigation uses a single `Stack` with `headerShown: false` globally; screens manage their own headers.

### State Management
React Context API only — no Redux or Zustand. `contexts/TripContext.tsx` holds trip planning state (selected cities, dates, trip details) across the multi-step create-trip flow. State is in-memory and not persisted across app restarts. `clearTripDataGlobally()` is called on logout.

### API / Services Layer
`services/http-client.ts` is a singleton HTTP client with:
- Automatic JWT token injection via `TokenManager`
- 401 handling with token refresh + request queue (pending requests are replayed after refresh)
- Network activity monitoring integration
- AbortSignal support

Three backend services, each with its own base URL from environment config:
- **User Service** — auth, profile (`services/auth/`, `services/profile/`)
- **Travel Service** — trips, cities (`services/trip/`, `services/city/`)
- **Recommendation Service** — recommendations (`services/recommendation/`)

`services/api-config.ts` centralizes all base URLs and timeout config.

### Environment Configuration
Environment variables are loaded via `dotenv-cli` from `.env.development`, `.env.staging`, or `.env.production`. All vars must be prefixed with `EXPO_PUBLIC_`. `utils/env-config.ts` validates required vars on import and provides typed accessors.

Required vars:
```
EXPO_PUBLIC_RECOMMENDATION_SERVICE_URL
EXPO_PUBLIC_USER_SERVICE_URL
EXPO_PUBLIC_TRAVEL_SERVICE_URL
EXPO_PUBLIC_API_TIMEOUT          # default: 10000ms
EXPO_PUBLIC_ENABLE_NETWORK_MONITOR
EXPO_PUBLIC_NODE_ENV             # development | staging | production
```

EAS build profiles in `eas.json` define per-environment values for CI/CD builds.

### Path Aliases
TypeScript is configured with `@/*` mapping to the project root (via `tsconfig.json` and `babel.config.js` module-resolver). Use `@/components/...`, `@/services/...`, etc. for imports.

## Design System

Documented in `.github/copilot/DESIGN_SYSTEM.md`. Key values to use consistently:

**Colors:**
- Primary gradient: `#6366f1` → `#8b5cf6`
- Background: `#f8f9fa`, Surface: `#ffffff`
- Text primary: `#1f2937`, Text secondary: `#6b7280`

**Spacing:** 8px grid system (4, 8, 12, 16, 20, 24, 32, 40, 48px)

**Border radius:** 8px (small) / 16px (standard) / 20px (hero sections)

**Touch targets:** minimum 44px for all interactive elements

**Shadows:**
- Medium: `0px 2px 8px rgba(0,0,0,0.05)`
- Heavy: `0px 4px 16px rgba(0,0,0,0.1)`
- Colored: `0px 4px 16px rgba(99,102,241,0.3)`

Reusable UI primitives are in `components/ui/` (Button, Card, SearchBar, FloatingActionButton, Notification, IconSymbol).
