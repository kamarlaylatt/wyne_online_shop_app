# Wyne Online Shop — Admin App

## Architecture

Admin-only mobile app built with Expo Router + React Native Paper (MD3). Connects to a Bun/Elysia REST API with PostgreSQL.

## Key Conventions

- **Auth**: cookie/session-based via `better-auth` + `@better-auth/expo`. Session cached in `expo-secure-store`.
- **HTTP**: always use `@/services/http` (axios instance). Never import axios directly. All admin endpoints are under `/api/admin/*`.
- **Navigation**: Drawer + Bottom Tabs hybrid. Root Stack → Drawer → Tabs (plus stack screens for detail views).
- **Theme**: always use `theme.colors.*` from `useTheme()` (react-native-paper). Never hardcode colors.
- **Imports**: use `@/` alias for all project imports.

## Dependency Rule

```
components → contexts → services → types
```

## Domain

Admins manage: Suppliers, Purchase Items (inventory), Orders, Order Items, Customers.

## API

Base URL: `EXPO_PUBLIC_API_BASE_URL` env var (default `http://localhost:3000`).
All admin routes prefixed with `/api/admin`.

## Auth Notes

- `authClient.useSession()` — reactive session hook
- `authClient.signIn.email({ email, password })` — login
- `authClient.signOut()` — logout + clears SecureStore
- `authClient.getCookie()` — session cookie for manual injection (used in http interceptor)
- The API server must have `@better-auth/expo` installed, `expo()` plugin added, and `wyneonlineshopapp://` in `trustedOrigins`.
