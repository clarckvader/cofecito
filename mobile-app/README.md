# Cofecito — Mobile App

Flutter application that turns every cup of Bolivian specialty coffee into a Web3 experience. Each physical cup has a QR code that, when scanned, mints a unique NFT (ERC-721) on an Ethereum L2 network containing the full story of that cup.

---

## Roles

### Coffee Lover
The end consumer. Scans QR codes on cups, collects NFTs, rates their experience, and traces the origin of each coffee back to the farm.

### Barista
The coffee professional. Manages active coffee lots, monitors stock levels, and generates QR codes for each cup served.

---

## Modules

### Authentication
- **Splash Screen** — animated entry point
- **Role Selection** — choose between Coffee Lover and Barista before entering the app

### Coffee Lover Flow

| Module | Description |
|---|---|
| **My Collection** | Carousel of collectible NFT cards with rarity badges, cupping scores, and flavor tags. Includes a full experience history list. |
| **QR Scanner** | Simulated camera interface that detects a QR code and walks through the NFT minting process on Polygon step by step. |
| **Sensory Journal** | Interactive tasting sheet based on the SCA methodology — six attribute sliders (Fragrance, Aroma, Flavor, Body, Acidity, Sweetness), a live Radar Chart, an aromatic note selector, and a personal tasting note field. |
| **Traceability** | Vertical timeline showing the full journey of the coffee: Cultivation → Processing → Roasting → Brewing. Each verified step shows an on-chain badge with its transaction hash. |
| **Digital Vault** | Embedded wallet showing USD/BOB balance, wallet address, on-ramp modal with Bolivian payment methods (card, bank transfer, QR, Tigo Money), and transaction history. |

### Barista Flow

| Module | Description |
|---|---|
| **Dashboard** | Stats overview (cups served today, NFTs generated), active coffee lot cards with flavor tags, stock progress bars, and low-stock alerts. |
| **Generate QR** | Displays a scannable QR code for the active lot with a 5-minute countdown timer. The badge turns red under 60 seconds. Includes a regenerate button. |
| **Café / Stock / Profile** | Placeholder tabs — ready for service integration. |

---

## Stack

Flutter · Riverpod · go_router · fl_chart · Material 3 (dark theme)
