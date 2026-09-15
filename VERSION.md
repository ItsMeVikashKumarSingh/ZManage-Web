# ZManage-Web Changelog

## [0.9.0] - 2026-09-15
### Role-Based Access Control (RBAC) & Granular Tab Permissions Management
- **Role Tier Presets & Tab Configuration (`CrewView.tsx`)**:
  - Implemented comprehensive Team Access Management with 1-click role presets: `Admin`, `Studio Manager`, `Logistics Lead`, `Finance & Accounts`, `Field Crew / Specialist`, and `Custom`.
  - Added dedicated "Access Tier" badge column in the workforce roster table with direct click-to-configure action.
  - Added "Configure Tab Access" in row action menu.
  - Built Glassmorphism 2.0 Tab Permissions Modal allowing studio owners and managers to toggle access for any of the 11 operational modules (`ai`, `analytics`, `bookings`, `schedule`, `inventory`, `kits`, `consumables`, `vaults`, `crew`, `payouts`, `logs`).
  - Added "Access Tier" and "Allowed Tabs" to CSV export.
- **Dynamic Navigation & Client-Side Route Guards (`DashboardLayout.tsx`)**:
  - Integrated `roleTier` and `allowedTabs` props throughout the dashboard layout.
  - Filtered sidebar navigation groups dynamically to show only modules authorized for the active user role.
  - Added active role tier badge in top header.
  - Added unauthorized route guard: users attempting to view unauthorized tabs see a cyber-styled Access Restricted screen with a quick return button to their default allowed tab.
  - Automatic fallback redirection if URL specifies an unauthorized or default tab.
- **API Integration & State Flow (`api.ts`, `App.tsx`)**:
  - Connected `updateWorkerPermissions(workerId, payload)` to `PATCH /workers/:id/permissions` endpoint on `ZManage-APIs`.
  - Stored and hydrated `roleTier` and `allowedTabs` from session data on login and access verification.

## [0.8.2] - 2026-09-15
### Rule 8.4 Iconography Compliance, Vite Code-Splitting & Dead Code Elimination
- **Rule 8.4 Iconography & Emoji Sanitization (`StudioAiCopilotModal.tsx`, `ScheduleView.tsx`, `BookingsView.tsx`, `LandingPage.tsx`)**:
  - Removed emojis from AI Copilot greeting (`👋`) and error handling toast (`⚠️`).
  - Replaced raw text unicode `✓` checkmarks in `LandingPage.tsx` with Lucide `<Check />` icons.
  - Replaced raw text `✕` characters in `BookingsView.tsx` and `ScheduleView.tsx` with Lucide `<X />` icons.
  - Replaced timeline event emoji `📋` in `ScheduleView.tsx` with Lucide `<Ticket />` icon.
- **Frontend Performance & Bundle Optimization (`DashboardLayout.tsx`)**:
  - Converted all 8 major dashboard views (`InventoryView`, `ScheduleView`, `CrewView`, `PayoutsView`, `AnalyticsView`, `BookingsView`, `LogsView`, `ZorvikAiView`) to asynchronous `React.lazy()` dynamic imports wrapped in a `Suspense` boundary.
  - Resolved Vite production chunk warning by distributing heavy view bundles into on-demand asynchronous chunks.
- **Dead Code & Legacy Prototype Elimination**:
  - Safely removed orphaned prototype components: `AssetVault.tsx`, `CrewRoster.tsx`, `WorkerPayouts.tsx`, `OperationsCalendar.tsx`, and unrouted `views/SettingsView.tsx`.
- **Elimination of Hardcoded Fallback IDs (`api.ts`, `App.tsx`, `AuthPage.tsx`, `.env`)**:
  - Removed static fallback tenant ID from `api.ts`; API headers now dynamically read the active session without phantom headers.
  - Converted demo workspace tenant resolution in `App.tsx` and `AuthPage.tsx` to read from `VITE_DEMO_TENANT_ID` environment variable.
- **Version Harmonization (`package.json`)**:
  - Synchronized package version to `0.8.2`.

## [0.8.1] - 2026-09-13
### Zorvik AI Multimodal PDF Query Prompting & Active Tenant Realignment
- **Multimodal Document Inspection (`ZorvikAiView.tsx`)**:
  - Automatically formats document-directed queries when users upload PDFs or files without typing manual text, ensuring the assistant prioritizes document analysis.
- **Tenant Context Alignment (`api.ts`)**:
  - Realigned default fallback tenant ID to active, non-deleted studio project (`26d6ac0b-964c-42d8-aa9a-84adb7698d4b`).

## [0.8.0] - 2026-09-13
### Zorvik AI Dedicated Suite: Multi-Turn History, Voice Dictation & Multimodal Support
- **Full-Page Zorvik AI Workspace (`ZorvikAiView.tsx`)**:
  - Added dedicated navigation tab under new **"Intelligence"** section in the main sidebar.
  - Multi-session persistent chat history (Today, Yesterday, Older) with 1-click "New Chat" creation and session deletion.
  - Web Speech API integration for hands-free voice dictation (`Mic` toggle with pulsing audio status).
  - Multimodal document & image attachments (drag-and-drop or picker for `.png`, `.jpg`, `.pdf`, `.txt`) with inline thumbnail previews and base64 transmission to Zorvik-AI.
- **Markdown & Output Formatting Overhaul (`MarkdownRenderer.tsx`)**:
  - Replaced raw text strings with custom zero-dependency Markdown parser.
  - Formats bold text, bullet points with cyber-styled pills, sub-bullets, and operational headings.
  - Eliminates raw asterisks (`**` or `*`) and broken spacing.
- **Enhanced Suggestions UI**:
  - Re-styled suggested prompts with pill badges, purple accent hover states, and smooth horizontal scrolling.
- **Complete Branding & Model Anonymization**:
  - Removed all internal engine leaks (`Gemini 2.5 Flash`, etc.) from modal footers and API payloads.
  - Standardized all headers, footers, and assistant tags to **Zorvik AI**.

- **In-Browser QR / Barcode Scanner (`QrScannerModal.tsx`)**:
  - Direct live camera viewfinder with high-speed targeting reticle and auto-laser animation for 1-second check-in/out and return inspections.
  - Multi-attribute instant search matching by Asset Code, S/N, SKU, or UUID with real-time feedback banner.
  - Integrated directly into **Hardware Assets**, **Equipment Kits**, and the **Operations Timeline**.
