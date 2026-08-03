import { useState } from "react";
import Field from "../components/Field";
import BackButton from "../components/BackButton";
import { authErrorMessage } from "../utils/authErrors";

export default function LogIn({ onLogIn, onGoToSignUp, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter your username and password.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await onLogIn(username.trim(), password);
    } catch (err) {
      setError(authErrorMessage(err));
      setBusy(false);
    }
  };

  return (
    <div className="onboarding-focus auth-focus flex flex-1 flex-col overflow-y-auto px-7 pb-10 pt-6">
      <BackButton onClick={onBack} />

      <form className="flex flex-1 flex-col" onSubmit={submit} noValidate>
        <h1 className="page-title mt-6">
          Welcome
          <br />
          back.
        </h1>

        <div className="mt-10 space-y-6">
          <Field
            id="login-username"
            label="Username"
            value={username}
            onChange={setUsername}
            autoComplete="username"
            placeholder="janemiller"
          />
          <Field
            id="login-password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            placeholder="Your password"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-2xl bg-alert/12 px-5 py-4 text-lg font-semibold text-alert"
          >
            {error}
          </p>
        )}

        <div className="mt-auto pt-10">
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? "Logging in…" : "Log In"}
          </button>
          <p className="mt-6 text-center text-lg text-ink-soft">
            New here?{" "}
            <button
              type="button"
              onClick={onGoToSignUp}
              className="font-bold text-clay underline underline-offset-4"
            >
              Sign up
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
