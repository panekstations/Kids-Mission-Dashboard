# Kids Mission Dashboard

A kid-friendly daily mission board for families: morning routine, helper chores, reading, and math — with XP, streaks, allowance tracking, and parent admin tools.

Built for a home tablet or browser on your local network. **Not intended to be exposed to the public internet.**

## Features

- **Child dashboard** — four daily missions, progress ring, weather, XP/allowance/streak
- **Parent admin** — tap the title 5 times, enter PIN (default `1234`)
- **Configurable** — child name, timezone, weather ZIP, themes, weekly helper tasks, math level (K–5), night dim schedule
- **Persistent data** — saved to `data/dashboard.json` on the server
- **Backup / restore** — Admin → Backup

## Quick start (Docker — recommended)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose).

```bash
git clone https://github.com/YOUR_USERNAME/kids-mission-dashboard.git
cd kids-mission-dashboard
docker compose up -d --build
```

Open **http://localhost:4000** on the tablet or PC.

Data is stored in a Docker volume (`dashboard-data`). To reset: `docker compose down -v`.

## Install without Docker

Requires **Node.js 20+**.

```bash
git clone https://github.com/YOUR_USERNAME/kids-mission-dashboard.git
cd kids-mission-dashboard
npm install
npm run build
npm start
```

Open **http://localhost:4000**.

Progress is saved in `data/dashboard.json` (this file is gitignored — each family keeps their own).

### Development

Runs the API on port **4000** and Vite dev server on **3003**:

```bash
npm install
npm run dev
```

Open **http://localhost:3003**.

## First-time setup

1. Open the dashboard on your tablet (bookmark or “Add to Home Screen” for fullscreen).
2. Tap the **title 5 times** → enter parent PIN (**default: `1234`**).
3. Go to **Settings** and change:
   - Child's name
   - Parent PIN
   - Timezone & weather ZIP
   - Weekly helper tasks
   - Theme
4. **Save Settings**.

## Tablet tips

- Leave the tab open overnight if you use **auto night dim** or midnight mission rollover (the app checks every minute / 30 seconds).
- Use **Admin → Backup** to export JSON before major changes or updates.

## Security notes

- The parent PIN only locks the **UI**. The API has **no server-side authentication**.
- Run on a **trusted home network** only (Wi‑Fi your family controls).
- Do **not** port-forward this to the internet without adding proper auth and HTTPS.
- `data/dashboard.json` contains your child's name, birthday, PIN, and mission history — **never commit it to GitHub**.

## Project structure

| Path | Purpose |
|------|---------|
| `src/` | React frontend |
| `server/index.js` | Express API + static files in production |
| `data/dashboard.json` | Live family data (local only, gitignored) |
| `docker-compose.yml` | One-command install |

## License

MIT — see [LICENSE](LICENSE).
