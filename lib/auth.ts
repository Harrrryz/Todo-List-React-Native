import { setStorageItemAsync } from "@/hooks/useStorageState";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Event emitter for auth events
type AuthEventListener = () => void;
const authEventListeners: Set<AuthEventListener> = new Set();

export const authEvents = {
  subscribe: (listener: AuthEventListener) => {
    authEventListeners.add(listener);
    return () => authEventListeners.delete(listener);
  },
  emitTokenExpired: () => {
    authEventListeners.forEach((listener) => listener());
  },
};

/**
 * Decode a JWT token without verifying it
 * Returns the payload or null if invalid
 */
export function decodeJWT(
  token: string
): { exp?: number; [key: string]: unknown } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    // Handle base64url encoding
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

/**
 * Check if a JWT token is expired
 * Returns true if expired or invalid, false if still valid
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) {
    return true;
  }

  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    // If we can't decode or there's no expiration, assume it's valid
    // Let the server decide
    return false;
  }

  // exp is in seconds, Date.now() is in milliseconds
  const expirationTime = decoded.exp * 1000;
  const now = Date.now();

  // Add a small buffer (30 seconds) to account for clock skew
  const buffer = 30 * 1000;

  return now >= expirationTime - buffer;
}

/**
 * Get the current token from storage
 */
export async function getStoredToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return localStorage.getItem("session");
    } catch (e) {
      console.error("Local storage is unavailable:", e);
      return null;
    }
  }
  return await SecureStore.getItemAsync("session");
}

/**
 * Clear the stored token (for sign out)
 */
export async function clearStoredToken(): Promise<void> {
  await setStorageItemAsync("session", null);
}

/**
 * Check token validity and emit event if expired
 * Returns true if token is valid, false if expired
 */
export async function validateToken(): Promise<boolean> {
  const token = await getStoredToken();

  if (isTokenExpired(token)) {
    await clearStoredToken();
    authEvents.emitTokenExpired();
    return false;
  }

  return true;
}
