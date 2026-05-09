# CLAUDE.md — Cofecito
## Arquitectura completa del producto para desarrollo

> **Cofecito** es una plataforma Web3 híbrida que combina food trucks de café de especialidad
> con trazabilidad blockchain, NFTs coleccionables, bitácora sensorial con voz (ElevenLabs)
> y rampa de pago fiat → cripto. Red base: **Solana** (mainnet-beta).

---

## 1. Visión del producto

```
FINCA boliviana
    └── lote de café registrado en blockchain
            └── TRUCK Cofecito (ciudad)
                    └── barista prepara la taza
                            └── QR único impreso en el vaso
                                    └── usuario escanea con App Cofecito
                                            └── ElevenLabs pregunta: "¿Qué sentiste?"
                                                    └── respuesta → NFT único en wallet
                                                            └── productor recibe feedback
```

---

## 2. Actores del sistema

| Actor | Descripción | Portal |
|-------|-------------|--------|
| **Super Admin** | Equipo Cofecito. Gestiona fincas, lotes, trucks, usuarios | Portal Admin Web |
| **Productor / Finca** | Registra datos del café: finca, variedad, proceso, altitud, GPS | Portal Productor Web |
| **Barista** | Opera el truck, registra parámetros de preparación, genera QR | App Barista (móvil) |
| **Consumidor** | Escanea QR, canjea NFT, completa bitácora con voz, colecciona | App Cofecito (móvil) |
| **Visitante** | Verifica trazabilidad pública de cualquier lote por QR o código | Portal Público Web |

---

## 3. Las 4 aplicaciones del ecosistema

### 3.1 App Cofecito — Consumidor (React Native + Expo)
**Propósito:** Experiencia completa del usuario final.

**Pantallas principales:**
```
/home              → feed de cafés disponibles en trucks cercanos
/scan              → lector QR de cámara nativa (expo-barcode-scanner)
/coffee/:id        → detalle del café: trazabilidad completa antes de mintear
/mint              → flujo de canje del NFT (confirmación → mint → wallet)
/bitacora/:nftId   → bitácora sensorial del NFT: voz (ElevenLabs) + notas + fotos
/collection        → galería de NFTs del usuario (todos sus cafés)
/ramp              → rampa fiat → cripto (Transak o MoonPay widget)
/profile           → wallet, historial, ajustes
```

**Flujo crítico: Escaneo → Mint → Bitácora**
```
1. Usuario abre /scan
2. Escanea QR del vaso → App llama a GET /api/cups/:qrCode
3. API retorna datos del café (lote, finca, barista, parámetros)
4. App muestra /coffee/:id con trazabilidad completa
5. Usuario toca "Reclamar mi NFT"
6. Backend firma y envía tx: programa QRRedeem valida QR no usado
7. Programa CofacitoNFT mintea NFT (Metaplex) → llega a wallet del usuario
8. App abre /bitacora/:nftId
9. ElevenLabs Conversational AI pregunta: "¿Qué aromas encontraste?"
10. Usuario responde con voz → transcripción → notas sensoriales
11. Usuario sube foto de su taza
12. Metadatos actualizados en IPFS → NFT metadata actualizada on-chain
```

**Dependencias npm:**
```json
{
  "expo": "~51.0.0",
  "expo-camera": "~15.0.0",
  "expo-barcode-scanner": "~13.0.0",
  "expo-image-picker": "~15.0.0",
  "expo-av": "~14.0.0",
  "expo-secure-store": "~13.0.0",
  "expo-notifications": "~0.28.0",
  "@privy-io/expo": "latest",
  "@solana/web3.js": "^1.95.0",
  "@coral-xyz/anchor": "^0.30.0",
  "@metaplex-foundation/mpl-token-metadata": "^3.0.0",
  "@metaplex-foundation/umi": "^0.9.0",
  "@metaplex-foundation/umi-bundle-defaults": "^0.9.0",
  "@elevenlabs/react": "latest",
  "react-native-qrcode-svg": "^6.3.0",
  "@tanstack/react-query": "^5.0.0",
  "zustand": "^4.5.0"
}
```

---

### 3.2 App Barista — Terminal del Truck (React Native + Expo, rol especial)
**Propósito:** El barista opera el truck y genera el QR por cada taza servida.

**Pantallas:**
```
/login             → autenticación con credenciales del truck
/menu              → menú activo del truck (lotes disponibles con stock)
/prepare           → selección del café a preparar
/parameters        → registro de parámetros de preparación:
                     - Método: Espresso / V60 / Chemex / AeroPress / Moka / Cold Brew
                     - Temperatura del agua (°C)
                     - Tiempo de extracción (seg)
                     - Dosis de café (g)
                     - Ratio agua:café
                     - Observaciones del barista
/qr-generate       → genera QR único para la taza → imprimir / mostrar en pantalla
/history           → tazas servidas hoy por este truck
```

