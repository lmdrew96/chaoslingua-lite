import { useState } from 'react';
import type { Account } from '../hooks/useAccount';

interface AccountPanelProps {
  account: Account | null;
  token: string | null;
  loading: boolean;
  busy: boolean;
  error: string | null;
  onCreate: (name: string) => void;
  onJoin: (token: string) => void;
  onSignOut: () => void;
}

export function AccountPanel({ account, token, loading, busy, error, onCreate, onJoin, onSignOut }: AccountPanelProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [copied, setCopied] = useState(false);

  const summary = loading ? 'Checking…' : account ? account.name : 'Not signed in';

  const copyKey = async () => {
    if (!token) return;
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Switching modes (or signing out) drops whatever was typed into the other field —
  // otherwise leftover text from an earlier attempt can get submitted by accident.
  const switchMode = (next: 'create' | 'join') => {
    setMode(next);
    setName('');
    setKeyInput('');
  };

  const handleSignOut = () => {
    onSignOut();
    setName('');
    setKeyInput('');
    setMode('create');
  };

  return (
    <div className="account-panel">
      <button type="button" className="pill pill-button" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        👤 {summary} {open ? '▴' : '▾'}
      </button>

      {open && (
        <div className="filter-panel">
          {account ? (
            <>
              <p className="filter-hint">Signed in as {account.name}.</p>
              <p className="filter-hint">
                This is your tutoring key — copy it into your MCP tutoring client so both surfaces share the same
                weak-area data.
              </p>
              <div className="footer-row">
                <button type="button" className="btn btn-ghost" onClick={copyKey}>
                  {copied ? 'Copied!' : 'Copy tutoring key'}
                </button>
                <button type="button" className="reset-link" onClick={handleSignOut}>
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="filter-hint">
                Signing in lets ChaosLingua track your weak spots across drilling and tutoring sessions. Optional —
                drilling works fine without it.
              </p>

              {mode === 'create' ? (
                <div className="text-input-row">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    disabled={busy}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && name.trim() && !busy) onCreate(name.trim());
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={busy || !name.trim()}
                    onClick={() => onCreate(name.trim())}
                  >
                    {busy ? 'Creating…' : 'Create account'}
                  </button>
                </div>
              ) : (
                <div className="text-input-row">
                  <input
                    type="text"
                    placeholder="Paste your tutoring key"
                    autoComplete="off"
                    spellCheck={false}
                    value={keyInput}
                    disabled={busy}
                    onChange={(e) => setKeyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && keyInput.trim() && !busy) onJoin(keyInput.trim());
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={busy || !keyInput.trim()}
                    onClick={() => onJoin(keyInput.trim())}
                  >
                    {busy ? 'Checking…' : 'Use this key'}
                  </button>
                </div>
              )}

              {error && <div className="filter-warning">{error}</div>}

              <button
                type="button"
                className="reset-link"
                onClick={() => switchMode(mode === 'create' ? 'join' : 'create')}
              >
                {mode === 'create' ? 'Already have a key? Use it instead' : 'Create a new account instead'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
