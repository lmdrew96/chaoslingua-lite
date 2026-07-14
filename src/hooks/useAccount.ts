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

export function useAccount() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convex = useConvex();
  const createUser = useMutation(api.users.createUser);
  const resolved = useQuery(api.users.resolveApiKey, token ? { token } : 'skip');

  // A stored token that no longer resolves (e.g. the account was removed) shouldn't
  // keep retrying forever — drop it so the sign-in view shows again.
  useEffect(() => {
    if (token && resolved === null) {
      localStorage.removeItem(STORAGE_KEY);
      setToken(null);
    }
  }, [token, resolved]);

  const createAccount = async (name: string) => {
    setBusy(true);
    setError(null);
    try {
      const newToken = generateToken();
      const keyHash = await sha256Hex(newToken);
      await createUser({ name, keyHash });
      localStorage.setItem(STORAGE_KEY, newToken);
      setToken(newToken);
    } catch {
      setError("Couldn't create that account — try again.");
    } finally {
      setBusy(false);
    }
  };

  const joinAccount = async (candidateToken: string) => {
    setBusy(true);
    setError(null);
    try {
      const result = await convex.query(api.users.resolveApiKey, { token: candidateToken });
      if (!result) {
        setError("That key doesn't match an account.");
        return;
      }
      localStorage.setItem(STORAGE_KEY, candidateToken);
      setToken(candidateToken);
    } catch {
      setError("Couldn't check that key — try again.");
    } finally {
      setBusy(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setError(null);
  };

  const account: Account | null = resolved ? { userId: resolved.userId, name: resolved.name } : null;
  const loading = token !== null && resolved === undefined;

  return { account, token, loading, busy, error, createAccount, joinAccount, signOut };
}
