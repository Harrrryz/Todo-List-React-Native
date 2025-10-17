# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `bun start` - Start the Expo development server
- `bun run android` - Start on Android emulator
- `bun run ios` - Start on iOS simulator
- `bun run web` - Start web development server
- `bun run lint` - Run ESLint for code quality checks

### API Client Generation
- `bun run openapi-ts` - Generate TypeScript API client from OpenAPI schema
- The OpenAPI schema is expected at `http://127.0.0.1:8089/schema/openapi.json`
- Generated client files are located in the `client/` directory

### Deployment
- `bun run vercel` - Deploy to Vercel with production environment

## Architecture Overview

This is a React Native Expo application with file-based routing using expo-router. The app features user authentication, todo management, and AI chat functionality.

### Key Architectural Patterns

**Authentication Flow:**
- Uses JWT tokens stored in SecureStore (native) or localStorage (web)
- Session management handled through `components/ctx.tsx` context provider
- Email verification required for new user accounts
- Auth state determines routing between authenticated and unauthenticated flows

**API Integration:**
- Auto-generated TypeScript client from OpenAPI schema using @hey-api
- Client configured in root layout with base URL from environment variables
- Authentication token automatically added to API requests
- Error handling with custom auth error classes in context provider

**Navigation Structure:**
- File-based routing with expo-router
- Root layout (`app/_layout.tsx`) handles global providers and theme
- Authenticated app layout (`app/(app)/_layout.tsx`) protects routes requiring authentication
- Tab navigation for main app sections (home, calendar, account, ai-chat)

**UI Components:**
- Custom UI primitives using @rn-primitives for cross-platform compatibility
- NativeWind for Tailwind CSS styling with React Native
- Theme support with dark/light modes
- Reusable components in `components/ui/` directory

### Directory Structure

- `app/` - File-based routing with expo-router
  - `(app)/` - Authenticated routes wrapped in auth layout
  - `(tabs)/` - Bottom tab navigation screens
- `components/` - Reusable React components and UI primitives
- `client/` - Auto-generated API client from OpenAPI schema
- `lib/` - Utility functions, constants, and helpers
- `hooks/` - Custom React hooks for theme, storage, and state management

### Environment Configuration

- API base URL configured via `EXPO_PUBLIC_API_BASE_URL` environment variable
- Default fallback to production backend: `https://putian-ai-backend-litestar.onrender.com`
- Development backend expected at `http://127.0.0.1:8089`

### Styling System

Uses NativeWind for Tailwind CSS with React Native, with:
- Custom theme colors defined in CSS variables
- Dark mode support via system preferences
- Consistent design tokens across the app
- Platform-specific adjustments for hairline borders

### Key Features

- User authentication with email verification
- Password reset functionality
- Todo list management with filtering
- AI chat interface with streaming responses
- Calendar integration
- Responsive design across mobile, tablet, and web

## Development Notes

- The app requires a backend API server running for full functionality
- API client generation depends on accessible OpenAPI schema
- Authentication state persists across app restarts
- Email verification flow prevents unverified users from accessing protected routes
- This project uses Bun as the package manager instead of npm
- Use `bun install` for dependency installation and `bun run` for scripts