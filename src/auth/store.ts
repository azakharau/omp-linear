/**
 * Credential storage for Linear connections.
 *
 * The file lives under the host agent directory (the caller picks the path) and
 * holds the user's only copy of their tokens. Three consequences shape this
 * module: a file we cannot parse is an error rather than something to
 * overwrite, every write is atomic, and every read-modify-write runs inside a
 * transaction that is exclusive both inside this process and across processes.
 */
import { readFileSync } from "node:fs";
import { chmod, mkdir, open, readFile, rename, stat, unlink, utimes, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { hostname } from "node:os";
import { randomBytes } from "node:crypto";

export type Actor = "user" | "app";

export type OAuthSecret = {
 accessToken: string;
 refreshToken: string | null;
 /** Epoch milliseconds; null when the token has no announced expiry. */
 expiresAt: number | null;
 scope: string | null;
};

export type Connection =
 | {
  id: string;
  kind: "oauth";
  label: string;
  actor: Actor;
  workspace: string | null;
  createdAt: string;
  secret: OAuthSecret;
 }
 | {
  id: string;
  kind: "api_key";
  label: string;
  actor: "user";
  workspace: string | null;
  createdAt: string;
  secret: { apiKey: string };
 };

export type ConnectionSummary = Omit<Connection, "secret">;

/**
 * The view of the store inside a transaction. Reads see the snapshot taken when
 * the transaction acquired the lock; writes are committed once, atomically,
 * when the transaction body resolves.
 */
export interface StoreTransaction {
 list(): ConnectionSummary[];
 get(id: string): Connection | undefined;
 upsert(connection: Connection): void;
 remove(id: string): boolean;
}

export interface CredentialStore {
 /** Lock-free read of the last committed file. */
 list(): ConnectionSummary[];
 /** Lock-free read of the last committed file. */
 get(id: string): Connection | undefined;
 upsert(connection: Connection): Promise<void>;
 remove(id: string): Promise<boolean>;
 /**
  * Runs `fn` with exclusive access. Anything that reads a connection and then
  * writes a derived one (token refresh) must use this, or two sessions will
  * rotate each other's tokens.
  */
 transaction<T>(fn: (tx: StoreTransaction) => T | Promise<T>): Promise<T>;
 filePath: string;
}

export interface CredentialStoreOptions {
 /** How long a transaction waits for the lock before giving up; default 15s. */
 lockTimeoutMs?: number;
}

const FILE_VERSION = 1;
/** The holder touches the lock this often, so a live lock is never stale. */
const HEARTBEAT_MS = 1_000;
/** A lock untouched for this long *may* be examined for a dead owner. */
const HEARTBEAT_STALE_MS = 5_000;
const DEFAULT_LOCK_TIMEOUT_MS = 15_000;
const LOCK_POLL_MS = 25;

/** Strips the secret branch so the result can be logged or returned to a model. */
export function summarize(connection: Connection): ConnectionSummary {
 const { secret: _secret, ...rest } = connection;
 return { ...rest };
}

function isErrnoCode(error: unknown, code: string): boolean {
 return typeof error === "object" && error !== null && "code" in error && error.code === code;
}

function delay(ms: number): Promise<void> {
 return new Promise(done => {
  const timer = setTimeout(done, ms);
  timer.unref?.();
 });
}

function validateConnection(value: unknown, index: number, filePath: string): Connection {
 const where = `${filePath} entry ${index}`;
 if (typeof value !== "object" || value === null) throw new Error(`${where} is not an object`);
 const row = value as Record<string, unknown>;
 for (const field of ["id", "label", "createdAt"]) {
  if (typeof row[field] !== "string" || row[field] === "") {
   throw new Error(`${where} has a missing or non-string "${field}"`);
  }
 }
 if (row.workspace !== null && typeof row.workspace !== "string") {
  throw new Error(`${where} has an invalid "workspace"`);
 }
 const secret = row.secret;
 if (typeof secret !== "object" || secret === null) throw new Error(`${where} has no "secret"`);
 const secretRow = secret as Record<string, unknown>;
 if (row.kind === "oauth") {
  if (row.actor !== "user" && row.actor !== "app") throw new Error(`${where} has an invalid "actor"`);
  if (typeof secretRow.accessToken !== "string") {
   throw new Error(`${where} has no secret.accessToken`);
  }
  if (secretRow.refreshToken !== null && typeof secretRow.refreshToken !== "string") {
   throw new Error(`${where} has an invalid secret.refreshToken`);
  }
  if (secretRow.expiresAt !== null && typeof secretRow.expiresAt !== "number") {
   throw new Error(`${where} has an invalid secret.expiresAt`);
  }
  if (secretRow.scope !== null && typeof secretRow.scope !== "string") {
   throw new Error(`${where} has an invalid secret.scope`);
  }
 } else if (row.kind === "api_key") {
  if (row.actor !== "user") throw new Error(`${where} must have actor "user"`);
  if (typeof secretRow.apiKey !== "string") throw new Error(`${where} has no secret.apiKey`);
 } else {
  throw new Error(`${where} has an unknown "kind": ${JSON.stringify(row.kind)}`);
 }
 // Every field above was checked; the shape now matches the union.
 return value as Connection;
}

function parseFile(raw: string, filePath: string): Connection[] {
 let parsed: unknown;
 try {
  parsed = JSON.parse(raw);
 } catch (error) {
  throw new Error(
   `credential store ${filePath} is not valid JSON and was left untouched: ${error instanceof Error ? error.message : String(error)}`,
  );
 }
 if (typeof parsed !== "object" || parsed === null || !("connections" in parsed)) {
  throw new Error(`credential store ${filePath} is malformed: missing "connections"`);
 }
 const connections = parsed.connections;
 if (!Array.isArray(connections)) {
  throw new Error(`credential store ${filePath} is malformed: "connections" is not an array`);
 }
 return connections.map((row, index) => validateConnection(row, index, filePath));
}

function readFileSyncSafe(filePath: string): Connection[] {
 try {
  return parseFile(readFileSync(filePath, "utf8"), filePath);
 } catch (error) {
  // Only "no file yet" means "no connections yet".
  if (isErrnoCode(error, "ENOENT")) return [];
  throw error;
 }
}

async function readFileAsync(filePath: string): Promise<Connection[]> {
 let raw: string;
 try {
  raw = await readFile(filePath, "utf8");
 } catch (error) {
  if (isErrnoCode(error, "ENOENT")) return [];
  throw error;
 }
 return parseFile(raw, filePath);
}

async function writeConnections(filePath: string, connections: Connection[]): Promise<void> {
 const temp = `${filePath}.tmp-${randomBytes(6).toString("hex")}`;
 try {
  await writeFile(temp, `${JSON.stringify({ version: FILE_VERSION, connections }, null, 2)}\n`, {
   mode: 0o600,
  });
  await rename(temp, filePath);
 } catch (error) {
  await unlink(temp).catch(() => { });
  throw error;
 }
 await chmod(filePath, 0o600);
}

interface LockRecord {
 pid: number;
 hostname: string;
 token: string;
 createdAt: string;
}

function isProcessAlive(pid: number): boolean {
 try {
  process.kill(pid, 0);
  return true;
 } catch (error) {
  // ESRCH is the only proof of death; EPERM means it exists under another user.
  return !isErrnoCode(error, "ESRCH");
 }
}

async function readLockRecord(lockPath: string): Promise<LockRecord | null> {
 try {
  const parsed: unknown = JSON.parse(await readFile(lockPath, "utf8"));
  if (
   typeof parsed === "object" &&
   parsed !== null &&
   typeof (parsed as LockRecord).pid === "number" &&
   typeof (parsed as LockRecord).hostname === "string" &&
   typeof (parsed as LockRecord).token === "string"
  ) {
   return parsed as LockRecord;
  }
  return null;
 } catch {
  return null;
 }
}

/**
 * Breaks a lock only on proof that its owner is gone: the heartbeat has stopped
 * *and* the recorded pid is on this host *and* that pid no longer exists.
 * A slow-but-alive holder keeps its lock however long its work takes.
 */
async function breakIfOwnerDead(lockPath: string): Promise<boolean> {
 let touchedAt: number;
 try {
  touchedAt = (await stat(lockPath)).mtimeMs;
 } catch {
  return false;
 }
 if (Date.now() - touchedAt <= HEARTBEAT_STALE_MS) return false;
 const record = await readLockRecord(lockPath);
 if (!record || record.hostname !== hostname()) return false;
 if (isProcessAlive(record.pid)) return false;
 await unlink(lockPath).catch(() => { });
 return true;
}

async function acquireLock(lockPath: string, timeoutMs: number): Promise<{ token: string; release(): Promise<void> }> {
 const token = randomBytes(12).toString("hex");
 const record: LockRecord = {
  pid: process.pid,
  hostname: hostname(),
  token,
  createdAt: new Date().toISOString(),
 };
 const deadline = Date.now() + timeoutMs;
 for (; ;) {
  try {
   const handle = await open(lockPath, "wx", 0o600);
   try {
    await handle.writeFile(JSON.stringify(record));
   } finally {
    await handle.close();
   }
   break;
  } catch (error) {
   if (!isErrnoCode(error, "EEXIST")) throw error;
  }
  if (await breakIfOwnerDead(lockPath)) continue;
  if (Date.now() >= deadline) {
   throw new Error(`timed out acquiring ${lockPath} after ${timeoutMs}ms`);
  }
  await delay(LOCK_POLL_MS);
 }

 // The heartbeat only touches mtime: the content stays immutable, so a waiter
 // can never read a half-rewritten lock record.
 const heartbeat = setInterval(() => {
  const now = new Date();
  void utimes(lockPath, now, now).catch(() => { });
 }, HEARTBEAT_MS);
 heartbeat.unref?.();

 return {
  token,
  async release() {
   clearInterval(heartbeat);
   // If our lock was broken and re-taken, the file is someone else's now.
   const current = await readLockRecord(lockPath);
   if (current && current.token !== token) return;
   await unlink(lockPath).catch(() => { });
  },
 };
}

/**
 * In-process serialization, keyed by absolute path: two store handles over the
 * same file share one queue, so they never fight over the lock file at all.
 */
const queues = new Map<string, Promise<unknown>>();

function enqueue<T>(key: string, fn: () => Promise<T>): Promise<T> {
 const previous = queues.get(key) ?? Promise.resolve();
 const settled = previous.then(fn, fn);
 // The queue tail must never reject, or every later transaction inherits it.
 queues.set(
  key,
  settled.then(
   () => undefined,
   () => undefined,
  ),
 );
 return settled;
}

export function createCredentialStore(filePath: string, options: CredentialStoreOptions = {}): CredentialStore {
 const absolute = resolve(filePath);
 const lockPath = `${absolute}.lock`;
 const lockTimeoutMs = options.lockTimeoutMs ?? DEFAULT_LOCK_TIMEOUT_MS;

 async function transaction<T>(fn: (tx: StoreTransaction) => T | Promise<T>): Promise<T> {
  return enqueue(absolute, async () => {
   await mkdir(dirname(absolute), { recursive: true, mode: 0o700 });
   const lock = await acquireLock(lockPath, lockTimeoutMs);
   try {
    const connections = await readFileAsync(absolute);
    let dirty = false;
    const tx: StoreTransaction = {
     list: () => connections.map(summarize),
     get: id => connections.find(connection => connection.id === id),
     upsert(connection) {
      const index = connections.findIndex(existing => existing.id === connection.id);
      if (index === -1) connections.push(connection);
      else connections[index] = connection;
      dirty = true;
     },
     remove(id) {
      const index = connections.findIndex(connection => connection.id === id);
      if (index === -1) return false;
      connections.splice(index, 1);
      dirty = true;
      return true;
     },
    };
    const result = await fn(tx);
    // A failed body never commits: the throw skips this line.
    if (dirty) await writeConnections(absolute, connections);
    return result;
   } finally {
    await lock.release();
   }
  });
 }

 return {
  filePath,
  list: () => readFileSyncSafe(absolute).map(summarize),
  get: id => readFileSyncSafe(absolute).find(connection => connection.id === id),
  upsert: connection => transaction(tx => tx.upsert(connection)),
  remove: id => transaction(tx => tx.remove(id)),
  transaction,
 };
}

export function authHeadersFor(connection: Connection): Record<string, string> {
 return connection.kind === "oauth"
  ? { authorization: `Bearer ${connection.secret.accessToken}` }
  : { authorization: connection.secret.apiKey };
}
