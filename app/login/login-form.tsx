"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions";
import { Notice } from "@/components/notice";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <form action={action} className="card space-y-5 p-8">
      <input type="hidden" name="next" value={next} />
      {state?.error && <Notice tone="error">{state.error}</Notice>}
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state?.fields?.email}
          className="input"
        />
      </div>
      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="input"
        />
      </div>
      <button type="submit" disabled={pending} className="btn w-full">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
