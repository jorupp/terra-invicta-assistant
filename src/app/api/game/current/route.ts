import { NextRequest } from "next/server";
import { watch } from "fs";
import { stat, readdir } from "fs/promises";
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

  // Helper method to send SSE message
  const sendFile = async (filename: string) => {
    await writer.write(encoder.encode(`data: ${JSON.stringify({ filename })}\n\n`));
  };

  // Track abort signal
  const abortController = new AbortController();

  request.signal.addEventListener("abort", () => {
    abortController.abort();
  });

  // Start watching in the background
  (async () => {
    // Send the last-modified file when the stream starts
    try {
      const files = await readdir(saveGameDir);
      let lastModifiedFile: string | null = null;
      let lastModifiedTime = 0;

      for (const file of files) {
        const fullPath = join(saveGameDir, file);
        try {
          const stats = await stat(fullPath);
          if (stats.isFile() && stats.mtimeMs > lastModifiedTime) {
            lastModifiedTime = stats.mtimeMs;
            lastModifiedFile = file;
          }
        } catch (error) {
          // Skip files we can't stat
        }
      }

      if (lastModifiedFile) {
        await sendFile(lastModifiedFile);
      }
    } catch (error) {
      // If we can't read the directory, just continue watching
    }

    const watcher = watch(saveGameDir, { signal: abortController.signal }, async (eventType, filename) => {
      if (!filename) return;

      // Only process 'rename' events (which includes file creation)
      if (eventType === "rename") {
        try {
          const fullPath = join(saveGameDir, filename);
          // wait a little bit to make sure the save is complete
          await new Promise((resolve) => setTimeout(resolve, 200));
          // Check if file exists (it's a creation, not deletion)
          const stats = await stat(fullPath);
          if (stats.isFile()) {
            await sendFile(filename);
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