- **Printable QR Sticker Label Sheets (`PrintableLabelModal.tsx`)**:
  - Generates Avery / Brother standard compatible printable sticker sheets with studio branding, asset SKU, serial number, and storage vault location.
  - Supports individual item printing from row menus as well as 1-click batch sticker sheet generation for filtered gear catalogs and kit bundles.
  - Native print stylesheet optimization hiding chrome and UI elements during browser print/PDF export (`@media print`).
- **Zorvik-AI Studio Director Copilot Modal (`StudioAiCopilotModal.tsx`)**:
  - Direct global header button **"Ask AI Copilot"** providing conversational intelligence across the studio.
  - Answers natural language questions about upcoming shoots, equipment status, technician day rates, and contractor payouts with live context grounding.
  - Interactive suggested prompts, multi-turn conversation memory, and seamless fallback resilience.

## [0.6.0] - 2026-09-13
### Direct Sidebar Logistics Navigation & Zorvik-AI Kit Recommender
- **Direct First-Class Sidebar Logistics (`DashboardLayout.tsx`)**:
  - Reorganized navigation menu into distinct operational sections:
    - **Operations**: Executive Analytics, Client Bookings, Operations Timeline
    - **Inventory & Logistics**: Hardware Assets (`/dashboard/inventory`), Equipment Kits & Bundles (`/dashboard/kits`), Consumables Stock (`/dashboard/consumables`), Storage Vaults & Hubs (`/dashboard/vaults`)
    - **Workforce & Finance**: Workforce & Team (`/dashboard/crew`), Compensation Ledger (`/dashboard/payouts`)
    - **Security**: Security & Audit Logs (`/dashboard/logs`)
  - Direct deep-linking: Clicking any logistics item immediately opens the respective manager without nested tab hunting.
  - Bidirectional sub-tab synchronization: Changing tabs inside `InventoryView` dynamically syncs with the active sidebar route.
- **Zorvik-AI Kit & Crew Recommender Integration (`ScheduleView.tsx`, `api.ts`)**:
  - Added typesafe client method `api.recommendAllocation` connecting to `ZManage-APIs` and the `Zorvik-AI` microservice.
  - Integrated the **"Zorvik-AI Kit & Crew Assistant"** into the shoot allocation modal.
  - 1-click AI generation: Analyzes shoot title, venue, duration, package, and special notes against live tenant inventory and crew roster.
  - Displays confidence score, model used, gear/crew count breakdown, and critical shoot preparedness advice (V-mount battery redundancy, ND filters, gimbal motor calibration).
  - 1-click "Apply to Selection" auto-selects recommended equipment and crew shifts in the allocation form.

## [0.5.1] - 2026-09-13
### Operations Schedule Bookings Integration: Timeline, Calendar & Agenda Unified View
- **Multi-Source Schedule Merging (`ScheduleView.tsx`)**:
  - Unified `zmanage.allocations` and confirmed client bookings from `studio.tbl_bookings` (`api.getBookingCandidates()`).
  - Automatically identifies studio and offline client bookings awaiting equipment kits and technician shifts without requiring prior manual synchronization.
- **Smart Initial Date & Calendar Auto-Focus**:
  - Automatically initializes date selection to the nearest upcoming shoot/booking date (e.g. October 15, 2026) when today has no scheduled events, preventing empty/blank screen confusion.
- **Visual Operations Timeline Integration**:
  - Confirmed bookings render directly as distinct amber bars on the 24-hour Gantt scale with a prominent `Booking` badge.
  - Clicking a booking bar opens the shoot allocation modal pre-filled with client contact info, title, venue, and time window.
- **Monthly Calendar Grid Indicators**:
  - Calendar cells calculate and display both locked shoot counts (emerald badge) and pending booking counts (amber badge).
  - Highlights days requiring gear dispatch with an active `Awaiting Gear` pulse indicator.
- **Agenda View with 1-Click Allocation & WhatsApp Sharing**:
  - Displays bookings with a `Booking · Awaiting Gear/Crew` status badge.
  - Replaces empty hardware/crew lists on unallocated bookings with an actionable allocation banner and `+ Allocate Gear & Crew` CTA.
  - Retains direct 1-tap WhatsApp sharing and calling for client POCs.
- **Header 1-Tap Sync**:
  - Added header `1-Tap Sync` button that batch-creates production allocations for all unallocated client bookings in 1 click.
- **Compact Layout Overhaul**:
  - Adjusted card padding from `p-5 space-y-4` to `p-4 space-y-3` across the Agenda view, optimizing viewport real estate for actual operational content.

## [0.5.0] - 2026-09-13
### Phase 1 Inventory Overhaul: Physical Vaults, Equipment Kits, Consumables Stock & Asset Depreciation
- **4-Tab Sub-Navigation Architecture (`InventoryView.tsx`)**:
  - Reorganized the inventory console into 4 distinct workflow tabs:
    1. **Hardware Assets**: Individual serialized gear with vault tags, condition, maintenance indicators, and real-time straight-line depreciation book values.
    2. **Equipment Kits & Bundles**: Pre-packaged flight cases, camera rigs, and lighting packages with itemized requirements and total package counts.
    3. **Consumables Stock**: Expendables and non-serialized supplies (tapes, batteries, gels) with stock counters and min-reorder threshold alert banners.
    4. **Vaults & Locations**: Physical storage hubs (Main Vault, Locker B, Mobile Van 1) with capacity stats and direct equipment count auditing.
- **Physical Vaults & Storage Hubs Management (`VaultsSection.tsx`)**:
  - Full CRUD operations for studio storage locations.
  - Visual metrics: total vaults, total items secured across hubs, total capacity slots, and average utilization %.
  - Quick action to view all equipment stationed within any vault directly filtered in the hardware assets tab.
  - CSV export of storage hub infrastructure.
- **Consumables & Expendables Management (`ConsumablesSection.tsx`)**:
  - Full tracking of expendables with category filters, unit types (rolls, packs, meters, boxes), and min-reorder alerts.
  - Stock adjustment modal: quick positive or negative adjustments with audit reason tagging.
  - Low stock warning banner highlighting items below threshold.
  - CSV export of expendables inventory.