**Generación del QR:**
```
POST /api/cups/generate
Body: { lotId, truckId, baristaId, method, params }
Response: { qrCode: "CFT-2026-001234", qrImageUrl, expiresIn: "24h" }
```
El QR se imprime como sticker o se muestra en pantalla para que el usuario lo escanee.

---

### 3.3 Portal de Trazabilidad Pública (React + Vite)
**Propósito:** Cualquier persona puede verificar la cadena completa de un café sin login ni wallet.

**Rutas:**
```
/                  → landing con buscador de lotes
/lot/:lotId        → trazabilidad completa del lote:
                     - Finca: nombre, ubicación, altitud, GPS, foto
                     - Productor: nombre, foto, historia
                     - Variedad: nombre botánico, notas esperadas
                     - Cosecha: fecha, método, condiciones
                     - Proceso: tipo (natural/lavado/honey/anaeróbico), duración
                     - Secado: método, humedad final
                     - Cupping: score SCA, notas de cata, catador
                     - Tueste: perfil, fecha, tostador
                     - Arribo al truck: fecha, condiciones
                     → Verificar tx en Solana Explorer (link directo)
/scan              → QR scanner web (html5-qrcode) → redirige a /lot/:lotId
/nft/:mintAddress   → página pública del NFT (si el usuario lo comparte)
```

**Sin autenticación requerida.** Todos los datos vienen del backend público.

---

### 3.4 Panel Admin (React + Vite)
**Propósito:** Gestión interna del equipo Cofecito.

**Módulos:**
```
/admin/farms           → CRUD de fincas y productores
/admin/lots            → CRUD de lotes de café (con subida de docs a IPFS)
/admin/trucks          → CRUD de trucks, ubicaciones, baristas asignados
/admin/menus           → configurar qué lotes están activos en cada truck
/admin/nfts            → monitor de NFTs minteados, metadatos, wallets
/admin/feedback        → dashboard de feedback de consumidores por lote/finca
/admin/users           → gestión de roles (admin, barista, productor)
/admin/reports         → analytics: tazas/día, NFTs minteados, top fincas
```

---

## 4. Backend (Node.js + TypeScript)

### Stack
```
Runtime:        Node.js 20 LTS + TypeScript
Framework:      Fastify (mayor performance que Express)
ORM:            Prisma + PostgreSQL
Cache:          Redis (sesiones, QR anti-double-spend, rate limiting)
Auth:           JWT + SIWS (Sign-In With Solana via @solana/wallet-adapter)
Storage:        IPFS vía Pinata SDK (metadatos NFT, fotos, documentos)
Blockchain:     @solana/web3.js + @coral-xyz/anchor (interacción con programas)
NFT Standard:   Metaplex Token Metadata (mpl-token-metadata)
AI Voice:       ElevenLabs API (Conversational AI + Text-to-Speech)
File uploads:   Multer → Pinata
QR generation:  qrcode (npm) → PNG → sticker imprimible
Email:          Resend o SendGrid
```

### Módulos de la API REST

```
/api/auth
  POST /login                    → JWT para baristas/admin
  POST /siws/nonce               → nonce para Sign-In With Solana
  POST /siws/verify              → verifica firma ed25519 → JWT para consumidores

/api/farms                       → CRUD de fincas (admin)
/api/lots                        → CRUD de lotes + registro hash en blockchain
/api/trucks                      → CRUD de trucks
/api/menus                       → menú activo por truck

/api/cups
  POST /generate                 → genera QR único por taza (barista)
  GET  /:qrCode                  → valida QR y retorna datos del café
  POST /:qrCode/redeem           → marca QR como canjeado (idempotente)

/api/nfts
  GET  /user/:walletAddress      → NFTs de un usuario (consulta via Helius DAS API)
  GET  /:mintAddress             → metadatos de un NFT
  POST /:mintAddress/bitacora    → actualiza bitácora (notas, foto, voz)

/api/voice
  POST /session                  → crea sesión ElevenLabs para bitácora
  POST /transcribe               → recibe audio → transcripción → notas sensoriales

/api/trazabilidad
  GET  /lot/:lotId               → datos completos del lote (público)
  GET  /verify/:lotId            → hash on-chain vs datos off-chain

/api/ramp
  POST /session                  → crea sesión Transak/MoonPay para el usuario

/api/feedback
  GET  /farm/:farmId             → feedback agregado de una finca (productor)
  GET  /lot/:lotId               → feedback de un lote específico
```

### Esquema de base de datos (Prisma)

