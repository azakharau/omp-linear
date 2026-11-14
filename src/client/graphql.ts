/**
 * Minimal Linear GraphQL transport.
 *
 * Contract: exactly one HTTP request per `execute`, never a retry. Every result
 * carries an `outcome` so callers can tell "nothing left the process" from
 * "we sent it and do not know what happened", which is what makes a mutation
 * safe or unsafe to repeat.
 */

export interface GraphQLErrorEntry {
 message: string;
 /** Response path: field names (scrubbed like the message) and list indexes. */
 path?: (string | number)[];
}

export interface RateLimitSnapshot {
 /** `x-ratelimit-requests-remaining`, null when the header is absent or unparsable. */
 remaining: number | null;
 /** `x-ratelimit-requests-reset`, null when the header is absent or unparsable. */
 resetAt: number | null;
}

export type LinearResultKind =
 | "http"
 | "graphql"
 | "network"
 | "timeout"
 | "rate_limited"
 | "auth"
 | "aborted"
 | "too_large";

/**
 * - `not_sent`: no request left this process; retrying is always safe.
 * - `unknown`: the request was dispatched and the server's disposition is not
 *   knowable — a timeout, a dropped connection, a 5xx, a discarded oversized
 *   body, or a body we could not parse. A mutation in this state may already
 *   have been applied.
 * - `rejected`: the server answered with proof it did not apply the request:
 *   a 4xx (including 429) or a well-formed GraphQL error response.
 * - `completed`: a 2xx response was parsed. `ok: true` always carries this.
 */
export type LinearOutcome = "not_sent" | "unknown" | "rejected" | "completed";

export type LinearResult =
 | {
  ok: true;
  outcome: "completed";
  data: unknown;
  /** Non-null only when the server returned both `data` and `errors`. */
  partialErrors: GraphQLErrorEntry[] | null;
  rateLimit: RateLimitSnapshot;
 }
 | {
  ok: false;
  kind: LinearResultKind;
  outcome: LinearOutcome;
  status: number | null;
  message: string;
  errors: GraphQLErrorEntry[] | null;
  retryAfterMs: number | null;
 };

export interface LinearClientOptions {
 endpoint: string;
 getAuthHeaders: () => Promise<Record<string, string>>;
 fetchImpl?: typeof fetch;
 /** Request deadline, covering the response body as well; defaults to 30s. */
 timeoutMs?: number;
 headers?: Record<string, string>;
 /** Credential values to scrub from messages when building the auth headers itself fails. */
 knownSecrets?: () => string[];
 /**
  * Called when Linear answers HTTP 401, with the auth headers that request sent, so a cached
  * token can be dropped before the next call.
  */
 onAuthRejected?: (sentHeaders: Record<string, string>) => void;
}

export interface LinearExecuteOptions {
 signal?: AbortSignal;
 operationName?: string;
 /** Hard cap on the response body; defaults to 4 MiB. */
 maxResponseBytes?: number;
}

export interface LinearClient {
 execute(
  document: string,
  variables?: Record<string, unknown>,
  opts?: LinearExecuteOptions,
 ): Promise<LinearResult>;
}

const DEFAULT_MAX_RESPONSE_BYTES = 4 * 1024 * 1024;
/** Server and exception text is untrusted and may echo credentials; keep only a stub. */
const MAX_MESSAGE_CHARS = 200;
const TOKEN_PATTERN = /lin_(?:api|oauth)_[A-Za-z0-9_-]+/g;
const BEARER_PATTERN = /Bearer\s+[A-Za-z0-9._~+/=-]+/gi;

/** Reads a numeric response header; absent or non-numeric values collapse to null. */
function numericHeader(headers: Headers, name: string): number | null {
 const raw = headers.get(name);
 if (raw === null) return null;
 const value = Number(raw);
 return Number.isFinite(value) ? value : null;
}

/** `Retry-After` is either delta-seconds or an HTTP date (RFC 9110 §10.2.3). */
function readRetryAfterMs(headers: Headers): number | null {
 const raw = headers.get("retry-after");
 if (raw === null) return null;
 const seconds = Number(raw);
 if (Number.isFinite(seconds)) return Math.max(0, Math.round(seconds * 1000));
 const at = Date.parse(raw);
 return Number.isFinite(at) ? Math.max(0, at - Date.now()) : null;
}

/**
 * Removes anything credential-shaped from text that is about to be handed back
 * to a model or a log: the exact secrets we just sent, plus Linear token shapes.
 */
