# ZManage-Web Changelog

## [0.2.7] - 2026-09-12
### Collapsible Navigation Console & Project SSO Awareness
- **Collapsible Operations Navigation (`DashboardLayout.tsx`)**:
  - Implemented sleek toggleable sidebar (`w-60` expanded vs `w-16` compact) with smooth animations and tooltips.
  - Sidebar state persisted in `localStorage` (`zmanage_sidebar_collapsed`).
  - Active project context displayed dynamically in the sidebar header with visual indicator.
- **SSO Query Parameter Context (`App.tsx`)**:
  - Enhanced SSO handler to extract and persist `projectId` and `projectName` query parameters when launched from Zorvik-Tech client portal.

## [0.2.6] - 2026-09-12
### Webhook & Integration Configuration Alignment
- **Settings & Integration Alignment (`SettingsView.tsx`)**:
  - Realigned default outbound webhook endpoint URL to `/webhooks/zmanage`.

## [0.2.5] - 2026-09-12
### Web Portal Project & Folder Realignment
- **Portal & Folder Realignment**:
  - Renamed workspace directory from `ZResource-Web` to `ZManage-Web`.
  - Synchronized package manifest name to `zmanage-web` and version to `0.2.5`.
  - Updated API client documentation and workspace metadata to reflect ZManage while preserving backward-compatible session fallbacks.

## [0.2.4] - 2026-09-11
### Persistent Login Session & Direct Console Navigation
- **Persistent Session State (`App.tsx`)**:
  - Automatically checks `localStorage` for `zmanage_session` on root page load. If an active session exists, directly maintains the user inside the Operations Console across browser refreshes and tab reopens.
- **Smart Landing Page Action Bar (`LandingPage.tsx`)**:
  - Dynamically renders **"Go to Console"** in the top navigation bar when an authenticated session is detected, allowing users to return immediately to their workspace without having to re-authenticate.

## [0.2.3] - 2026-09-11
### Real Studio Operations Suite, WhatsApp Call Sheets & Return Inspection Logger
- **Equipment Vault (`InventoryView.tsx`)**:
  - Auto-code sequence generator support: leaving SKU/Code blank prompts backend sequence generation (`CAM-001`, `LNS-001`).
  - Added **Return & Health Inspection Modal**: upon checking gear back in, operators log return condition (`excellent`, `good`, `fair`, `in_repair`) and detailed maintenance notes.
- **Operations Timeline & Call Sheets (`ScheduleView.tsx`)**:
  - Built **Digital Call Sheet Modal** with 1-click **"Copy for WhatsApp"** button formatting the shoot brief (Venue, Call/Wrap Times, Client POC, Dispatched Crew Roster, Allocated Kit checklist) ready for instant WhatsApp dispatch.
- **UI De-clutter & Dub Design Polish (`DashboardLayout.tsx`)**:
  - Removed obsolete developer "API Keys & Settings" tab and technical port badge (`Port 4003`), replacing with clean "Live Operations" indicator.
- **Dedicated Environment Configuration (`.env`)**:
  - Created dedicated `.env` with `VITE_API_URL` and `VITE_ZORVIK_AUTH_URL`.

## [0.2.2] - 2026-09-11
### Centralized Zorvik-Tech Auth API Connection & ZManage Rebranding
- **Centralized Authentication Linkage**:
  - `AuthPage.tsx` now calls the centralized Zorvik-Tech `/api/v1/auth/login` endpoint as primary authority.
  - Automatically captures the resolved `token`, `tenantId`, and `clientName` in `zmanage_session`.
- **SSO Query Parameter Handoff**:
  - Added seamless URL query parameter listener in `App.tsx`: allows clients navigating directly from the Zorvik-Tech client portal (`?token=...&tenantId=...`) to auto-authenticate without entering credentials twice.
- **ZManage Brand Refresh**:
  - Updated all page titles, headers, badges, and documentation from `ZResource` to **ZManage** while maintaining the Dub.co rice paper aesthetic.

## [0.2.1] - 2026-09-11
### End-to-End API Integration & Standardized Email/Password Login
- **Authentication**:
  - Removed manual Tenant ID input field from `AuthPage.tsx`. Users log in directly with **Email** and **Password** (identical to the standard Zorvik Tech client login flow).
  - Integrated with native `POST /api/v1/auth/login` on `ZResource-APIs`, resolving tenant context and session tokens automatically.
- **Zero Mock Data Integration**:
  - Wired `InventoryView.tsx`, `CrewView.tsx`, `ScheduleView.tsx`, and `PayoutsView.tsx` to live backend endpoints via `src/lib/api.ts`.
  - Replaced all hardcoded mock arrays with dynamic database queries and mutation handlers.

## [0.2.0] - 2026-09-11
### Dub-Style Design System Overhaul & Enterprise Multi-Page Workspace
- **Dub Design System Standard (Rice Paper / Border-First)**:
  - Strict palette: Canvas white (`#ffffff`), paper mist (`#f5f5f5`), 1px hairline borders (`#e5e5e5`), monochrome text (`#171717`, `#737373`), single Electric Blue (`#2563eb`) accent, and Deep Sapphire (`#1e40af`) CTAs.
  - Distinctive black input borders (`#171717`) and signature dotted grid canvas background.
  - Three-tier radius vocabulary: Pills (`9999px`), cards (`12px`), inputs (`6px`), buttons (`8px`).
- **Editorial Public Landing Page (`LandingPage.tsx`)**:
  - Satoshi display headline: *"Operations & Equipment Command for Modern Studios."*
  - Signature floating feature pills (*Equipment Vault*, *Zero-Collision Guard*, *1-Tap Team Onboarding*).
  - High-fidelity product mockup container with live metric preview and instant interactive console jump.
- **Client Auth Page (`AuthPage.tsx`)**:
  - Integration with Zorvik Tech Identity Plane (`Auth-APIs`).
  - Studio tenant ID / domain resolver, credential verification, and 1-click studio demo access.
- **Enterprise Operations Console (`DashboardLayout.tsx`)**:
  - 2-column SaaS app shell with fixed 240px sidebar, workspace switcher (*Aura Creative Studios*), breadcrumbs, and live API connection status indicator.
  - **Dense Inventory View**: Hairline data tables, category filters, physical condition badges, serial numbers, and check-out/return inspection actions.
  - **Operations Timeline**: Visual shoot schedule with live Zero-Collision guard callout.
  - **Crew & 1-Tap Onboarding**: Team roster with candidate discovery from `auth_service.tbl_client_users` and selective exclusion controls.
  - **Worker Payouts**: Financial summary metrics, contractor compensation ledger, and bank UTR settlement modal.
  - **Developer Settings**: Publishable (`zm_live_pub_...`) and Secret (`zm_live_sec_...`) API key manager and webhook dispatcher.

## [0.1.0] - 2026-09-11
### Initial Portal Launch
- Initial setup and routing.