```prisma
model Farm {
  id          String   @id @default(cuid())
  name        String
  country     String   @default("Bolivia")
  region      String
  altitude    Int      // msnm
  lat         Float
  lng         Float
  producer    String
  story       String?
  photoIpfs   String?
  createdAt   DateTime @default(now())
  lots        Lot[]
}

model Lot {
  id              String   @id @default(cuid())
  farmId          String
  farm            Farm     @relation(fields: [farmId], references: [id])
  name            String
  variety         String   // Geisha, Bourbon, Typica, Caturra...
  process         ProcessType
  harvestDate     DateTime
  cuppingScore    Float?
  cuppingNotes    String?
  cupper          String?
  roastLevel      String?
  roastDate       DateTime?
  roaster         String?
  metadataIpfs    String?  // CID del JSON completo del lote
  blockchainHash  String?  // hash registrado en TraceabilityRegistry
  txSignature     String?  // signature de la transacción Solana
  active          Boolean  @default(true)
  createdAt       DateTime @default(now())
  cups            Cup[]
  menuItems       MenuItem[]
}

enum ProcessType {
  NATURAL
  WASHED
  HONEY
  ANAEROBIC
  CARBONIC_MACERATION
}

model Truck {
  id        String   @id @default(cuid())
  name      String
  location  String
  lat       Float
  lng       Float
  active    Boolean  @default(true)
  baristas  Barista[]
  cups      Cup[]
  menuItems MenuItem[]
}

model Barista {
  id       String  @id @default(cuid())
  name     String
  truckId  String
  truck    Truck   @relation(fields: [truckId], references: [id])
  cups     Cup[]
}

model MenuItem {
  id       String  @id @default(cuid())
  truckId  String
  truck    Truck   @relation(fields: [truckId], references: [id])
  lotId    String
  lot      Lot     @relation(fields: [lotId], references: [id])
  active   Boolean @default(true)
  price    Float   // en BOB
}

model Cup {
  id            String   @id @default(cuid())
  qrCode        String   @unique  // "CFT-2026-001234"
  lotId         String
  lot           Lot      @relation(fields: [lotId], references: [id])
  truckId       String
  truck         Truck    @relation(fields: [truckId], references: [id])
  baristaId     String
  barista       Barista  @relation(fields: [baristaId], references: [id])
  // Parámetros de preparación registrados por el barista
  method        String   // Espresso, V60, Chemex, AeroPress, Moka, ColdBrew, Sifón
  waterTemp     Float?   // °C
  extractionTime Int?    // segundos
  coffeeDose    Float?   // gramos
  waterRatio    Float?   // ratio agua:café
  baristaNotes  String?
  // Estado del canje
  redeemed      Boolean  @default(false)
  redeemedAt    DateTime?
  walletAddress String?  // Solana pubkey (base58)
  mintAddress   String?  // Mint address del NFT en Solana
  createdAt     DateTime @default(now())
  bitacora      Bitacora?
}

model Bitacora {
  id              String   @id @default(cuid())
  cupId           String   @unique
  cup             Cup      @relation(fields: [cupId], references: [id])
  mintAddress     String   // Mint address del NFT en Solana
  // Sección 01: Identificación (pre-cargada del lote)
  // Sección 02: Nivel de tueste (del lote)
  // Sección 03: Proceso (del lote)
  // Sección 04: Método de preparación (del barista)
  // Sección 05: Análisis sensorial (usuario)
  fragrancia      Int?     // 1-5
  aroma           Int?
  sabor           Int?
  saborResidual   Int?
  balance         Int?
  dulzor          Int?
  tazaLimpia      Int?
  acidez          Int?
  cuerpo          Int?
  preferencia     Int?
  scoreSCA        Float?   // /50 pts
  // Sección 06: Notas aromáticas (usuario, multi-select)
  notasFrutado    Boolean  @default(false)
  notasChocolate  Boolean  @default(false)
  notasFloral     Boolean  @default(false)
  notasCitrico    Boolean  @default(false)
  notasNuez       Boolean  @default(false)
  notasCaramelo   Boolean  @default(false)
  notasBerries    Boolean  @default(false)
  notasHerbal     Boolean  @default(false)
  notasEspeciado  Boolean  @default(false)
  notasAhumado    Boolean  @default(false)
  // Sección 07: Notas descriptivas libres (voz → texto via ElevenLabs)
  notasLibres     String?
  audioIpfs       String?  // CID del audio original
  // Sección 08: Foto de la taza
  photoIpfs       String?
  // Sección 09: Comentarios de cata
  comentarios     String?
  // Estado
  metadataIpfs    String?  // CID actualizado del NFT tras completar bitácora
  completedAt     DateTime?
  createdAt       DateTime @default(now())
}
```

---

## 5. Programas Solana (Anchor / Rust)

### Red: Solana (mainnet-beta)
**Razón:** Transacciones sub-segundo (~400ms finality), fees de mint ~$0.002, compresión de NFTs (cNFTs) disponible para escala masiva, ecosistema Metaplex maduro para NFTs, soporte nativo para wallets móviles (Phantom, Solflare), y creciente adopción en LatAm. Sin gas token bridging — todo usa SOL.

### Estructura del workspace Anchor

```
programs/
├── cofacito-nft/
│   └── src/lib.rs          → Programa de mint de NFTs (usa Metaplex CPI)
├── traceability-registry/
│   └── src/lib.rs          → Registro inmutable de hashes de lotes
└── qr-redeem/
    └── src/lib.rs          → Validación de QR y autorización de mint
```

