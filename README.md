# ZManage-Web

Multi-Tenant Internal Resource, Asset Inventory, Team Scheduling & Worker Payouts Frontend Portal (ZManage) for Zorvik Tech.

## Core Dashboards
- **Asset Vault**: Hardware gear inventory (cameras, lenses, drones, lighting rigs) with condition audits and check-out/check-in modals.
- **Operations Calendar & Timeline**: Shoot schedule with zero-collision double-booking prevention.
- **Crew Roster & 1-Tap Onboarding**: Crew directory with master select-all and individual exclusion checkboxes to import platform users.
- **Worker Payouts Ledger**: Compensation summary, earnings status (`pending`, `paid`), and bank UTR settlement records.
- **Mobile Crew Pass**: Smartphone pass for photographers on shoot location (Google Maps venue link, assigned camera kit, 1-tap arrival check-in).

## Local Development
```bash
npm install
npm run dev
```

Local URL: `http://localhost:3005`

## Production Deployment
- **Cloudflare Pages**: `wrangler pages deploy dist`
- **Vercel**: `vercel deploy`
