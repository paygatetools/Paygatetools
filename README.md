# PayGate.js

Minimal, frontend-only Solana pay-to-unlock script.  
No backend. No accounts. No subscriptions.

> Add a “Pay once → Unlock” gate to any website using Phantom + SOL.

---

## What Is This?

`paygate.js` is a tiny JavaScript module that lets you:
- charge a small SOL payment
- wait for confirmation
- unlock content on the page

Everything runs client-side.

Perfect for:
- paid pages
- premium content
- tools & demos
- one-time access (no subscriptions)

---

## How It Works

1. User clicks **Pay**
2. Phantom wallet opens
3. SOL is sent to your wallet
4. Transaction confirms
5. Content becomes visible

---

## Features

- ✅ Frontend-only (static sites)
- ✅ Phantom wallet support
- ✅ Solana mainnet / devnet
- ❌ Not a secure paywall (frontend unlock)

---

## Requirements

- Phantom wallet
- Static website (HTML/JS)
- No backend required

---

## Install

### 1. Include Solana Web3 (CDN)

```html
<script src="https://unpkg.com/@solana/web3.js@latest/lib/index.iife.min.js"></script>
