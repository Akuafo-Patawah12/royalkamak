"use client";

import { useActionState } from "react";
import { Notice } from "@/components/notice";
import type { ActionState } from "@/lib/types";

/** Sends the visitor to Paystack's checkout. Works for partner (id field) and guest (cookie) actions. */
export function PayButton({
  pay,
  id,
  amount,
}: {
  pay: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  id?: number;
  /** Formatted total, e.g. "GHS 1,040.00". */
  amount: string;
}) {
  const [state, action, pending] = useActionState(pay, undefined);

  return (
    <form action={action} className="space-y-3">
      {id !== undefined && <input type="hidden" name="id" value={id} />}
      {state?.error && <Notice tone="error">{state.error}</Notice>}
      <button type="submit" disabled={pending} className="btn">
        {pending ? "Opening secure payment…" : `Pay ${amount} now`}
      </button>
      <p className="text-xs text-muted">Card or Mobile Money, processed securely by Paystack.</p>
    </form>
  );
}