function redact(text: string, secrets: string[]): string {
 let cleaned = text;
 for (const secret of secrets) {
  if (secret.length >= 8) cleaned = cleaned.split(secret).join("[redacted]");
 }
 return cleaned.replace(TOKEN_PATTERN, "[redacted]").replace(BEARER_PATTERN, "Bearer [redacted]");
}

export function safeMessage(text: string, secrets: string[]): string {
 const cleaned = redact(text, secrets);
 return cleaned.length > MAX_MESSAGE_CHARS ? `${cleaned.slice(0, MAX_MESSAGE_CHARS)}…` : cleaned;
}

function readErrors(body: unknown, secrets: string[]): GraphQLErrorEntry[] | null {
 if (typeof body !== "object" || body === null || !("errors" in body)) return null;
 const raw = body.errors;
 if (!Array.isArray(raw) || raw.length === 0) return null;
 return raw.map(entry => {
  const isObject = typeof entry === "object" && entry !== null;
  const rawMessage = isObject && "message" in entry ? entry.message : undefined;
  const message = typeof rawMessage === "string" ? rawMessage : JSON.stringify(entry);
  const rawPath = isObject && "path" in entry ? entry.path : undefined;
  const safe = redact(message, secrets);
  if (!Array.isArray(rawPath)) return { message: safe };
  const path = rawPath.map(part => (typeof part === "number" ? part : redact(String(part), secrets)));
  return { message: safe, path };
 });
}

function firstMessage(errors: GraphQLErrorEntry[] | null, fallback: string): string {
 return errors && errors.length > 0 ? errors[0]!.message : fallback;
}

/**
 * Streams the body with a hard byte cap. A response larger than the cap is
 * cancelled mid-flight instead of being buffered, so a hostile or broken server
 * cannot exhaust memory.
 */
async function readBoundedBody(
 response: Response,
 limit: number,
): Promise<{ tooLarge: false; text: string } | { tooLarge: true; seen: number }> {
 const body = response.body;
 if (body === null) return { tooLarge: false, text: "" };
 const reader = body.getReader();
 const chunks: Uint8Array[] = [];
 let seen = 0;
 for (; ;) {
  const { done, value } = await reader.read();
  if (done) break;
  seen += value.byteLength;
  if (seen > limit) {
   await reader.cancel();
   return { tooLarge: true, seen };
  }
  chunks.push(value);
 }
 const joined = new Uint8Array(seen);
 let offset = 0;
 for (const chunk of chunks) {
  joined.set(chunk, offset);
  offset += chunk.byteLength;
 }
 return { tooLarge: false, text: new TextDecoder().decode(joined) };
}

