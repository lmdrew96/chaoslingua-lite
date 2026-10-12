import { useState } from 'react';
import type { Account } from '../hooks/useAccount';

interface AccountPanelProps {
  account: Account | null;
  email: string | null;
  token: string | null;
  loading: boolean;
  busy: boolean;
  error: string | null;
  notice: string | null;
  // Set when the page was opened from a password-reset email.
  resetToken: string | null;
  onSignUp: (name: string, email: string, password: string) => void;
  onLogIn: (email: string, password: string) => void;
  onJoin: (token: string) => void;
  onSignOut: () => void;
  onRequestReset: (email: string) => void;
  onConfirmReset: (password: string) => void;
  onCancelReset: () => void;
}

type Mode = 'login' | 'create' | 'key' | 'forgot';

const MIN_PASSWORD_LENGTH = 10;

// The tutoring MCP server (chaoslingua-lite-mcp) takes the key in its path, so this
// one URL is everything a claude.ai custom connector needs.
const MCP_BASE_URL = 'https://chaoslingua-lite-mcp.lmdrew.workers.dev';

export function AccountPanel({
  account,
  email,
  token,
  loading,
  busy,
  error,
  notice,
  resetToken,
  onSignUp,
  onLogIn,
  onJoin,
  onSignOut,
  onRequestReset,
  onConfirmReset,
  onCancelReset,
}: AccountPanelProps) {
  // A reset link opens straight to the new-password form.
  const [open, setOpen] = useState(resetToken !== null);
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [copied, setCopied] = useState(false);

  const summary = loading ? 'Checking…' : account ? account.name : 'Not signed in';

  const copyUrl = async () => {
    if (!token) return;
    await navigator.clipboard.writeText(`${MCP_BASE_URL}/${encodeURIComponent(token)}/mcp`);
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

  const messages = (
    <>
      {error && <div className="filter-warning">{error}</div>}
      {notice && <p className="filter-hint">{notice}</p>}
    </>
  );

  const resetForm = (
    <>
      <p className="filter-hint">Choose a new password. Every other device logged in to this account will be logged out.</p>
      <form
        className="login-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!busy && password.length >= MIN_PASSWORD_LENGTH) onConfirmReset(password);
        }}
      >
        <input
          type="password"
          placeholder={`New password (${MIN_PASSWORD_LENGTH}+ characters)`}
          autoComplete="new-password"
          value={password}
          disabled={busy}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={busy || password.length < MIN_PASSWORD_LENGTH}>
          {busy ? 'Working…' : 'Set new password'}
        </button>
      </form>
      {messages}
      <div className="footer-row">
        <button
          type="button"
          className="reset-link"
          onClick={() => {
            onCancelReset();
            clear();
          }}
        >
          Cancel
        </button>
      </div>
    </>
  );

  const forgotForm = (
    <form
      className="login-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!busy && emailInput.trim()) onRequestReset(emailInput.trim());
      }}
    >
      <input
        type="email"
        placeholder="Your account's email"
        autoComplete="email"
        value={emailInput}
        disabled={busy}
        onChange={(e) => setEmailInput(e.target.value)}
      />
      <button type="submit" className="btn btn-primary" disabled={busy || !emailInput.trim()}>
        {busy ? 'Sending…' : 'Send reset link'}
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
          {resetToken ? (
            resetForm
          ) : account ? (
            <>
              <p className="filter-hint">
                Signed in as {account.name}
                {email ? ` (${email})` : ''}.
              </p>
              <p className="filter-hint">
                To tutor with Claude, copy your tutoring URL and add it in claude.ai under Settings → Connectors → Add
                custom connector. Drills and tutoring then share the same weak-area data. The URL contains your key, so
                keep it private.
              </p>

              {addingLogin && (
                <>
                  <p className="filter-hint">
                    Add an email and password to log in on other devices without copying your key. Your history stays.
                  </p>
                  {credentialFields}
                </>
              )}
              {messages}

              <div className="footer-row">
                <button type="button" className="btn btn-ghost" onClick={copyUrl}>
                  {copied ? 'Copied!' : 'Copy tutoring URL'}
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
              ) : mode === 'forgot' ? (
                forgotForm
              ) : (
                credentialFields
              )}

              {messages}

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
                {mode === 'login' && (
                  <button type="button" className="reset-link" onClick={() => switchMode('forgot')}>
                    Forgot password?
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
