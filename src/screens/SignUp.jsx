import { useState } from "react";
import Field from "../components/Field";
import BackButton from "../components/BackButton";
import { authErrorMessage } from "../utils/authErrors";

export default function SignUp({ onSignUp, onGoToLogIn, onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all three fields to continue.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await onSignUp(name.trim(), email.trim(), password);
    } catch (err) {
      setError(authErrorMessage(err));
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col px-7 pb-10 pt-6">
      <BackButton onClick={onBack} />

      <form className="flex flex-1 flex-col" onSubmit={submit} noValidate>
        <h1 className="mt-6 font-serif text-5xl font-semibold leading-tight text-ink">
          Create your
          <br />
          account
        </h1>

        <div className="mt-10 space-y-6">
          <Field
            id="name"
            label="Your name"
            value={name}
            onChange={setName}
            autoComplete="name"
            placeholder="Jane Miller"
          />
          <Field
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            placeholder="jane@example.com"
          />
          <Field
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            placeholder="Choose a password"
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
            {busy ? "Creating account…" : "Create account"}
          </button>
          <p className="mt-6 text-center text-lg text-ink-soft">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onGoToLogIn}
              className="font-bold text-clay underline underline-offset-4"
            >
              Log in
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
