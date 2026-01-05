# GEMINI.md

This file provides context for the Qwen Code agent about the current project.

## Project Overview

This is a mobile application project built with **Expo** (React Native). Its core technologies include:

*   **Framework:** Expo (React Native)
*   **Language:** TypeScript
*   **Styling:** NativeWind (Tailwind CSS for React Native)
*   **Routing:** Expo Router (File-based routing)
*   **State Management:** React Context API (for session management)
*   **API Client:** Generated client using `@hey-api/openapi-ts` based on an OpenAPI spec.
*   **UI Components:** Custom components and primitives (e.g., `@rn-primitives`).

The application appears to be a todo list app with user authentication. The main entry point redirects users to either a sign-in screen or a home screen based on their session status.

## Project Structure

Key directories and files include:

*   `app/`: Contains the main application screens and routes, using Expo Router's file-based routing.
*   `components/`: Reusable UI components, including a `ctx.tsx` for session context and various UI primitives.
*   `client/`: Auto-generated API client code (likely from `openapi-ts`).
*   `assets/`: Images and other static assets (referenced in `app.json`).
*   `app.json`: Main Expo project configuration (name, slug, platforms, icons, etc.).
*   `package.json`: Project dependencies and scripts.
*   `tailwind.config.ts` & `global.css`: NativeWind/Tailwind CSS configuration.
*   `openapi-ts.config.ts`: Configuration for the OpenAPI client generator.

## Building and Running

Based on the `README.md` and `package.json`, the key commands are:

1.  **Install Dependencies:** `npm install`
2.  **Start Development Server:** `npx expo start`
    *   This will provide options to run on Android, iOS, Web, or Expo Go.
3.  **Run on Specific Platforms:**
    *   Android: `npm run android`
    *   iOS: `npm run ios`
    *   Web: `npm run web`
4.  **Linting:** `npm run lint`
5.  **Reset Project (moves starter code):** `npm run reset-project`
6.  **Generate API Client:** `npm run openapi-ts` (uses `openapi-ts.config.ts`)

## Development Conventions

*   **Routing:** Uses Expo Router with file-based routing inside the `app/` directory.
*   **Styling:** Uses NativeWind (Tailwind CSS) for styling components.
*   **Authentication:** Implements a simple authentication flow using React Context (`components/ctx.tsx`) and `expo-secure-store` for token persistence.
*   **API Integration:** Relies on a generated client from an OpenAPI specification.
*   **Type Safety:** TypeScript is used throughout the project for type safety.