"use client";

import { useActionState } from "react";
import { findGuestBookingAction } from "@/app/actions";
import { Notice } from "@/components/notice";

export function FindBookingForm() {
  const [state, action, pending] = useActionState(findGuestBookingAction, undefined);

  return (
    <form action={action} className="card space-y-5 p-6 sm:p-8">
      <div>
        <label htmlFor="reference" className="label">
          Booking reference
        </label>
        <input
          id="reference"
          name="reference"
          required
          placeholder="RK-XXXXXXXXXX"
          autoComplete="off"
          defaultValue={state?.fields?.reference}
          className="input font-mono uppercase placeholder:normal-case"
        />
      </div>
      <div>
        <label htmlFor="email" className="label">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state?.fields?.email}
          className="input"
        />
      </div>
      {state?.error && <Notice tone="error">{state.error}</Notice>}
      <button type="submit" disabled={pending} className="btn w-full">
        {pending ? "Searching…" : "Find booking"}
      </button>
    </form>
  );
}
