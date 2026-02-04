"use client";

import { useEffect, useState } from "react";

/**
 * A reusable hook for syncing state with localStorage.
 * Multiple instances of this hook with the same key will stay in sync.
 * 
 * @param key - The localStorage key to use
 * @param initialValue - The initial value if nothing is stored
 * @returns A tuple of [value, setValue] similar to useState
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Load initial value from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
    }
  }, [key]);

  // Listen for changes to localStorage from other tabs/windows or same page
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage key "${key}":`, error);
        }
      }
    };

    // Custom event for same-page updates (StorageEvent only fires for other tabs)
    const handleCustomStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string; newValue: string }>;
      if (customEvent.detail.key === key) {
        try {
          setStoredValue(JSON.parse(customEvent.detail.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("localStorageChange", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("localStorageChange", handleCustomStorageChange);
    };
  }, [key]);

  // Return a wrapped version of setValue that persists to localStorage
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // Dispatch custom event for same-page synchronization
        window.dispatchEvent(
          new CustomEvent("localStorageChange", {
            detail: { key, newValue: JSON.stringify(valueToStore) },
          })
        );
      }
    } catch (error) {
      console.error(`Error saving localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