- **Equipment Kits & Flight Cases Management (`KitsSection.tsx`)**:
  - Kit configuration modal supporting multi-item itemized manifests (category, specific item, or consumable) with required quantities.
  - Tracks total number of identical kits owned (`total_kits_count`) and vault location.
  - Expandable kit cards showing the complete item checklist with required quantities.
  - CSV export of kit manifests.
- **Compact Screen Real-Estate & Information Density Overhaul**:
  - Compacted top metric summary cards across `InventoryView.tsx`, `VaultsSection.tsx`, `KitsSection.tsx`, `ConsumablesSection.tsx`, `PayoutsView.tsx`, `BookingsView.tsx`, and `LogsView.tsx` from ~95px height down to ~45px.
  - Replaced bulky 3-box vertical cards in `VaultsSection.tsx` with an inline stats strip, reducing card height by 50% and doubling data visibility.
  - Streamlined kit cards in `KitsSection.tsx` with compact icon badges and tighter checklist items.
  - Tightened vertical rhythm from `space-y-6` to `space-y-3.5`, maximizing screen real estate for actual tables and lists.
- **Asset Maintenance & Straight-Line Depreciation (`InventoryView.tsx`)**:
  - Added optional toggles for Maintenance Tracking and Depreciation Calculation in Add/Edit Asset modal.
  - Displays computed current book value and accumulated depreciation badge in asset details modal and inventory table.
  - Displays scheduled maintenance due dates with visual warning indicators.
- **API Client Layer (`src/lib/api.ts`)**:
  - Extended client with types and methods: `getVaults`, `createVault`, `updateVault`, `deleteVault`, `getConsumables`, `createConsumable`, `updateConsumable`, `adjustConsumableStock`, `deleteConsumable`, `getKits`, `createKit`, `updateKit`, `deleteKit`.

## [0.4.13] - 2026-09-13
### Payouts Ledger Metrics Normalization & Derivation (`PayoutsView.tsx`, `api.ts`)
- **Ledger-Derived Metric Calculations (`PayoutsView.tsx`)**:
  - Added robust fallback calculations directly from the ledger transactions list in `loadData()` to guarantee UI consistency.
  - Corrected Settled Total tile to read from `settled_total` with `paid_total` fallback and derived totals from settled records.
  - Corrected transaction counters (`pending_count`, `settled_count`) to reflect actual pending and settled transaction records.
- **Type Definitions (`api.ts`)**:
  - Added `paid_total` optional field to `PayoutsSummary` interface for backwards compatibility.

## [0.4.12] - 2026-09-12
### Dynamic Human-Friendly Event Metadata & Multi-Note Inspection History Timeline
- **Dynamic Structured Event Metadata Inspector (`LogsView.tsx`)**:
  - Replaced the technical raw JSON dump with a **Friendly Overview** parsed dynamically for normal studio users.
  - Formats inspection notes and return remarks into a highlighted amber quote card with a condition shield badge.
  - Generates color-coded badges for physical conditions (`Excellent`, `Good`, `Fair`, `In Repair`) and operational status dots (`Available`, `On Shoot`, `Maintenance`).
  - Displays attribute mutation chips (`[ Maintenance Notes ]`, `[ Condition ]`) and formatted property cards for SKU, names, IDs, dates, and amounts.
- **Client ID Masking & User-Side Privacy (`LogsView.tsx`)**:
  - Removed internal `client_id` from the user-facing modal telemetry context bar, raw telemetry view, copy-to-clipboard actions, and dynamic property tables.
  - Renamed the audit table's "Client Origin" column to "Network Origin" for clarity.
- **Persistent Inspection & Return Notes History Timeline (`InventoryView.tsx`, `api.ts`)**:
  - Built **Inspection & Return Notes History** timeline inside the Asset Details & Usage History modal, preserving all past notes and inspections chronologically.
  - Displays formatted timestamps, condition badges at the time of each inspection, and action tags (`Return Inspection` vs `Maintenance Log`).
  - Integrated inline **"Log Note"** quick form to record observations and condition transitions directly from the modal without leaving the screen.
  - Updated `api.ts` with `AssetNoteRecord`, `addAssetNote`, and extended `getAssetHistory` response.

## [0.4.11] - 2026-09-12
### Centralized Security & Activity Audit Logs Console (`LogsView.tsx`)
- **New Navigation Module: Security & Audit Logs (`DashboardLayout.tsx`)**:
  - Registered `'logs'` tab with Lucide `ShieldCheck` icon in the Operations Suite navigation rail.
  - Connected router to render `<LogsView />`.
- **Cyber-Elegant Audit & Security Activity Console (`src/components/views/LogsView.tsx`)**:
  - **Metric Row**: Real-time aggregate count cards for Total Events, Gear & Hardware Operations, Timeline Dispatches, and Payout Settlements.
  - **Categorized Data Toolbar**: Search input matching actions, entities, IP addresses, or notes; category filter pills (`All`, `Gear`, `Shoots`, `Crew`, `Payouts`, `Bookings`, `Auth`); and RFC-4180 UTF-8 BOM CSV Export.
  - **Audit Trail Table**: Formatted relative & exact timestamps, color-coded action event badges, target entity labels, context highlights (return notes, equipment counts, UTR codes), origin IP & client user-agent strings.
  - **Inspect JSON Payload Drawer**: Dedicated modal displaying full formatted JSON event metadata with 1-click clipboard copy.
- **Type-Safe API Integration (`src/lib/api.ts`)**:
  - Added `AuditLogRecord`, `AuditLogMetrics`, and `AuditLogsResponse` interfaces and `getAuditLogs` method.

## [0.4.10] - 2026-09-12
### Modern Animated Theme Switcher & Visual Redesign (`ThemeToggle.tsx`)
- **Interactive Sliding Switch Control**:
  - Replaced the confusing static text badge (`Light Theme OFF` / `Dark Theme ON`) with an authentic, animated sliding toggle switch (iOS/Linear design language).
  - The switch track smoothly transitions colors (`bg-electric` in Dark Mode, neutral ash in Light Mode) with a sliding white knob housing micro `Sun` and `Moon` Lucide icons.
- **Clear Information Architecture**:
  - Structured the toggle row with a rounded icon box (`w-7 h-7`), primary title **"Theme"**, and clear secondary subtitle dynamically indicating **"Light Mode"** or **"Dark Mode"**.
  - Added support for a new `segmented` variant for side-by-side pill controls (`[ ☀️ Light ] [ 🌙 Dark ]`).

