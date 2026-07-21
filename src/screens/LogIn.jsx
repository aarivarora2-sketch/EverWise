import { useState } from "react";
import Field from "../components/Field";
import BackButton from "../components/BackButton";

export default function LogIn({ onLogIn, onGoToSignUp, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // No real auth yet — just check the fields aren't empty, then continue.
  const submit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    onLogIn();
  };

  return (
    <div className="flex flex-1 flex-col px-7 pb-10 pt-6">
      <BackButton onClick={onBack} />

      <form className="flex flex-1 flex-col" onSubmit={submit} noValidate>
        <h1 className="mt-6 font-serif text-5xl font-semibold leading-tight text-ink">
          Welcome
          <br />
          back.
        </h1>

        <div className="mt-10 space-y-6">
          <Field
            id="login-email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            placeholder="jane@example.com"
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
          <button type="submit" className="btn-primary">
            Log In
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
