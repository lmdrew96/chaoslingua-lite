import { useState } from 'react';
import type { Account } from '../hooks/useAccount';

interface AccountPanelProps {
  account: Account | null;
  email: string | null;
  token: string | null;
  loading: boolean;
  busy: boolean;
  error: string | null;
  onSignUp: (name: string, email: string, password: string) => void;
  onLogIn: (email: string, password: string) => void;
  onJoin: (token: string) => void;
  onSignOut: () => void;
}

type Mode = 'login' | 'create' | 'key';

const MIN_PASSWORD_LENGTH = 10;

export function AccountPanel({ account, email, token, loading, busy, error, onSignUp, onLogIn, onJoin, onSignOut }: AccountPanelProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [copied, setCopied] = useState(false);

  const summary = loading ? 'Checking…' : account ? account.name : 'Not signed in';

  const copyKey = async () => {
    if (!token) return;
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Switching modes (or signing out) drops whatever was typed — otherwise leftover
  // text from an earlier attempt can get submitted by accident.
  const clear = () => {
    setName('');
    setEmailInput('');
    setPassword('');
    setKeyInput('');
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    clear();
  };

  const handleSignOut = () => {
    onSignOut();
    clear();
    setMode('login');
  };

  // Signed in with a key but no login yet: the key already exists, so no name needed.
  const addingLogin = account !== null && email === null;
  const needsName = mode === 'create' && !addingLogin;
  const passwordOk = mode === 'login' ? password.length > 0 : password.length >= MIN_PASSWORD_LENGTH;
  const canSubmit = !busy && emailInput.trim() !== '' && passwordOk && (!needsName || name.trim() !== '');

  const submit = () => {
    if (!canSubmit) return;
    if (mode === 'login') onLogIn(emailInput.trim(), password);
    else onSignUp(name.trim(), emailInput.trim(), password);
  };

  const credentialFields = (
    <form
      className="login-form"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {needsName && (
        <input type="text" placeholder="Your name" autoComplete="name" value={name} disabled={busy} onChange={(e) => setName(e.target.value)} />
      )}
      <input
        type="email"
        placeholder="Email"
        autoComplete="email"
        value={emailInput}
        disabled={busy}
        onChange={(e) => setEmailInput(e.target.value)}
      />
      <input
        type="password"
        placeholder={mode === 'login' ? 'Password' : `Password (${MIN_PASSWORD_LENGTH}+ characters)`}
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        value={password}
        disabled={busy}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
        {busy ? 'Working…' : mode === 'login' ? 'Log in' : addingLogin ? 'Add login' : 'Create account'}
      </button>
    </form>
  );

  return (
    <div className="account-panel">
      <button type="button" className="pill pill-button" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        👤 {summary} {open ? '▴' : '▾'}
      </button>

      {open && (
        <div className="filter-panel">
          {account ? (
            <>
              <p className="filter-hint">
                Signed in as {account.name}
                {email ? ` (${email})` : ''}.
              </p>
              <p className="filter-hint">
                This is your tutoring key — copy it into your MCP tutoring client so both surfaces share the same
                weak-area data.
              </p>

              {addingLogin && (
                <>
                  <p className="filter-hint">
                    Add an email and password to log in on other devices without copying your key. Your history stays.
                  </p>
                  {credentialFields}
                  {error && <div className="filter-warning">{error}</div>}
                </>
              )}

              <div className="footer-row">
                <button type="button" className="btn btn-ghost" onClick={copyKey}>
                  {copied ? 'Copied!' : 'Copy tutoring key'}
                </button>
                <button type="button" className="reset-link" disabled={busy} onClick={handleSignOut}>
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

              {mode === 'key' ? (
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
              ) : (
                credentialFields
              )}

              {error && <div className="filter-warning">{error}</div>}

              <div className="footer-row">
                {mode !== 'login' && (
                  <button type="button" className="reset-link" onClick={() => switchMode('login')}>
                    Log in instead
                  </button>
                )}
                {mode !== 'create' && (
                  <button type="button" className="reset-link" onClick={() => switchMode('create')}>
                    Create an account
                  </button>
                )}
                {mode !== 'key' && (
                  <button type="button" className="reset-link" onClick={() => switchMode('key')}>
                    Use a tutoring key
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