### Programa 1: cofacito_nft (Mint de NFTs vía Metaplex)

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use anchor_spl::associated_token::AssociatedToken;
use mpl_token_metadata::instructions as mpl_ix;

declare_id!("CofeNFT111111111111111111111111111111111111");

#[program]
pub mod cofacito_nft {
    use super::*;

    /// Inicializa la colección Cofecito (se llama una sola vez).
    pub fn initialize_collection(
        ctx: Context<InitializeCollection>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        let collection = &mut ctx.accounts.collection_state;
        collection.authority = ctx.accounts.authority.key();
        collection.redeem_controller = ctx.accounts.redeem_controller.key();
        collection.collection_mint = ctx.accounts.collection_mint.key();
        collection.total_supply = 0;

        // CPI a Metaplex para crear el Collection NFT
        // (simplificado — en implementación real usar mpl_token_metadata CPI)
        msg!("Collection initialized: {}", name);
        Ok(())
    }

    /// Mintea un NFT por taza. Solo puede llamarlo el QR Redeem Controller.
    pub fn mint_nft(
        ctx: Context<MintNft>,
        qr_code: String,
        lot_id: String,
        metadata_uri: String, // ipfs://Qm.../metadata.json
        name: String,         // "Cofecito #4721"
    ) -> Result<()> {
        let collection = &mut ctx.accounts.collection_state;

        // Verificar que el caller es el redeem controller autorizado
        require!(
            ctx.accounts.redeem_authority.key() == collection.redeem_controller,
            CofacitoError::UnauthorizedMinter
        );

        collection.total_supply += 1;

        // Registrar en la PDA de QR → mint mapping
        let qr_record = &mut ctx.accounts.qr_record;
        qr_record.qr_code = qr_code.clone();
        qr_record.mint = ctx.accounts.nft_mint.key();
        qr_record.owner = ctx.accounts.user.key();
        qr_record.lot_id = lot_id;
        qr_record.timestamp = Clock::get()?.unix_timestamp;

        // CPI: Crear el NFT via Metaplex Token Metadata
        // 1. Mint un token SPL
        // 2. Crear Metadata account con name, symbol, uri
        // 3. Crear Master Edition (supply = 0, non-fungible)
        // 4. Verificar como parte de la colección

        msg!("NFT minted: {} for QR {}", name, qr_code);

        emit!(NftMinted {
            mint: ctx.accounts.nft_mint.key(),
            owner: ctx.accounts.user.key(),
            qr_code,
            collection: collection.collection_mint,
            supply_number: collection.total_supply,
        });

        Ok(())
    }

    /// El dueño del NFT actualiza la URI de metadatos (bitácora sensorial).
    pub fn update_bitacora(
        ctx: Context<UpdateBitacora>,
        new_uri: String,
    ) -> Result<()> {
        // Verificar que el caller es dueño del token
        require!(
            ctx.accounts.token_account.amount == 1,
            CofacitoError::NotTokenOwner
        );

        // CPI a Metaplex: update metadata URI
        // Solo el update_authority o el holder puede llamar esto
        // En nuestro diseño, el backend es update_authority y firma

        emit!(BitacoraUpdated {
            mint: ctx.accounts.nft_mint.key(),
            new_uri,
        });

        Ok(())
    }
}

// ── Cuentas ──────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct InitializeCollection<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + CollectionState::INIT_SPACE,
        seeds = [b"collection"],
        bump
    )]
    pub collection_state: Account<'info, CollectionState>,
    #[account(mut)]
    pub collection_mint: Signer<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Se setea como redeem controller autorizado
    pub redeem_controller: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(qr_code: String)]
pub struct MintNft<'info> {
    #[account(
        mut,
        seeds = [b"collection"],
        bump
    )]
    pub collection_state: Account<'info, CollectionState>,
    #[account(
        init,
        payer = payer,
        space = 8 + QrRecord::INIT_SPACE,
        seeds = [b"qr", qr_code.as_bytes()],
        bump
    )]
    pub qr_record: Account<'info, QrRecord>,
    #[account(mut)]
    pub nft_mint: Signer<'info>,
    /// CHECK: La wallet destino del NFT
    pub user: UncheckedAccount<'info>,
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = nft_mint,
        associated_token::authority = user
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    /// Debe ser el redeem_controller registrado en collection_state
    pub redeem_authority: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
    /// CHECK: Metaplex Token Metadata program
    pub token_metadata_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct UpdateBitacora<'info> {
    pub nft_mint: Account<'info, Mint>,
    #[account(
        constraint = token_account.mint == nft_mint.key(),
        constraint = token_account.owner == owner.key(),
        constraint = token_account.amount == 1
    )]
    pub token_account: Account<'info, TokenAccount>,
    pub owner: Signer<'info>,
    /// CHECK: Metadata account, validado via seeds en CPI
    #[account(mut)]
    pub metadata_account: UncheckedAccount<'info>,
    /// Autoridad de update de la colección (backend keypair)
    pub update_authority: Signer<'info>,
    /// CHECK: Metaplex Token Metadata program
    pub token_metadata_program: UncheckedAccount<'info>,
}

