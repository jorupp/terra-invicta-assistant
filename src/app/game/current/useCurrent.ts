"use client";

import { useEffect, useState } from "react";

export function useCurrent() {
  const [latestFilename, setLatestFilename] = useState<string | null>(null);

  useEffect(() => {
    const eventSource = new EventSource("/api/game/current");

    eventSource.onmessage = (event) => {
      const { filename } = JSON.parse(event.data);
      setLatestFilename(filename);
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return latestFilename;
}
