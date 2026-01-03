import { readFile } from "fs/promises";
import { gunzipSync } from "zlib";
import JSON5 from "json5";

const templateDir = process.env.TEMPLATE_DIR!;
if (!templateDir) {
  throw new Error("TEMPLATE_DIR environment variable is not set.");
}

export async function loadSaveFile(filePath: string): Promise<SaveFile> {
    // Read the file content as a buffer
    const buffer = await readFile(filePath);
    
    // Decompress the gzipped content
    const decompressed = gunzipSync(buffer);
    const content = decompressed.toString('utf8');
    
    try {
        const data: SaveFile = JSON5.parse(content);
        return data;
    } catch (e) {
        console.error(`Error parsing JSON from file ${filePath}:`, e);
        throw e;
    }
}

interface SaveFile {

}