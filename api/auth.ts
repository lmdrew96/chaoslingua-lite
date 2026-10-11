import { Redis } from '@upstash/redis';

/**
 * Email + password accounts, ported from Kindling (lib/auth.ts + app/api/auth).
 *
 * An account is a convenience wrapper that remembers which tutoring key is yours —
 * not a second access layer. The key is still the credential: Convex resolves it,
 * the MCP server takes it as its bearer token, and pasting it still works with no
 * account at all. Logging in just hands this browser the key back.
 *
 * No third-party auth provider: PBKDF2 via Web Crypto, and opaque session ids in
 * Upstash Redis behind an HttpOnly cookie. One file because Vercel compiles each
 * api/ file on its own and cross-file TypeScript imports there are fragile.
 */

const redis = Redis.fromEnv();

// ─── Key space ───────────────────────────────────────────────────────────────

// A tutoring key only exists in one Convex deployment, so logins are kept per
// deployment: local dev (dev Convex) and the live site share this Redis but never
// see each other's accounts.
const DEPLOYMENT = process.env.VITE_CONVEX_URL?.match(/^https:\/\/([^.]+)\./)?.[1] ?? 'unknown';
const ns = `cll:${DEPLOYMENT}`;

const accountKey = (email: string) => `${ns}:account:${email}`;
const sessionKey = (sid: string) => `${ns}:session:${sid}`;
const ownerKey = (token: string) => `${ns}:tokenowner:${token}`;
const rateKey = (scope: string, id: string) => `${ns}:rl:${scope}:${id}`;

const SESSION_COOKIE = 'cll_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

// ─── Types ───────────────────────────────────────────────────────────────────

interface Account {
  email: string;
  passwordHash: string; // base64
  salt: string; // base64
  iterations: number;
  hash: string; // e.g. "SHA-256"
  // The tutoring key (Convex users.keyHash is its SHA-256).
  token: string;
  createdAt: string;
}

type PublicAccount = Pick<Account, 'email' | 'token' | 'createdAt'>;

// The hash and salt must never leave the server, so every response goes through this.
const publicAccount = (a: Account): PublicAccount => ({ email: a.email, token: a.token, createdAt: a.createdAt });

// ─── Password hashing ────────────────────────────────────────────────────────

const PBKDF2_ITERATIONS = 600_000;
const PBKDF2_HASH = 'SHA-256';
const SALT_BYTES = 16;
const KEY_BYTES = 32;

const MIN_PASSWORD_LENGTH = 10;

const toB64 = (buf: ArrayBuffer | Uint8Array): string => Buffer.from(new Uint8Array(buf)).toString('base64');
const fromB64 = (s: string): Uint8Array => new Uint8Array(Buffer.from(s, 'base64'));

const derive = async (password: string, salt: Uint8Array, iterations: number, hash: string): Promise<ArrayBuffer> => {
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as unknown as BufferSource, iterations, hash },
    keyMaterial,
    KEY_BYTES * 8,
  );
};

const hashPassword = async (password: string): Promise<Pick<Account, 'passwordHash' | 'salt' | 'iterations' | 'hash'>> => {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const bits = await derive(password, salt, PBKDF2_ITERATIONS, PBKDF2_HASH);
  return { passwordHash: toB64(bits), salt: toB64(salt), iterations: PBKDF2_ITERATIONS, hash: PBKDF2_HASH };
};

// Length-independent compare, so a wrong password can't be timed out character by character.
const timingSafeEqual = (a: Uint8Array, b: Uint8Array): boolean => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
};

const verifyPassword = async (account: Account, password: string): Promise<boolean> => {
  // Read off the record rather than the constant, so raising the cost later doesn't
  // lock out everyone who signed up before.
  const bits = await derive(password, fromB64(account.salt), account.iterations ?? PBKDF2_ITERATIONS, account.hash ?? PBKDF2_HASH);
  return timingSafeEqual(new Uint8Array(bits), fromB64(account.passwordHash));
};

// ─── Accounts ────────────────────────────────────────────────────────────────

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const getAccount = async (email: string): Promise<Account | null> => (await redis.get<Account>(accountKey(email))) ?? null;

const putAccount = async (account: Account): Promise<void> => {
  await redis.set(accountKey(account.email), account);
};

const getTokenOwner = async (token: string): Promise<string | null> => (await redis.get<string>(ownerKey(token))) ?? null;

const claimToken = async (token: string, email: string): Promise<void> => {
  await redis.set(ownerKey(token), email);
};

// Tutoring keys come in two shapes: the app's crypto.randomUUID() (src/lib/crypto.ts)
// and the MCP's create-user script, `cll_` + 64 hex. Kept exactly as given — Convex
// matches on the SHA-256 of the exact string.
const TOKEN_RE = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|cll_[0-9a-f]{64})$/;
const parseToken = (raw: unknown): string | null => {
  const t = String(raw ?? '').trim();
  return TOKEN_RE.test(t) ? t : null;
};

// ─── Sessions ────────────────────────────────────────────────────────────────

const randomB64Url = (bytes: number): string => Buffer.from(crypto.getRandomValues(new Uint8Array(bytes))).toString('base64url');

const createSession = async (email: string): Promise<string> => {
  const sid = randomB64Url(32);
  await redis.set(sessionKey(sid), email, { ex: SESSION_TTL_SECONDS });
  return sid;
};

