import { useConvex, useMutation, useQuery } from 'convex/react';
import { useEffect, useState } from 'react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { generateToken, sha256Hex } from '../lib/crypto';

const STORAGE_KEY = 'chaoslingua-lite:apiToken';

export interface Account {
  userId: Id<'users'>;
  name: string;
}

interface LoginAccount {
  email: string;
  token: string;
}

// POST to the email + password routes in api/auth.ts. Errors carry the server's
// message, which is written for the person reading it.
const authRequest = async (body: Record<string, unknown>): Promise<{ account: LoginAccount | null }> => {
  const res = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => null)) as { account?: LoginAccount | null; error?: string } | null;
  if (!res.ok) throw new Error(data?.error ?? "Couldn't reach the login server — try again.");
  return { account: data?.account ?? null };
};

// A password-reset link opens the app with ?reset=<token>.
const readResetToken = (): string | null => new URLSearchParams(window.location.search).get('reset');

const dropResetToken = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete('reset');
  window.history.replaceState(null, '', url);
};

export function useAccount() {
  // The tutoring key is still what identifies you to Convex and the MCP server; an
  // email login is a way to get it back on another device.
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [email, setEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // A confirmation to show in place of an error (e.g. "check your email").
  const [notice, setNotice] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(readResetToken);

  const convex = useConvex();
  const createUser = useMutation(api.users.createUser);
  const resolved = useQuery(api.users.resolveApiKey, token ? { token } : 'skip');

  const storeToken = (next: string | null) => {
    if (next) localStorage.setItem(STORAGE_KEY, next);
    else localStorage.removeItem(STORAGE_KEY);
    setToken(next);
  };

  // A live session restores the key on a browser that doesn't have it yet.
  useEffect(() => {
    authRequest({ action: 'me' })
      .then(({ account }) => {
        if (!account) return;
        setEmail(account.email);
        if (!localStorage.getItem(STORAGE_KEY)) storeToken(account.token);
      })
      .catch((err: unknown) => console.error('Checking the login session failed', err));
  }, []);

  // A stored token that no longer resolves (e.g. the account was removed) shouldn't
  // keep retrying forever — drop it so the sign-in view shows again.
  useEffect(() => {
    if (token && resolved === null) storeToken(null);
  }, [token, resolved]);

  const run = async (fallback: string, work: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await work();
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : fallback);
    } finally {
      setBusy(false);
    }
  };

  // New account: make the Convex user first (unless this browser already has a key,
  // in which case signing up adopts it and keeps its history), then attach the login.
  const signUp = (name: string, newEmail: string, password: string) =>
    run("Couldn't create that account — try again.", async () => {
      let key = token;
      if (!key) {
        key = generateToken();
        await createUser({ name, keyHash: await sha256Hex(key) });
        storeToken(key);
      }
      const { account } = await authRequest({ action: 'signup', email: newEmail, password, token: key });
      setEmail(account?.email ?? null);
    });

  const logIn = (loginEmail: string, password: string) =>
    run("Couldn't log in — try again.", async () => {
      const { account } = await authRequest({ action: 'login', email: loginEmail, password });
      if (!account) throw new Error("Couldn't log in — try again.");
      setEmail(account.email);
      storeToken(account.token);
    });

  // Always the same answer, whether or not the address has an account.
  const requestReset = (resetEmail: string) =>
    run("Couldn't send the reset link — try again.", async () => {
      await authRequest({ action: 'reset-request', email: resetEmail });
      setNotice('If that address has an account, a reset link is on its way. It works once, for 30 minutes.');
    });

  // Sets the new password and logs this browser in; every other session is ended.
  const confirmReset = (password: string) =>
    run("Couldn't reset the password — try again.", async () => {
      const { account } = await authRequest({ action: 'reset-confirm', resetToken, password });
      if (!account) throw new Error("Couldn't reset the password — try again.");
      setEmail(account.email);
      storeToken(account.token);
      setResetToken(null);
      dropResetToken();
      setNotice('Password changed. You’re logged in.');
    });

  const cancelReset = () => {
    setResetToken(null);
    dropResetToken();
  };

  const joinAccount = (candidateToken: string) =>
    run("Couldn't check that key — try again.", async () => {
      const result = await convex.query(api.users.resolveApiKey, { token: candidateToken });
      if (!result) throw new Error("That key doesn't match an account.");
      storeToken(candidateToken);
    });

  // Ends the session too. A key with a login is recoverable by logging back in; a
  // key-only account is gone from this browser unless it was copied somewhere.
  const signOut = () =>
    run("Couldn't sign out — try again.", async () => {
      if (email) await authRequest({ action: 'logout' });
      setEmail(null);
      storeToken(null);
    });

  const account: Account | null = resolved ? { userId: resolved.userId, name: resolved.name } : null;
  const loading = token !== null && resolved === undefined;

  return {
    account,
    email,
    token,
    loading,
    busy,
    error,
    notice,
    resetToken,
    signUp,
    logIn,
    joinAccount,
    signOut,
    requestReset,
    confirmReset,
    cancelReset,
  };
}