## [0.4.9] - 2026-09-12
### Operations Timeline Date Navigation & Interactive "Today" Controller Architecture
- **Interactive Day Navigation & Stepper (`ScheduleView.tsx`)**:
  - Replaced the static, unformatted "Today" button with a segmented Day Navigator controller featuring `Previous Day` (`ChevronLeft`), `Jump to Today`, and `Next Day` (`ChevronRight`).
  - Added live active indicator pulse dot and high-contrast pill styling when Today is actively selected.
- **Custom Native Date Picker Trigger**:
  - Integrated a calendar picker trigger button with friendly date headers (e.g. `Saturday, Sep 12, 2026` / `All Dates`) backed by an HTML5 date picker overlay, allowing managers to instantly jump to any arbitrary date.
- **Formatted Quick Date Focus Pills**:
  - Replaced raw ISO strings (e.g., `2026-09-12`) with humanized labels (`Today`, `Tomorrow`, `Sat, 12 Sep`) and active shoot count badges.
  - Added an **"All Dates"** pill with total shoot counter to allow browsing the entire schedule without date filtering.
- **Timeline Card Header & Monthly Calendar Enhancements**:
  - Added formatted date header (`Hourly Resource Track: ...`) with a prominent `[Today]` badge when viewing today.
  - Added quick day-stepping buttons directly inside the timeline header and active pulsing indicators on the Monthly Calendar view's Today button.

## [0.4.8] - 2026-09-12
### Scalable Actions Architecture, Sidebar Header Collapse Control & Status Indicator Consolidation
- **Sidebar Drawer Header Collapse & Extend (`DashboardLayout.tsx`)**:
  - Relocated the sidebar collapse toggle (`ChevronLeft`) to the **top** of the navigation rail directly adjacent to the project switcher.
  - Relocated the expand button (`ChevronRight`) to the top of the rail when collapsed, enabling immediate access without scrolling to the footer.
- **Removed Duplicate Status Indicator (`DashboardLayout.tsx`)**:
  - Eliminated the redundant "ZManage Active" green indicator from the sidebar footer.
  - Retained the single, authoritative **"Live Operations"** green status indicator in the top command bar.
- **Scalable Three-Dot Action Dropdown Menu (`InventoryView.tsx`, `CrewView.tsx`)**:
  - Refactored cluttered inline action buttons into a scalable three-dot dropdown menu (`MoreVertical`).
  - Added smart boundary detection (`isNearBottom ? 'bottom-full mb-1.5' : 'top-full mt-1.5'`) and global click-away listeners.

## [0.4.7] - 2026-09-12
### Equipment & Hardware Asset Editing Fix
- **Payload Sanitization & Null Handling (`InventoryView.tsx`)**:
  - Sanitized edit asset payload in `handleSaveEdit`: trimmed product name, code, category, and serial number.
  - Converted empty string inputs to `undefined` so optional fields are properly handled without causing database constraint errors.
  - Aligned with backend CORS preflight updates (`PATCH /api/v1/assets/:id`).

## [0.4.6] - 2026-09-12
### Complete Removal of Conceptual "Mobile Crew Pass" & Alignment with Production Modules
- **Removed Orphaned Component (`MobileCrewPass.tsx`)**:
  - Permanently deleted `src/components/MobileCrewPass.tsx`, which was an unused mockup component not part of the active 6-module dashboard.
- **Landing Page Alignment (`LandingPage.tsx`)**:
  - Replaced the 3rd production flow step ("Smartphone Crew Pass") with **"Crew Dispatch & Roster"** (`STEP 03`), highlighting verified day rates, shoot call times, and role allocation.
  - Replaced the interactive feature showcase tab from "Mobile Crew Pass" to **"Workforce & Team Roster"** with real-world technician rosters (Cinematographers, Drone Pilots).
  - Replaced the mobile pass FAQ with a dedicated answer explaining how ZManage manages freelance and in-house crew rosters and compensation profiles.
  - Updated the product footer links to replace "Mobile Crew Pass" with "Workforce & Team".
  - Cleaned up unused `Smartphone` Lucide icon import.
- **Legal & Compliance Realignment**:
  - **Privacy Policy (`PrivacyPolicyPage.tsx`)**: Replaced the "Mobile Crew Pass & Location Telemetry" section with "Workforce Directory & Roster Data", clarifying that ZManage stores contact/role data for operations dispatch without background geolocation tracking.
  - **Terms of Service (`TermsOfServicePage.tsx`)**: Removed Crew Pass references from team access permissions and updated the 99.9% SLA commitment to cover core operations (Shoot calendar conflict verification, Hardware Vault lookups, and Team dispatch).
  - **Security Page (`SecurityPage.tsx`)**: Updated role permission matrix to represent authentic studio tiers (Studio Owner, Operations Coordinator, Lead Equipment Technician, Studio Production Staff).
- **Zero Errors & Clean Build**:
  - `npm run lint` and `npm run build` verified with zero warnings and zero TypeScript errors.

## [0.4.5] - 2026-09-12
### Interactive Quick Actions Console Replacement (`AnalyticsView.tsx`)
- **Replaced Static "System Health & Controls" Box**:
  - Removed passive informational cards (*"Zero-Collision Guard"* and *"Upcoming Operations"*) from the Executive Analytics overview.
  - Built an interactive **Quick Actions Console** with fast-path operational triggers across all 5 workspace modules:
    1. **Schedule Shoot & Dispatch**: Directly navigates to Operations Timeline (`/dashboard/schedule`) to allocate gear and assign crew.
    2. **New Offline Booking**: Directly navigates to Bookings & Orders (`/dashboard/bookings`) to record walk-in clients and bespoke packages.
    3. **Register Equipment / Gear**: Directly navigates to Gear Vault (`/dashboard/inventory`) to register cameras, lenses, and hardware SKUs.
    4. **Onboard Team Member**: Directly navigates to Workforce Roster (`/dashboard/crew`) to add contractors or run 1-tap candidate sync.
    5. **Settle Shift Payouts**: Directly navigates to Compensation Ledger (`/dashboard/payouts`) to reconcile contractor shifts and log bank UTR references.