// ── State ────────────────────────────────────────────────────────

#[account]
#[derive(InitSpace)]
pub struct CollectionState {
    pub authority: Pubkey,          // 32
    pub redeem_controller: Pubkey,  // 32
    pub collection_mint: Pubkey,    // 32
    pub total_supply: u64,          // 8
}

#[account]
#[derive(InitSpace)]
pub struct QrRecord {
    #[max_len(32)]
    pub qr_code: String,    // 4 + 32
    pub mint: Pubkey,        // 32
    pub owner: Pubkey,       // 32
    #[max_len(32)]
    pub lot_id: String,      // 4 + 32
    pub timestamp: i64,      // 8
}

// ── Eventos ──────────────────────────────────────────────────────

#[event]
pub struct NftMinted {
    pub mint: Pubkey,
    pub owner: Pubkey,
    pub qr_code: String,
    pub collection: Pubkey,
    pub supply_number: u64,
}

#[event]
pub struct BitacoraUpdated {
    pub mint: Pubkey,
    pub new_uri: String,
}

// ── Errores ──────────────────────────────────────────────────────

#[error_code]
pub enum CofacitoError {
    #[msg("Only the authorized redeem controller can mint")]
    UnauthorizedMinter,
    #[msg("Caller does not own the token")]
    NotTokenOwner,
    #[msg("QR code has already been redeemed")]
    QrAlreadyRedeemed,
}
```

---

### Programa 2: traceability_registry

```rust
use anchor_lang::prelude::*;

declare_id!("TrazReg1111111111111111111111111111111111111");

#[program]
pub mod traceability_registry {
    use super::*;

    /// Registra o actualiza el hash de un lote de café.
    /// Solo puede llamarlo la autoridad del programa (backend Cofecito).
    pub fn register_lot(
        ctx: Context<RegisterLot>,
        lot_id: String,
        data_hash: [u8; 32], // SHA-256 del JSON del lote
        ipfs_cid: String,
    ) -> Result<()> {
        let record = &mut ctx.accounts.lot_record;
        record.lot_id = lot_id.clone();
        record.data_hash = data_hash;
        record.ipfs_cid = ipfs_cid.clone();
        record.timestamp = Clock::get()?.unix_timestamp;
        record.registered_by = ctx.accounts.authority.key();

        // Incrementar contador global
        let registry = &mut ctx.accounts.registry_state;
        if !record.initialized {
            registry.total_lots += 1;
            record.initialized = true;
        }

        emit!(LotRegistered {
            lot_id,
            data_hash,
            ipfs_cid,
            timestamp: record.timestamp,
        });

        Ok(())
    }

    /// Verifica que el hash proporcionado coincide con el registrado on-chain.
    /// View-only (no modifica estado pero Anchor requiere Context).
    pub fn verify_lot(
        ctx: Context<VerifyLot>,
        data_hash: [u8; 32],
    ) -> Result<bool> {
        let record = &ctx.accounts.lot_record;
        Ok(record.data_hash == data_hash)
    }
}

// ── Cuentas ──────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct InitializeRegistry<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + RegistryState::INIT_SPACE,
        seeds = [b"registry"],
        bump
    )]
    pub registry_state: Account<'info, RegistryState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(lot_id: String)]
pub struct RegisterLot<'info> {
    #[account(
        mut,
        seeds = [b"registry"],
        bump
    )]
    pub registry_state: Account<'info, RegistryState>,
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + LotRecord::INIT_SPACE,
        seeds = [b"lot", lot_id.as_bytes()],
        bump
    )]
    pub lot_record: Account<'info, LotRecord>,
    #[account(
        mut,
        constraint = authority.key() == registry_state.authority @ TraceError::Unauthorized
    )]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(data_hash: [u8; 32])]
pub struct VerifyLot<'info> {
    pub lot_record: Account<'info, LotRecord>,
}

// ── State ────────────────────────────────────────────────────────

#[account]
#[derive(InitSpace)]
pub struct RegistryState {
    pub authority: Pubkey,   // 32
    pub total_lots: u64,     // 8
}

#[account]
#[derive(InitSpace)]
pub struct LotRecord {
    #[max_len(32)]
    pub lot_id: String,        // 4 + 32
    pub data_hash: [u8; 32],   // 32
    #[max_len(64)]
    pub ipfs_cid: String,      // 4 + 64
    pub timestamp: i64,        // 8
    pub registered_by: Pubkey, // 32
    pub initialized: bool,     // 1
}

// ── Eventos ──────────────────────────────────────────────────────

#[event]
pub struct LotRegistered {
    pub lot_id: String,
    pub data_hash: [u8; 32],
    pub ipfs_cid: String,
    pub timestamp: i64,
}

// ── Errores ──────────────────────────────────────────────────────

