# Tailored

A virtual fitting room mobile app built with Expo React Native.

## Overview

Tailored lets users virtually try on clothing and analyze fit quality before buying. The app guides users through body profile setup and provides personalized fit analysis based on their measurements.

## Screens

- **Onboarding** — Welcome flow introducing the app experience
- **Body Profile Setup** — Capture measurements and body type for accurate fit prediction
- **Home / Discover** — Browse and discover clothing items
- **Try On** — Virtual try-on using the device camera
- **Fit Analysis** — Detailed breakdown of how a garment fits
- **Profile** — User account, saved items, and preferences

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 53 + React Native 0.76 |
| Routing | Expo Router (file-based) |
| Styling | NativeWind (Tailwind v3) |
| State | Zustand (local) + React Query (server) |
| Animations | react-native-reanimated v3 |
| Fonts | Cormorant Garamond + DM Sans |
| Backend | Hono + Bun (port 3000) |

## Design

Dark luxury aesthetic: near-black backgrounds, gold accents, cream typography. Designed for touch-first interaction with high-impact animations and haptic feedback.

## Development

The app runs on port 8081. The backend API runs on port 3000.

```
mobile/   — Expo React Native app
backend/  — Hono API server
```