- **Cyber-Elegant Aesthetics & Direct Navigation**:
  - Styled interactive trigger cards with distinctive module badge containers, high-contrast hover feedback, micro-animations (`group-hover:translate-x-0.5`), and theme-aware borders.
  - Enhanced `AnalyticsViewProps` interface with strict type safety for `'bookings'` navigation.

## [0.4.4] - 2026-09-12
### Official ZManage Branding & Favicon Integration
- **Official Brand Mark Assets**:
  - Extracted and deployed the official ZManage ribbon brand mark into `public/zmanage-app-icon.png`, `public/favicon.png`, and `public/zmanage-logo.png`.
- **Browser Favicon**:
  - Updated `index.html` to load `/favicon.png` with high-resolution PNG rendering.
- **Component Brand Mark Upgrades**:
  - **Landing Page Navigation & Footer (`LandingPage.tsx`)**: Replaced generic icon placeholders with official high-resolution `zmanage-app-icon.png` in the Dayos floating navigation header and multi-column footer.
  - **Standalone Legal Pages (`PrivacyPolicyPage.tsx`, `TermsOfServicePage.tsx`, `SecurityPage.tsx`)**: Upgraded navigation headers to use the official ZManage brand asset.
  - **Authentication Console (`AuthPage.tsx`)**: Updated studio console login header to render the official app mark.
- **Dependency & Code Cleanup**:
  - Removed unused `Layers` lucide icon imports across components.
  - Zero build errors (`tsc && vite build`) and zero linter warnings (`eslint .`).

## [0.4.3] - 2026-09-12
### Universal CSV Data Export Engine & Search Input UI Overlap Fix
- **Search Input Icon Overlap Bug Resolution (`BookingsView.tsx`, `ScheduleView.tsx`, `InventoryView.tsx`, `CrewView.tsx`, `PayoutsView.tsx`)**:
  - Replaced non-standard `pl-8.5` and tight `pl-8` class names with standardized `pl-10` (40px) padding across all 5 workspace search inputs.
  - Ensured the Lucide `Search` icon positioned at `left-3` (12px to 26px) has a generous 14px buffer before placeholder text begins, preventing icon/text visual collision.
- **Universal CSV Data Export Engine (`exportUtils.ts`)**:
  - Implemented generic RFC-4180 compliant CSV export utility (`exportToCsv<T>`).
  - Added automatic UTF-8 Byte Order Mark (`\uFEFF`) prefix to guarantee flawless rendering in Microsoft Excel and spreadsheet tools without garbled currency or unicode glyphs.
  - Implemented robust string escaping for commas, newlines, and nested double quotes (`""`).
- **Comprehensive CSV Exports across Workspace Views**:
  - **Orders & Bookings (`BookingsView.tsx`)**: Exports Order ID, Package Name, Client POC, Phone, Email, Event Date, Call Time, Wrap Time, Studio/Floor Venue, Agreed Amount (INR), Order Status, and Booking Type (Offline Walk-in vs Studio Online).
  - **Operations Timeline (`ScheduleView.tsx`)**: Exports Shoot Title, Venue, Client POC, Phone, Shoot Date, Call Time, Wrap Time, Locked Gear Count, Dispatched Crew Count, Timeline Status, and Special Instructions.
  - **Hardware & Gear Vault (`InventoryView.tsx`)**: Exports Asset SKU/Code, Equipment Name, Category, Serial Number, Physical Condition, Live Status, Purchase Cost (INR), and Purchase Date.
  - **Team & Crew Roster (`CrewView.tsx`)**: Exports Member Name, Primary Role, Employment Type, Phone, Email, Agreed Day Rate (INR), Payment Routing (UPI / Bank Account), and Active Status.
  - **Worker Payouts Ledger (`PayoutsView.tsx`)**: Exports Payout ID, Worker Name, Registered Phone, Payment Mode, Total Amount (INR), Settlement Status, Created Date, and Bank UTR / Reference.
- **Unified Action Toolbar UI**: Added standardized `"Export CSV"` button with Lucide `Download` icon across all 5 workspace headers.

## [0.4.2] - 2026-09-12
### Dayos-Style Floating Pill Navigation, Hero Pill Removal & Light/Dark Mode Footer
- **Floating Island Navigation Header (`LandingPage.tsx`)**:
  - Implemented a floating pill-shaped center navigation island inspired by the Dayos design system (`rounded-full bg-[#f2efe8]/80 dark:bg-zinc-800/70 border border-[#e4e1d9] dark:border-zinc-700/60 shadow-sm`).
  - Added links for *Platform, Gear Vault, Operations, Trust & SLA, FAQ, and Privacy*.
  - Styled a bold rounded pill conversion button (*"Schedule a Demo"*) with theme-responsive contrast.
- **Hero Tag Pill Removal (`LandingPage.tsx`)**:
  - Completely removed the `STUDIO OPERATIONS COMMAND · V2.4 PRODUCTION RELEASE` pill tag above the hero headline.
- **Dynamic Light & Dark Mode Footer (`LandingPage.tsx`)**:
  - Replaced hardcoded dark styling with responsive theme tokens: warm paper canvas (`bg-paper`, `border-ash`, `text-charcoal`) in light mode and carbon slate (`dark:bg-[#121214]`, `dark:border-[#232328]`, `dark:text-[#fbfbf9]`) in dark mode.
  - Ensured all column headers, body links, operational pills, and bottom copyright links adapt cleanly between light and dark themes.

## [0.4.1] - 2026-09-12
### Manual Offline Order Creation & Walk-in Client Bookings Console
- **Manual Offline Order Creation (`BookingsView.tsx`, `api.ts`)**:
  - Added **"New Offline Order"** button in the `/dashboard/bookings` workspace header.
  - Implemented comprehensive Offline Order Modal supporting:
    - Client POC details: Name, Phone (pre-formatted for WhatsApp dispatch), and Email.
    - Package preset selector (*Silver Wedding, Gold Royal Wedding, Pre-Wedding Cinematic, Studio Portrait, Corporate Event, Commercial Ad*) or "Custom Project" title input.
    - Event Date, Call Time, and Venue / Studio Floor location.
    - Financial pipeline inputs: Agreed Total Amount (INR) and Payment Status (*Advance/Deposit Received*, *Paid in Full*, *Pending*).
    - Client brief and special requirements textarea.
  - Added automatic preset price calculation with full custom override capability.
