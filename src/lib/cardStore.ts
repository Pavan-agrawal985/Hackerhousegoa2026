import { promises as fs } from "fs";
import path from "path";

/**
 * Lightweight persistence for generated share cards.
 *
 * Why this exists: X (Twitter)'s tweet-intent URL can't attach a binary
 * image directly — the only way to make the tweet preview show the actual
 * generated graphic is to share a LINK whose page has an <meta og:image>
 * pointing at a real, publicly-fetchable image URL. So every "Share to X"
 * click first persists the rendered PNG here, then links to /s/[id],
 * which serves that image as its Open Graph image.
 *
 * Storage: an in-memory Map for hot reads, backed by a .cache directory on
 * disk so images survive a dev-server reload / serverless cold start on a
 * single persistent-disk deployment (e.g. a Node server, Railway, Render,
 * Fly.io). On fully ephemeral serverless platforms swap this for S3 / R2 /
 * Vercel Blob — the store interface below is intentionally tiny so that's
 * a drop-in change.
 */

const STORE_DIR = path.join(process.cwd(), ".cache", "cards");
const memory = new Map<string, Buffer>();

async function ensureDir() {
  await fs.mkdir(STORE_DIR, { recursive: true });
}

export async function saveCard(id: string, png: Buffer): Promise<void> {
  memory.set(id, png);
  try {
    await ensureDir();
    await fs.writeFile(path.join(STORE_DIR, `${id}.png`), png);
  } catch {
    // Filesystem may be read-only on some serverless hosts — memory cache
    // still works for the lifetime of that instance.
  }
}

export async function loadCard(id: string): Promise<Buffer | null> {
  const hit = memory.get(id);
  if (hit) return hit;
  try {
    const buf = await fs.readFile(path.join(STORE_DIR, `${id}.png`));
    memory.set(id, buf);
    return buf;
  } catch {
    return null;
  }
}