#[error_code]
pub enum TraceError {
    #[msg("Only the registry authority can register lots")]
    Unauthorized,
}
```

---

### Programa 3: qr_redeem

```rust
use anchor_lang::prelude::*;
use cofacito_nft::cpi::accounts::MintNft as CpiMintNft;
use cofacito_nft::program::CofacitoNft;

declare_id!("QRRedeem111111111111111111111111111111111111");

#[program]
pub mod qr_redeem {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let state = &mut ctx.accounts.redeem_state;
        state.authority = ctx.accounts.authority.key();
        state.total_redeemed = 0;
        Ok(())
    }

    /// Valida el QR y ejecuta CPI al programa cofacito_nft para mintear.
    /// El backend firma la tx, verificando off-chain que el QR es válido.
    pub fn redeem(
        ctx: Context<Redeem>,
        qr_code: String,
        lot_id: String,
        metadata_uri: String,
        name: String,
    ) -> Result<()> {
        let state = &mut ctx.accounts.redeem_state;

        // La PDA [b"qr", qr_code] en cofacito_nft garantiza unicidad:
        // si el QR ya fue usado, init fallará con "already in use"

        // CPI a cofacito_nft::mint_nft
        let cpi_program = ctx.accounts.cofacito_program.to_account_info();
        let cpi_accounts = CpiMintNft {
            collection_state: ctx.accounts.collection_state.to_account_info(),
            qr_record: ctx.accounts.qr_record.to_account_info(),
            nft_mint: ctx.accounts.nft_mint.to_account_info(),
            user: ctx.accounts.user.to_account_info(),
            user_token_account: ctx.accounts.user_token_account.to_account_info(),
            redeem_authority: ctx.accounts.redeem_authority.to_account_info(),
            payer: ctx.accounts.payer.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
            associated_token_program: ctx.accounts.associated_token_program.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
            token_metadata_program: ctx.accounts.token_metadata_program.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        cofacito_nft::cpi::mint_nft(cpi_ctx, qr_code.clone(), lot_id, metadata_uri, name)?;

        state.total_redeemed += 1;

        emit!(QrRedeemed {
            qr_code,
            user: ctx.accounts.user.key(),
            mint: ctx.accounts.nft_mint.key(),
        });

        Ok(())
    }
}

// ── Cuentas ──────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + RedeemState::INIT_SPACE,
        seeds = [b"redeem"],
        bump
    )]
    pub redeem_state: Account<'info, RedeemState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(qr_code: String)]
pub struct Redeem<'info> {
    #[account(
        mut,
        seeds = [b"redeem"],
        bump
    )]
    pub redeem_state: Account<'info, RedeemState>,
    /// Las siguientes cuentas se pasan como CPI a cofacito_nft
    /// CHECK: Validado en CPI
    #[account(mut)]
    pub collection_state: UncheckedAccount<'info>,
    /// CHECK: PDA inicializada en CPI
    #[account(mut)]
    pub qr_record: UncheckedAccount<'info>,
    #[account(mut)]
    pub nft_mint: Signer<'info>,
    /// CHECK: wallet destino
    pub user: UncheckedAccount<'info>,
    /// CHECK: ATA creada en CPI
    #[account(mut)]
    pub user_token_account: UncheckedAccount<'info>,
    /// Autoridad del redeem controller (backend keypair)
    pub redeem_authority: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub cofacito_program: Program<'info, CofacitoNft>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, anchor_spl::token::Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
    /// CHECK: Metaplex Token Metadata program
    pub token_metadata_program: UncheckedAccount<'info>,
}

// ── State ────────────────────────────────────────────────────────

#[account]
#[derive(InitSpace)]
pub struct RedeemState {
    pub authority: Pubkey,      // 32
    pub total_redeemed: u64,    // 8
}

// ── Eventos ──────────────────────────────────────────────────────

#[event]
pub struct QrRedeemed {
    pub qr_code: String,
    pub user: Pubkey,
    pub mint: Pubkey,
}
```

---

## 6. Integración ElevenLabs (Bitácora de Voz)

### Flujo de la bitácora sensorial con voz

```
1. App abre sesión ElevenLabs Conversational AI
2. ElevenLabs saluda: "Hola! Cuéntame, ¿qué aromas encontraste en tu café?"
3. Usuario habla → ElevenLabs transcribe en tiempo real
4. ElevenLabs guía por las secciones:
   - "¿Cómo describirías el sabor? ¿Frutal, chocolateado, floral?"
   - "¿Cómo fue la acidez? ¿Suave, brillante, intensa?"
   - "¿Qué puntuación le darías del 1 al 5?"
5. Transcripción completa → backend → parsea a campos del modelo Bitacora
6. Audio guardado en IPFS como respaldo
7. Metadatos del NFT actualizados con la bitácora completa
```

### Variables de entorno requeridas
```env
ELEVENLABS_API_KEY=xi_...
ELEVENLABS_AGENT_ID=...   # Agente entrenado para cata de café
ELEVENLABS_VOICE_ID=...   # Voz del asistente (española, cálida)
```

### Ejemplo de llamada al agente
```typescript
// backend/src/services/elevenlabs.service.ts
import { ElevenLabsClient } from "elevenlabs";