- **Visual Order Classification (`BookingsView.tsx`, `api.ts`)**:
  - Updated `BookingCandidate` schema to include `is_offline?: boolean`.
  - Tagged offline orders with a distinct violet **`Offline / Walk-in`** badge on order cards, visually separating walk-ins from online portal syncs.
  - Seamlessly integrated offline orders into the 1-click **"Schedule Shoot"** workflow to allocate gear and dispatch crew to the Operations Timeline.

## [0.4.0] - 2026-09-12
### "Editorial Production Desk" Redesign & Legal Infrastructure
- **Editorial Production Desk Aesthetic (`LandingPage.tsx`, `index.css`, `tailwind.config.js`, `index.html`)**:
  - Synthesized design principles from Super (sunlit warm paper canvas `#fbfbf9`, hairline borders `#eae8e4`, amber tally accent `#f59e0b`), Monad (editorial serif headlines + technical monospace telemetry pairing), and Equals (broadsheet ledger layout, 1px horizontal rules, structured data grids).
  - Loaded Google Font `Newsreader` for authoritative display typography alongside `Geist Mono` and `Inter`.
  - Added live operations telemetry announcement bar with real-time status beacon.
  - Implemented sticky editorial navigation with compact theme toggle and amber conversion CTA.
  - Created interactive studio operations mockup preview displaying live camera vault units, active dispatched crew, collision engine status, and pending UTR payouts.
  - Added high-throughput cinema equipment brand ticker (Sony CineAlta, RED, Arri, Blackmagic, Aputure, Zeiss, DJI Pro).
  - Designed the 4-step production workflow ("From Call Sheet to Bank Settlement").
  - Built interactive tabbed module showcase (Hardware Vault, Zero-Collision Calendar, Mobile Crew Pass, Payouts Ledger).
  - Designed broadsheet trust metrics (0% Double-Booking, ₹1.8Cr+ Settled, 99.9% Readiness, 256-bit Cryptography).
  - Added an interactive FAQ accordion addressing gear audits, call sheets, Bank UTRs, and data sovereignty.
  - Constructed a master 5-column carbon footer (`#121214`) linking to product modules, solutions, trust overviews, and legal policy pages.
  - Aligned all corporate references and external domains to `zorviktech.com` (`https://zorviktech.com`).
  - Positioned ZManage strictly as an operations platform with zero API references.
- **Dedicated Public Legal & Security Pages (`PrivacyPolicyPage.tsx`, `TermsOfServicePage.tsx`, `SecurityPage.tsx`, `App.tsx`)**:
  - Implemented `/privacy`: Standalone full-page Privacy Policy & Data Sovereignty terms detailing private studio workspaces, photographer on-demand location check-in rules, and 256-bit encrypted records.
  - Implemented `/terms`: Standalone full-page Terms of Service & Operational SLA outlining studio licensing, hardware custody disclaimers, contractor settlement logging, and 99.9% platform availability SLA.
  - Implemented `/security`: Standalone full-page Security, Privacy & Studio Trust overview highlighting enterprise tenant isolation, 4-tier role-based permissions, automated conflict prevention, and 256-bit encryption.
  - Wired standalone routes into `App.tsx` with automatic scroll-to-top and seamless return navigation.

## [0.3.2] - 2026-09-12
### Dedicated Client Bookings Console & Operations Timeline Streamlining
- **Dedicated Client Bookings Console (`BookingsView.tsx`, `DashboardLayout.tsx`)**:
  - Segregated client package purchase orders (`studio.tbl_bookings`) from the physical shoot timeline into a dedicated workspace at `/dashboard/bookings`.
  - Added 4 real-time metrics cards: Discovered Orders, Ready to Schedule, Scheduled & Synced, and Total Revenue Pipeline (INR).
  - Built comprehensive order cards displaying package tier, client POC, contact phone, event date, venue, and synchronized status.
  - Implemented 1-click **"Schedule Shoot"** modal directly on each order card, pre-filling shoot details while allowing equipment locks and crew assignments before pushing to `zmanage.allocations`.
  - Integrated 1-Tap Studio discovery and batch sync tools directly inside the Bookings workspace.
- **Operations Timeline Streamlining (`ScheduleView.tsx`)**:
  - Removed client purchase orders and order sync modal from the Operations Timeline, ensuring it remains focused on active physical production shoots, gear allocations, and crew call sheets.
  - Fixed search bar layout (`w-full lg:w-72 shrink-0`) to eliminate horizontal squishing on medium viewports.
- **Navigation Integration (`DashboardLayout.tsx`)**:
  - Added Bookings nav entry with Lucide `Ticket` icon and deep-linking support.

## [0.3.1] - 2026-09-12
### Operations Timeline Overhaul: Multi-View Engine, Zero-Collision Guard & WhatsApp Dispatch
- **Multi-View Operational Engine (`ScheduleView.tsx`)**:
  - Implemented a 3-tier view mode switcher:
    1. **Visual Hourly Timeline**: 07:00 to 23:00 hourly resource track showing proportional duration bars for each shoot, status accents, and live operations details.
    2. **Monthly Calendar Grid**: Full month interactive calendar displaying shoot density dots and count badges per day with 1-click day navigation.
    3. **Agenda Manifest Deck**: High-density operational cards with client point of contact, equipment vault chips, dispatched crew roles, and direct action triggers.
- **Real-Time Zero-Collision Detection Guard (`ScheduleView.tsx`)**:
  - Integrated client-side collision engine that cross-references active shoots for overlapping time windows.
  - Automatically detects shared cameras/hardware or crew members assigned to concurrent shoots.
  - Displays a prominent Zero-Collision Alert banner identifying exact equipment and team member double-booking conflicts.
- **Shoot Lifecycle & Status Management (`ScheduleView.tsx`, `api.ts`)**:
  - Added shoot cancellation and deletion (`handleDeleteAllocation`) with resource release.
  - Added status filtering (`All`, `Confirmed`, `In Progress`, `Completed`, `Cancelled`).
  - Added instant search filtering across shoot titles, venues, client names, telephone numbers, and crew members.
- **Enhanced Digital Call Sheet & Direct WhatsApp Dispatch (`ScheduleView.tsx`)**:
  - Added direct 1-click WhatsApp dispatch (`handleShareWhatsApp`) opening WhatsApp Web or App with the pre-formatted call sheet.
  - Added direct click-to-call telephone links for client point of contact.
  - Integrated copy-to-clipboard call sheet generator with visual feedback.
