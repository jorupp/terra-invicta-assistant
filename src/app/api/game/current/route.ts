import { NextRequest } from "next/server";
import { watch } from "fs";
import { stat } from "fs/promises";
import { join } from "path";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const saveGameDir = process.env.SAVE_GAME_DIR;

  if (!saveGameDir) {
    return new Response("SAVE_GAME_DIR environment variable not set", {
      status: 500,
    });
  }

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  // Track abort signal
  const abortController = new AbortController();

  request.signal.addEventListener("abort", () => {
    abortController.abort();
  });

  // Start watching in the background
  (async () => {
    const watcher = watch(saveGameDir, { signal: abortController.signal }, async (eventType, filename) => {
      if (!filename) return;

      // Only process 'rename' events (which includes file creation)
      if (eventType === "rename") {
        try {
          const fullPath = join(saveGameDir, filename);
          // Check if file exists (it's a creation, not deletion)
          const stats = await stat(fullPath);
          if (stats.isFile()) {
            // Send SSE formatted message
            await writer.write(encoder.encode(`data: ${JSON.stringify({ filename })}\n\n`));
          }
        } catch (error) {
          // File might have been deleted immediately, ignore
        }
      }
    });

    // Handle cleanup when connection closes
    abortController.signal.addEventListener("abort", () => {
      watcher.close();
      writer.close().catch(() => {});
    });
  })();

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
