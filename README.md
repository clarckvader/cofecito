# Cofecito

A Web3 platform connecting Bolivian specialty coffee farms to consumers through blockchain traceability, NFT experiences, and AI-powered sensory logging.

```
Farm → Lot registered on-chain → Truck → Barista prepares cup
  → QR printed on cup → Consumer scans → ElevenLabs asks "What did you taste?"
    → Voice response → Unique NFT in wallet → Producer receives feedback
```

## Monorepo structure

```
voxis/
├── backend/          # Fastify + Prisma + Solana API (Node.js 20)
├── cofecito/         # Anchor programs on Solana (Rust)
└── dashboard/        # Admin portal (Next.js 16)
```

## Solana programs (`cofecito/`)

Three Anchor programs deployed on devnet:

| Program | ID | Purpose |
|---|---|---|
| `cofacito_nft` | `75upmoX4...` | Mints cup NFTs via Metaplex |
| `traceability_registry` | `DkfahgAG9...` | Immutable lot hash registry |
| `qr_redeem` | `8Va7rSi8s...` | QR validation + CPI mint |

```bash
cd cofecito
anchor build
anchor test
anchor deploy --provider.cluster devnet
```

After first deploy, bootstrap the collection (run once):

```bash
cd backend
npm run init-collection
# Copy COLLECTION_MINT from output → backend/.env
```

## Backend (`backend/`)

Fastify REST API with Prisma + PostgreSQL + Redis.

```bash
cd backend
npm install
cp .env.example .env      # fill in real values
docker run --name cofecito-db \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_DB=mydatabase \
  -p 5432:5432 -d postgres:16
npx prisma migrate dev --name init
npm run dev               # http://localhost:3001
```

### Key API routes

```
POST /api/auth/login              # Barista / admin login
POST /api/auth/siws/verify        # Consumer wallet sign-in (SIWS)
GET  /api/cups/:qrCode            # Scan QR → get cup + lot data
POST /api/cups/generate           # Barista creates cup + QR
POST /api/cups/:qrCode/redeem     # Consumer claims NFT
POST /api/nfts/:mintAddress/bitacora  # Save sensory log
GET  /api/trazabilidad/lot/:lotId  # Public traceability (no auth)
GET  /api/feedback/farm/:farmId   # Aggregated sensory feedback
```

## Dashboard (`dashboard/`)

Next.js 16 admin portal matching the Cofecito dark/gold design system.

```bash
cd dashboard
npm install
npm run dev               # http://localhost:3000
```

| Route | Screen |
|---|---|
| `/` | Super Admin Dashboard — stats, map, transit ledger |
| `/barista` | Barista Terminal — brew params + QR generator |
| `/lots` | Variety Registry — lot form + blockchain signing |

## Tech stack

| Layer | Technology |
|---|---|
| Blockchain | Solana (devnet → mainnet-beta) |
| Smart contracts | Anchor 1.x + Metaplex Token Metadata |
| NFT indexing | Helius DAS API |
| Backend | Fastify + TypeScript + Prisma + PostgreSQL |
| Cache / dedup | Redis |
| Storage | IPFS via Pinata |
| Voice AI | ElevenLabs Conversational AI |
| Payment ramp | Transak |
| Dashboard | Next.js 16 + Tailwind + shadcn/ui |

## Environment variables

Copy `backend/.env.example` to `backend/.env` and fill in:

- `DATABASE_URL` — PostgreSQL connection string
- `BACKEND_WALLET_KEYPAIR` — 64-byte keypair JSON array (`cat ~/.config/solana/id.json`)
- `SOLANA_RPC_URL` + `HELIUS_API_KEY` — Helius RPC endpoint
- `PINATA_API_KEY` + `PINATA_SECRET_KEY` — IPFS uploads
- `ELEVENLABS_API_KEY` + `ELEVENLABS_AGENT_ID` — voice bitácora
- `COLLECTION_MINT` — set after running `npm run init-collection`

## Development roadmap

| Phase | Status | Deliverable |
|---|---|---|
| F0 — Foundations | ✅ | Anchor workspace, schema, NFT metadata spec |
| F1 — Programs devnet | ✅ | 3 programs deployed, IDLs generated |
| F2 — Backend API | ✅ | Full REST API + IPFS + ElevenLabs |
| F3 — Dashboard | 🟡 In progress | Admin portal (3 screens) |
| F4 — Mobile app | ⬜ | Consumer + Barista apps (Expo) |
| F5 — Mainnet | ⬜ | Audit + pilot 2 trucks in Santa Cruz |