const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

export async function createBitacoraSession(mintAddress: string, lotData: LotData) {
  const session = await client.conversationalAI.createSession({
    agentId: process.env.ELEVENLABS_AGENT_ID!,
    overrides: {
      agent: {
        prompt: {
          prompt: `Eres el asistente de cata de Cofecito. El usuario acaba de tomar un café 
                   ${lotData.variety} de la finca ${lotData.farmName} en ${lotData.region}, Bolivia.
                   Proceso: ${lotData.process}. Altitud: ${lotData.altitude}msnm.
                   Guíalo amablemente por la bitácora sensorial. Sé cálido, curioso y educativo.
                   Pregunta por: aromas, sabores, acidez, cuerpo, dulzor, experiencia general.`
        }
      }
    }
  });
  return session;
}

export async function transcribeAndParse(audioBlob: Buffer): Promise<BitacoraFields> {
  const transcription = await client.speechToText.convert({
    audio: audioBlob,
    model_id: "scribe_v1",
    language_code: "es"
  });
  return parseTranscriptionToFields(transcription.text);
}
```

---

## 7. Metadatos del NFT (estructura IPFS — Metaplex Standard)

```json
{
  "name": "Cofecito #4721",
  "symbol": "CFT",
  "description": "Bitácora sensorial de una taza de café Geisha de Finca Los Cedros, Bolivia",
  "image": "ipfs://QmXxx.../cofecito-4721.png",
  "external_url": "https://cofecito.app/nft/CofeNFTmintAddress...",
  "seller_fee_basis_points": 0,
  "attributes": [
    { "trait_type": "Finca",          "value": "Los Cedros" },
    { "trait_type": "Región",         "value": "Yungas, Bolivia" },
    { "trait_type": "Altitud",        "value": "1850 msnm" },
    { "trait_type": "Productor",      "value": "Juan Mamani" },
    { "trait_type": "Variedad",       "value": "Geisha" },
    { "trait_type": "Proceso",        "value": "Lavado" },
    { "trait_type": "Nivel de Tueste","value": "Medio-Claro" },
    { "trait_type": "Método",         "value": "V60" },
    { "trait_type": "Temperatura",    "value": "93°C" },
    { "trait_type": "Dosis",          "value": "15g" },
    { "trait_type": "Ratio",          "value": "1:15" },
    { "trait_type": "Truck",          "value": "Cofecito Centro SCZ" },
    { "trait_type": "Barista",        "value": "María García" },
    { "trait_type": "Score SCA",      "value": 42 },
    { "trait_type": "Fecha",          "value": "2026-06-15" },
    { "trait_type": "Notas Aromáticas","value": "Frutal, Floral, Cítrico" },
    { "trait_type": "Notas del Usuario","value": "Sentí jazmín y maracuyá, acidez brillante y final largo con chocolate blanco" }
  ],
  "properties": {
    "category": "image",
    "files": [
      { "uri": "ipfs://QmXxx.../cofecito-4721.png", "type": "image/png" }
    ],
    "creators": [
      { "address": "CofecitoBackendPubkey...", "share": 100 }
    ],
    "lot_id": "LOT-2026-001",
    "qr_code": "CFT-2026-001234",
    "blockchain_hash": "base58txSignature...",
    "bitacora_audio": "ipfs://QmYyy.../audio.mp3",
    "taza_photo": "ipfs://QmZzz.../photo.jpg",
    "trazabilidad_url": "https://cofecito.app/lot/LOT-2026-001",
    "solscan_url": "https://solscan.io/tx/base58sig..."
  },
  "collection": {
    "name": "Cofecito Collection",
    "family": "Cofecito"
  }
}
```

---

## 8. Stack de infraestructura

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND                                               │
│  App Móvil: React Native + Expo (iOS + Android)        │
│  Portal Web: React + Vite + TailwindCSS                │
│  Panel Admin: React + Vite + shadcn/ui                 │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS / REST
┌────────────────────▼────────────────────────────────────┐
│  BACKEND                                                │
│  Fastify + TypeScript (Node.js 20)                      │
│  PostgreSQL (via Prisma)                                │
│  Redis (cache + QR dedup)                               │
│  Pinata SDK (IPFS upload)                               │
│  ElevenLabs API (voz + transcripción)                   │
│  @solana/web3.js + @coral-xyz/anchor (programas)        │
│  @metaplex-foundation/umi (NFT operations)              │
└───────────┬─────────────────────┬───────────────────────┘
            │                     │
┌───────────▼──────┐   ┌──────────▼──────────────────────┐
│  BLOCKCHAIN       │   │  ALMACENAMIENTO DESCENTRALIZADO  │
│  Solana           │   │  IPFS vía Pinata                 │
│  (mainnet-beta)   │   │  - Metadatos NFT (JSON)          │
│                   │   │  - Fotos de fincas               │
│  Programas:       │   │  - Audios de bitácora            │
│  cofacito_nft     │   │  - Documentos de lotes           │
│  traceability_reg │   └──────────────────────────────────┘
│  qr_redeem        │
└───────────────────┘

HOSTING:
  Backend:   Railway (MVP) → AWS ECS (producción)
  Frontend:  Vercel (deploy automático desde Git)
  DB:        Railway PostgreSQL o Supabase
  CI/CD:     GitHub Actions
  Monitoring: Sentry
  Solana RPC: Helius (mainnet-beta / devnet) — DAS API para NFT indexing
```