export function createLinearClient(options: LinearClientOptions): LinearClient {
 const doFetch = options.fetchImpl ?? fetch;
 const timeoutMs = options.timeoutMs ?? 30_000;

 return {
  async execute(document, variables, opts) {
   const callerSignal = opts?.signal;
   if (callerSignal?.aborted) {
    return {
     ok: false,
     kind: "aborted",
     outcome: "not_sent",
     status: null,
     message: "request aborted by caller before it was sent",
     errors: null,
     retryAfterMs: null,
    };
   }

   // Collected so failure messages can be scrubbed of exactly what we sent.
   let secrets: string[] = [];
   let authHeaders: Record<string, string>;
   try {
    authHeaders = await options.getAuthHeaders();
    secrets = Object.values(authHeaders).flatMap(value => [
     value,
     ...value.split(/\s+/).filter(part => part.length >= 8),
    ]);
   } catch (error) {
    return {
     ok: false,
     kind: "auth",
     outcome: "not_sent",
     status: null,
     message: safeMessage(
      `could not build auth headers: ${error instanceof Error ? error.message : String(error)}`,
      options.knownSecrets?.() ?? [],
     ),
     errors: null,
     retryAfterMs: null,
    };
   }

   // The caller may have aborted while getAuthHeaders() was awaited. Returning
   // here means fetch() is never called, so the request provably never left.
   if (callerSignal?.aborted) {
    return {
     ok: false,
     kind: "aborted",
     outcome: "not_sent",
     status: null,
     message: "request aborted by caller before it was sent",
     errors: null,
     retryAfterMs: null,
    };
   }

   const controller = new AbortController();
   let timedOut = false;
   const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
   }, timeoutMs);
   const onCallerAbort = () => controller.abort();
   callerSignal?.addEventListener("abort", onCallerAbort, { once: true });

   const payload: Record<string, unknown> = { query: document };
   if (variables !== undefined) payload.variables = variables;
   if (opts?.operationName !== undefined) payload.operationName = opts.operationName;

   let response: Response;
   let body: { tooLarge: false; text: string } | { tooLarge: true; seen: number };
   try {
    response = await doFetch(options.endpoint, {
     method: "POST",
     headers: {
      "content-type": "application/json",
      accept: "application/json",
      ...options.headers,
      ...authHeaders,
     },
     body: JSON.stringify(payload),
     signal: controller.signal,
    });
    // The deadline stays armed across the body read: a server that stalls
    // mid-body is just as fatal as one that never answers.
    body = await readBoundedBody(response, opts?.maxResponseBytes ?? DEFAULT_MAX_RESPONSE_BYTES);
   } catch (error) {
    const kind: LinearResultKind = timedOut ? "timeout" : callerSignal?.aborted ? "aborted" : "network";
    const message =
     kind === "timeout"
      ? `request timed out after ${timeoutMs}ms`
      : kind === "aborted"
       ? "request aborted by caller after it was sent"
       : safeMessage(error instanceof Error ? error.message : String(error), secrets);
    return {
     ok: false,
     kind,
     // fetch() was called, so Linear may already have applied the request.
     outcome: "unknown",
     status: null,
     message,
     errors: null,
     retryAfterMs: null,
    };
   } finally {
    clearTimeout(timer);
    callerSignal?.removeEventListener("abort", onCallerAbort);
   }

   const status = response.status;
   if (body.tooLarge) {
    const limit = opts?.maxResponseBytes ?? DEFAULT_MAX_RESPONSE_BYTES;
    return {
     ok: false,
     kind: "too_large",
     outcome: "unknown",
     status,
     message: `response body exceeded ${limit} bytes and was discarded`,
     errors: null,
     retryAfterMs: null,
    };
   }

   const text = body.text;
   let parsed: unknown;
   let isJson = true;
   try {
    parsed = JSON.parse(text);
   } catch {
    isJson = false;
   }
   const errors = isJson ? readErrors(parsed, secrets) : null;

   if (status === 401 || status === 403) {
    if (status === 401) options.onAuthRejected?.(authHeaders);
    return {
     ok: false,
     kind: "auth",
     outcome: "rejected",
     status,
     message: firstMessage(errors, `authentication rejected with HTTP ${status}`),
     errors,
     retryAfterMs: null,
    };
   }
   if (status === 429) {
    return {
     ok: false,
     kind: "rate_limited",
     outcome: "rejected",
     status,
     message: firstMessage(errors, "rate limited"),
     errors,
     retryAfterMs: readRetryAfterMs(response.headers),
    };
   }
   if (status < 200 || status > 299) {
    // A 4xx is the server saying it refused; a 5xx (or anything stranger) may
    // have failed after the mutation was already applied.
    const decided = status >= 400 && status < 500;
    return {
     ok: false,
     kind: "http",
     outcome: decided ? "rejected" : "unknown",
     status,
     message: firstMessage(errors, `HTTP ${status}`),
     errors,
     retryAfterMs: null,
    };
   }
   if (!isJson) {
    return {
     ok: false,
     kind: "http",
     // A 2xx we cannot parse tells us nothing about what the server did.
     outcome: "unknown",
     status,
     message: `non-JSON response body (${text.length} bytes)`,
     errors: null,
     retryAfterMs: null,
    };
   }

   const data =
    typeof parsed === "object" && parsed !== null && "data" in parsed ? (parsed.data ?? null) : null;
   if (data === null) {
    return {
     ok: false,
     kind: "graphql",
     // A well-formed GraphQL error response is a refusal; a 2xx body with
     // neither data nor errors is malformed and therefore undecidable.
     outcome: errors && errors.length > 0 ? "rejected" : "unknown",
     status,
     message: firstMessage(errors, "GraphQL response contained neither data nor errors"),
     errors,
     retryAfterMs: null,
    };
   }
   return {
    ok: true,
    outcome: "completed",
    data,
    partialErrors: errors,
    rateLimit: {
     remaining: numericHeader(response.headers, "x-ratelimit-requests-remaining"),
     resetAt: numericHeader(response.headers, "x-ratelimit-requests-reset"),
    },
   };
  },
 };
}
