# Tailored

> A virtual fitting room mobile app — try clothes on before you buy.

Built with Expo React Native, Tailored lets users virtually try on clothing and get personalized fit analysis based on their body measurements.

---

## Features

- **Virtual Try-On** — Use your device camera to see how clothes look on you
- **Body Profile Setup** — Enter your measurements for accurate fit predictions
- **Fit Analysis** — Detailed breakdown of how a garment fits your body
- **Discover** — Browse and save clothing items
- **Dark Luxury UI** — Near-black backgrounds, gold accents, smooth animations

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 53 + React Native 0.76 |
| Routing | Expo Router (file-based) |
| Styling | NativeWind (Tailwind v3) |
| State | Zustand + React Query |
| Animations | react-native-reanimated v3 |
| Fonts | Cormorant Garamond + DM Sans |
| Backend | Hono + Bun |
| Database | SQLite via Prisma |
| Auth | Better Auth |

---

## Project Structure

```
mobile/        — Expo React Native app (port 8081)
backend/       — Hono API server (port 3000)
```

---

## Screens

| Screen | Description |
|---|---|
| Onboarding | Welcome flow introducing the app |
| Body Profile | Capture measurements and body type |
| Home / Discover | Browse clothing items |
| Try On | Virtual try-on with camera |
| Fit Analysis | Garment fit breakdown |
| Profile | Account, saved items, preferences |

---

## Design

Dark luxury aesthetic inspired by high-end fashion apps. Touch-first with haptic feedback and high-impact animations.

- **Colors:** Near-black backgrounds, gold accents, cream typography
- **Fonts:** Cormorant Garamond + DM Sans
- **Motion:** react-native-reanimated v3 micro-interactions

---

## Getting Started

1. Clone the repo
   ```bash
   git clone https://github.com/NaaAyima/Tailored.git
   cd Tailored
   ```

2. Install dependencies
   ```bash
   cd mobile && bun install
   cd ../backend && bun install
   ```

3. Start the backend
   ```bash
   cd backend && bun dev
   ```

4. Start the mobile app
   ```bash
   cd mobile && bunx expo start
   ```

---

Built with [Vibecode](https://vibecode.dev)