const readSession = async (sid: string | undefined): Promise<string | null> => {
  if (!sid) return null;
  return (await redis.get<string>(sessionKey(sid))) ?? null;
};

const destroySession = async (sid: string | undefined): Promise<void> => {
  if (sid) await redis.del(sessionKey(sid));
};

const sessionCookie = (sid: string): string =>
  `${SESSION_COOKIE}=${sid}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_SECONDS}`;

const clearedCookie = (): string => `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;

const readCookie = (req: Request, name: string): string | undefined => {
  const header = req.headers.get('cookie');
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return undefined;
};

const requireAccount = async (req: Request): Promise<Account | null> => {
  const email = await readSession(readCookie(req, SESSION_COOKIE));
  if (!email) return null;
  return getAccount(email);
};

// ─── Rate limiting ───────────────────────────────────────────────────────────

// Hashed so a raw IP or email never becomes a Redis key name.
const rateId = async (id: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(id));
  return Buffer.from(new Uint8Array(digest)).toString('hex').slice(0, 32);
};

const clientIp = (req: Request): string =>
  req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';

// Fails OPEN: a Redis blip shouldn't lock everyone out of logging in.
const isRateLimited = async (scope: string, id: string, max: number, windowSeconds: number): Promise<boolean> => {
  try {
    const k = rateKey(scope, await rateId(id));
    const n = await redis.incr(k);
    if (n === 1) {
      await redis.expire(k, windowSeconds);
    } else if ((await redis.ttl(k)) < 0) {
      // INCR created the key but the EXPIRE never landed. Without this repair the
      // counter never resets and the caller is locked out permanently.
      await redis.expire(k, windowSeconds);
    }
    return n > max;
  } catch (err) {
    console.error('rate limit check failed (allowing request)', err);
    return false;
  }
};

const clearRateLimit = async (scope: string, id: string): Promise<void> => {
  try {
    await redis.del(rateKey(scope, await rateId(id)));
  } catch (err) {
    console.error('rate limit reset failed', err);
  }
};

// ─── Route ───────────────────────────────────────────────────────────────────

const json = (body: unknown, init?: ResponseInit) => Response.json(body, init);
const fail = (error: string, status = 400) => Response.json({ error }, { status });

// Identical for "no such email" and "wrong password" — otherwise this endpoint
// enumerates which addresses have accounts.
const BAD_CREDENTIALS = 'Email or password is incorrect.';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const handle = async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return fail('Method not allowed.', 405);

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return fail('Malformed request.');
  }

  const action = String(body.action ?? '');

  // ── Session reads, no credentials involved ──────────────────────────────────

  if (action === 'me') {
    const account = await requireAccount(req);
    return json({ account: account ? publicAccount(account) : null });
  }

  if (action === 'logout') {
    await destroySession(readCookie(req, SESSION_COOKIE));
    return json({ account: null }, { headers: { 'Set-Cookie': clearedCookie() } });
  }

  // ── Credentialed actions ────────────────────────────────────────────────────

  const email = normalizeEmail(String(body.email ?? ''));
  const password = String(body.password ?? '');
  const ip = clientIp(req);

  if (!EMAIL_RE.test(email)) return fail('Enter a valid email address.');

  if (action === 'signup') {
    if (password.length < MIN_PASSWORD_LENGTH) return fail(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    // The browser creates (or already has) the Convex user, then signs up with its
    // key — so signing up adopts the history already logged under that key.
    const token = parseToken(body.token);
    if (!token) return fail("That tutoring key isn't one this app recognizes.");
    if (await isRateLimited('signup', ip, 5, 900)) return fail('Too many sign-ups from here. Try again in a few minutes.', 429);
    // Signup deliberately DOES reveal that an address is taken, unlike login: the
    // alternative is someone who can't tell why their account won't create.
    if (await getAccount(email)) return fail('An account with that email already exists. Log in instead.', 409);
    const owner = await getTokenOwner(token);
    if (owner && owner !== email) return fail('This tutoring key already belongs to an account. Log in instead.', 409);

    const account: Account = { email, ...(await hashPassword(password)), token, createdAt: new Date().toISOString() };
    await claimToken(token, email);
    await putAccount(account);

    const sid = await createSession(email);
    return json({ account: publicAccount(account) }, { headers: { 'Set-Cookie': sessionCookie(sid) } });
  }

  if (action === 'login') {
    // Two windows: a wide one per IP, a tighter one per address, so one account
    // can't be ground down from many IPs.
    if (await isRateLimited('login-ip', ip, 20, 900)) return fail('Too many attempts. Try again in a few minutes.', 429);
    if (await isRateLimited('login-email', email, 8, 900)) {
      return fail('Too many attempts for that account. Try again in a few minutes.', 429);
    }

    const account = await getAccount(email);
    if (!account || !(await verifyPassword(account, password))) return fail(BAD_CREDENTIALS, 401);

    await clearRateLimit('login-email', email);

    const sid = await createSession(email);
    return json({ account: publicAccount(account) }, { headers: { 'Set-Cookie': sessionCookie(sid) } });
  }

  return fail('Unknown action.');
};

export default {
  async fetch(req: Request): Promise<Response> {
    try {
      return await handle(req);
    } catch (err) {
      console.error('auth request failed', err);
      return fail('Something went wrong on our end. Try again.', 500);
    }
  },
};
