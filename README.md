# Trafficker

Autonomous Meta Ads management system. Users fill in a brief, select a Playbook, and the system generates creatives, launches campaigns, kills underperformers, auto-scales winners, controls spend, and reports daily via email.

Built for small budgets (<500 EUR/month per campaign).

## Architecture

- **Web App:** Next.js + Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** NextAuth.js
- **Meta Ads:** Marketing API v21.0
- **Budget Control:** Central Vault module — all spend goes through authorization
- **Reports:** Daily email summaries

## Subsystems

1. **Auth & User Management** — NextAuth.js with role-based access
2. **Campaign Brief** — Form wizard for campaign creation
3. **Playbook Engine** — Predefined strategies (e.g. Launch, Scale, Retarget)
4. **Creative Factory** — AI-generated ad copy and visual briefs
5. **Meta Launcher** — Campaign deployment to Meta Ads API
6. **Budget Guardian** — Central spend control and emergency brake
7. **Auto-Scaler** — 6-hourly deterministic budget/bid adjustments
8. **Creative Refresh** — Weekly creative rotation
9. **Daily Reports** — Email performance summaries

## Development

```bash
npm install
npm run dev
```

## Team

See [AGENTS.md](AGENTS.md) for the full team roster and responsibilities.