- **Data Normalization & Schema Fault-Tolerance (`ScheduleView.tsx`, `api.ts`)**:
  - Added support for both database schema fields (`title`, `venue`) and frontend fields (`shoot_title`, `shoot_venue`).
  - Automatically extracts equipment and crew from nested `asset_locks` and `worker_shifts` relations so all synced and manual bookings render complete manifests without blank chips.
- **Design & Dark Mode Consistency (`ScheduleView.tsx`)**:
  - Replaced hardcoded white backgrounds with dark mode responsive classes (`dark:bg-[#0e0e12]`, `dark:border-zinc-800`, `dark:text-zinc-100`).
  - Applied neon status badge accents (emerald for confirmed, blue for in-progress, rose for cancelled).

## [0.3.0] - 2026-09-12
### Dedicated Page Route Architecture & 1-Tap Studio Booking Synchronization
- **URL Route Architecture Separation (`App.tsx`, `DashboardLayout.tsx`, `package.json`)**:
  - Replaced single-page in-place state swapping on `/` with standard, declarative routing using `react-router-dom`.
  - Defined dedicated, bookmarkable URL routes:
    1. `/` : Public marketing landing page with live demo launch and session-aware quick console access.
    2. `/login` : Dedicated standalone authentication and client sign-in page with return-to-home link.
    3. `/auth` : Alias route automatically redirecting to `/login`.
    4. `/dashboard` : Protected Resource Management System console with automatic authentication guard (unauthenticated access automatically redirects to `/login`).
    5. `/dashboard/:tab` : Deep-linking and bookmarkable sub-routes for all operational views (`/dashboard/analytics`, `/dashboard/inventory`, `/dashboard/schedule`, `/dashboard/crew`, `/dashboard/payouts`).
  - Integrated browser history synchronization (`useNavigate`, `useParams`) so back/forward browser controls, refresh retention, and mobile navigation work seamlessly.
- **1-Tap Studio Booking Synchronization (`ScheduleView.tsx`, `api.ts`, `allocationsController.ts`, `allocations.ts`)**:
  - Implemented 1-tap client booking synchronization from the Studio platform (`studio.tbl_bookings`) directly into the ZManage Operations Timeline (`zmanage.allocations`).
  - Added discovery endpoint `GET /api/v1/allocations/sync-candidates` that retrieves confirmed studio bookings, normalizes package names, client contacts, event dates, and time windows, and evaluates duplicate status against existing active allocations.
  - Added batch import endpoint `POST /api/v1/allocations/batch-sync` that safely inserts selected bookings with collision awareness and audit reference metadata.
  - Added "1-Tap Sync" trigger button with `DownloadCloud` icon in the Operations Timeline header next to "Book Shoot".
  - Built comprehensive synchronization modal in `ScheduleView.tsx`:
    1. Discovery metrics showing total bookings found, ready to sync, and already imported into RMS.
    2. Select All and granular per-booking selection toggles.
    3. Visual cards detailing package name, client POC, telephone, event date, call times, and venue.
    4. High-contrast "Already Synced" status badges with checkmark indicators.
    5. Immediate timeline refresh and collision locks upon sync execution.

## [0.2.9] - 2026-09-12
### RMS Access Restriction Guard, Tab Cleanup & Typographic Polish
- **Dark Mode Switcher & Unified Theme Engine (`ThemeContext.tsx`, `ThemeToggle.tsx`, `index.css`, `tailwind.config.js`)**:
  - Implemented persistent theme system with class-based Dark Mode support (`darkMode: 'class'`).
  - Added `ThemeContext` tracking state (`light` / `dark`), synchronizing automatically with `localStorage` (`zmanage_theme`) and `<html class="dark">` with default fallback to system preference.
  - Mapped Tailwind core semantic colors (`canvas`, `paper`, `ash`, `charcoal`, `steel`, `fog`, `electric`) directly to CSS variables (`--color-canvas`, `--color-paper`, `--color-ash`, etc.), guaranteeing 100% theme coverage across all views (Executive Analytics, Products/Gear Vault, Timeline, Workforce Roster, and Ledger).
  - Resolved white surface mismatch where hardcoded background and border classes remained light in dark mode.
  - Created `ThemeToggle` component supporting both compact (icon toggle with Sun/Moon) and expanded (sidebar rail switch) modes.
  - Integrated theme toggle into:
    1. **Top Command Header** (`DashboardLayout.tsx`) next to the "Live Operations" status pill.
    2. **Sidebar Rail Footer** (`DashboardLayout.tsx`) above user profile and collapse trigger.
    3. **Landing Page Navigation** (`LandingPage.tsx`) for instant toggling before login.
  - Styled all core components for dark mode: Deep Obsidian backgrounds (`#09090b` / `#0e0e12`), zinc borders (`#27272a`), high-contrast text (`#f4f4f5`), dark input states, and glowing status badges (`dub-badge-mint`, `dub-badge-blue`, `dub-badge-tangerine`).
  - Fixed active filter pill contrast: configured active buttons (`All Transactions`, `Pending`, `Settled`, `All Items`, and category pills) to display dark text (`dark:text-zinc-950`) on light active pills (`dark:bg-zinc-100`) in dark mode so text is razor-sharp and easily legible.
- **Category / Group Selection & Creation Modal (`InventoryView.tsx`)**:
  - Replaced static text inputs for `Category / Group *` in both Add Product and Edit Product dialogs with an interactive selector modal.
  - Features real-time instant search across category names.
  - Dynamically lists existing workspace categories with live item count badges.
  - Provides a 12-preset quick-select catalog (Cameras, Lenses, Lighting, Audio & Mics, Drones & Aerial, Grip & Support, Laptops & Computing, Storage & Drives, Monitors & Displays, Power & Batteries, Tools & Rigging, Supplies & Consumables).
  - Built-in custom category creator allowing creation and immediate assignment on Enter key or button click.
  - Raised stacking context z-index to `z-[70]` to ensure the modal opens squarely on top of the parent Add/Edit dialog (`z-50`) without being obscured or trapped below it.
