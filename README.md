# LaundroFlow

Expo / React Native mobile app for the LaundroFlow laundry marketplace (customer, helper, owner, and superadmin roles).

## Prerequisites

- Node.js 18+
- npm
- [Expo CLI](https://docs.expo.dev/get-started/installation/) or `npx expo`

## Setup

1. Install dependencies:

```bash
npm install

```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Set values in `.env`:

- `EXPO_PUBLIC_API_URL` — backend base URL (no trailing `/api`)
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` — Google Maps API key for Android maps

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Run on Android |
| `npm run ios` | Run on iOS |
| `npm run web` | Run in browser |
| `npm test` | Run unit tests |
| `npm run lint` | Run ESLint |

## Project structure

```
src/
  api/           Axios client and API modules
  components/    Shared UI and ErrorBoundary
  navigation/    Role-based navigators
  screens/       App screens by role
  store/         Redux Toolkit slices
  theme/         Theming system
  utils/         Helpers and constants
```

## EAS builds

Production and preview builds read `EXPO_PUBLIC_API_URL` from `eas.json`. Local development uses `.env`.

```bash
npx eas build --profile preview --platform android
```

## Notes

- Customer registration uses the tenant code defined in `src/utils/constants.ts`.
- Auth state is persisted in AsyncStorage (`@token`, `@user`, `@cart`).