---

## 9. Variables de entorno (.env)

```env
# Base de datos
DATABASE_URL="postgresql://user:pass@host:5432/cofecito"
REDIS_URL="redis://localhost:6379"

# Auth
JWT_SECRET="..."
BACKEND_WALLET_KEYPAIR="[...64 bytes...]"  # Keypair JSON del backend (firmar txs)

# Solana
SOLANA_RPC_URL="https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}"
SOLANA_DEVNET_RPC_URL="https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}"
HELIUS_API_KEY="..."
SOLANA_CLUSTER="mainnet-beta"  # "devnet" para testing

# Programas (deployados)
COFACITO_NFT_PROGRAM_ID="CofeNFT111111111111111111111111111111111111"
TRACEABILITY_REGISTRY_PROGRAM_ID="TrazReg1111111111111111111111111111111111111"
QR_REDEEM_PROGRAM_ID="QRRedeem111111111111111111111111111111111111"
COLLECTION_MINT="..."  # Pubkey del Collection NFT

# IPFS
PINATA_API_KEY="..."
PINATA_SECRET_KEY="..."
PINATA_GATEWAY="https://gateway.pinata.cloud/ipfs/"

# ElevenLabs
ELEVENLABS_API_KEY="xi_..."
ELEVENLABS_AGENT_ID="..."
ELEVENLABS_VOICE_ID="..."

# Rampa de pago
TRANSAK_API_KEY="..."
TRANSAK_ENV="staging"  # → "production"

# Wallet usuario (Privy — con soporte Solana)
NEXT_PUBLIC_PRIVY_APP_ID="..."

# App
APP_URL="https://cofecito.app"
API_URL="https://api.cofecito.app"
```

---

## 10. Identidad visual (para componentes UI)

```css
/* Paleta de colores Cofecito */
--color-brown-dark:   #4A2C0A;
--color-brown-mid:    #8B5E3C;
--color-brown-light:  #F5ECD7;
--color-gold:         #C8961A;
--color-gold-light:   #E8B84B;
--color-cream:        #F5ECD7;
--color-bg-dark:      #0D0905;
--color-white:        #FFFFFF;

/* Logo: corazón con taza de café integrada */
/* Tipografía: bold sans-serif para marca, regular para cuerpo */
/* Tazas: kraft paper con logo marrón + sticker "Reclama tu NFT" + QR */
/* Trucks: café marrón con logo crema, equipados con máquina de espresso */
```

---

## 11. Roadmap de desarrollo (6 fases)

| Fase | Duración | Entregables |
|------|----------|-------------|
| **F0 — Fundamentos** | 2 sem | Setup Anchor workspace, diseño programas, definición metadatos NFT (Metaplex standard), setup Helius |
| **F1 — Programas Devnet** | 6 sem | cofacito_nft + traceability_registry + qr_redeem en Solana devnet. Tests Anchor 100%. |
| **F2 — Backend API** | 6 sem | API REST completa, integración IPFS, integración ElevenLabs, generación de QR, @solana/web3.js |
| **F3 — Frontend Web** | 5 sem | Portal trazabilidad público + Panel Admin + integración Solana wallet-adapter |
| **F4 — App Móvil** | 6 sem | App consumidor (QR, mint, bitácora, galería, rampa) + App barista |
| **F5 — MVP + Mainnet** | 7 sem | QA completo, auditoría programas (Sec3/OtterSec), piloto 2 trucks SCZ, deploy mainnet-beta |

**Total estimado: 32 semanas**

---

## 12. Comandos de inicio para desarrolladores

```bash
# Clonar y setup inicial
git clone https://github.com/cofecito/app
cd app

# Programas Solana (Anchor)
cd programs
anchor build
anchor test                  # tests en localnet
anchor deploy --provider.cluster devnet  # deploy a devnet
# Verificar en Solana Explorer: https://explorer.solana.com/?cluster=devnet

# Backend
cd ../backend
npm install
cp .env.example .env   # configurar variables
npx prisma generate
npx prisma migrate dev
npm run dev            # http://localhost:3001

# Frontend Web (portal + admin)
cd ../web
npm install
npm run dev            # http://localhost:3000

# App Móvil
cd ../mobile
npm install
npx expo start         # escanear QR con Expo Go
```

---