- **Natural Numeric Input Handling & Zero-Clearing Fix**:
  - Resolved input lock across all currency, cost, rate, and amount fields where backspacing a `0` was previously blocked or instantly reverted (`value === 0 ? '' : value`, and `onChange: e.target.value === '' ? 0 : Number(e.target.value)`).
  - Affected fields:
    1. **Estimated / Purchase Value (₹)** in Add & Edit Gear modals ([`InventoryView.tsx`](file:///c:/Users/vikas/OneDrive/Desktop/projects/zorvik-tech/ZManage-Web/src/components/views/InventoryView.tsx)).
    2. **Payout Amount (₹)** in Record Payout dialog ([`PayoutsView.tsx`](file:///c:/Users/vikas/OneDrive/Desktop/projects/zorvik-tech/ZManage-Web/src/components/views/PayoutsView.tsx)).
    3. **Day Rate (₹)** in Add & Edit Team Member modals and 1-Tap Onboarding ([`CrewView.tsx`](file:///c:/Users/vikas/OneDrive/Desktop/projects/zorvik-tech/ZManage-Web/src/components/views/CrewView.tsx)).
- **Role Dropdown & Contract Type Options in Workforce Console (`CrewView.tsx`)**:
  - Replaced free-form text input for member roles with an authoritative standardized role dropdown (`STANDARD_ROLES`: Lead Cinematographer, Camera Operator, Drone Pilot, Lighting Director / Gaffer, Sound Engineer, Video Editor, Colorist, Production Assistant, Grip / Rigging Tech, Photographer, Studio Manager, and Other / Custom).
  - Added custom role input fallback whenever "Other / Custom" is selected.
  - Enabled Contract / Worker Type selection across all workforce flows:
    1. **Add to Roster Modal**: Choice of `Freelance`, `Contractor`, or `In-House Staff`.
    2. **Edit Member Profile Modal**: Added dedicated Contract / Worker Type dropdown alongside Role dropdown.
    3. **1-Tap Team Onboarding Modal**: Added default Contract / Worker Type selector so batch-imported platform users can be onboarded directly as Contractors, Freelancers, or In-House Staff.
- **RMS Disabled Access Restriction Page (`RmsDisabledPage.tsx`, `DashboardLayout.tsx`)**:
  - Built dedicated `RmsDisabledPage` preventing unauthorized entry when a client or project does not have Resource Management System (RMS) enabled.
  - Features clear status messaging, "Return to Client Dashboard" action (`/dashboard`), and dynamic switcher for clients with other RMS-active workspaces.
  - Added pre-render operational access verification in `DashboardLayout.tsx` connecting to `GET /api/v1/auth/verify-access`.
- **Navigation Console Streamlining (`DashboardLayout.tsx`)**:
  - Removed "Mobile Crew Pass" and "Developer & Webhooks / Settings" tabs from the sidebar navigation and view router to safeguard client API secrets and focus exclusively on core operations (Analytics, Products/Gear, Timeline, Workforce, and Ledger).
- **Global Typographic Sanitization**:
  - Replaced all em dashes (`—`) and en dashes (`–`) with standard hyphens across the entire project (including `index.html`, `ScheduleView.tsx`, `InventoryView.tsx`, and `OperationsCalendar.tsx`).
- **Sidebar Structural & Visual Separation (`DashboardLayout.tsx`)**:
  - Transformed sidebar into a sticky, isolated navigation rail (`h-screen sticky top-0 self-start z-30 shadow-[1px_0_4px_-1px_rgba(0,0,0,0.04)]`) physically separated from the scrollable application page surface.
  - Made the page command header sticky with a blurred backdrop (`sticky top-0 z-20 bg-white/95 backdrop-blur-md`).
- **Internal Details & Database Jargon Sanitization**:
  - Removed all database and infrastructure jargon from user-facing UI: replaced "Multi-Tenant Engine" with "Live Operations", replaced "Live PostgreSQL Aggregation" with "Live Summary", and replaced "Atomic PostgreSQL locks" with "Zero-Collision Guard".
  - Updated workspace subtitle from "Multi-Tenant" to "Operations Workspace".
- **Build & Quality Assurance**:
  - Passed strict ESLint 9 validation with zero warnings and zero errors.
  - Verified full TypeScript production build (`tsc && vite build`).

## [0.2.8] - 2026-09-12
### Universal Multi-Tenant Expansion, Product Management & Executive Analytics
- **Dynamic Multi-Tenant Project Switching (`DashboardLayout.tsx`, `App.tsx`)**:
  - Direct workspace selector dropdown in sidebar header querying all RMS-enabled projects for the authenticated client via `GET /api/v1/auth/projects`.
  - Seamless in-app tenant switching without logout; dynamically propagates new active `projectId` across session storage and updates API client headers (`X-Tenant-ID`).
- **Universal Product & Gear Management (`InventoryView.tsx`)**:
  - Generalized product catalog to support items across any vertical (tech hardware, enterprise equipment, event gear, supplies, tools).
  - Dynamic category filters derived from active inventory items.
  - Added complete Edit Details modal for updating name, category, serial number, and condition (`excellent`, `good`, `fair`, `in_repair`).
  - Added Delete / Archive asset confirmation modal with live API soft-deletion support.
- **Crew & Workforce Management (`CrewView.tsx`)**:
  - Added manual "Add Team Member" modal allowing creation of custom staff/contractors with direct role, contact, and day rate configuration.
  - Added "Edit Member Details" modal for role and rate updates.
  - Added member archive/deletion with confirmation dialog.
- **Payouts & Financial Operations Ledger (`PayoutsView.tsx`)**:
  - Added manual "Record Payout / Expense" modal to log project payouts and contractor expenses.
  - Multi-method settlement modal supporting UPI, Bank Transfer, and Cash with mandatory UTR/reference number logging.
  - Filter ledger by status: All, Pending, and Settled.
- **Executive Operations Analytics (`AnalyticsView.tsx`)**:
  - Real-time KPI cards for Total Assets, Available Inventory, Active Team Members, and Pending Payouts.
  - Interactive resource utilization and workforce deployment gauges.
  - Dynamic inventory distribution by category with percentage breakdowns.
  - Quick-action shortcuts directly routing to inventory management, crew scheduling, and financial settlements.
- **Tooling & Linter Standardization**:
  - Configured ESLint 9 flat configuration (`eslint.config.js`) with `@eslint/js` and `typescript-eslint`.

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
