"use client";

import { useActionState } from "react";
import { Notice } from "@/components/notice";
import type { ActionState } from "@/lib/types";

/** Works for partner (id field) and guest (cookie) cancellation actions. */
export function CancelButton({
  cancel,
  id,
}: {
  cancel: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  id?: number;
}) {
  const [state, action, pending] = useActionState(cancel, undefined);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Cancel this reservation? This can't be undone online.")) e.preventDefault();
      }}
      className="space-y-3"
    >
      {id !== undefined && <input type="hidden" name="id" value={id} />}
      {state?.error && <Notice tone="error">{state.error}</Notice>}
      {state?.success && <Notice tone="success">{state.success}</Notice>}
      <button
        type="submit"
        disabled={pending}
        className="btn-outline border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
      >
        {pending ? "Cancelling…" : "Cancel reservation"}
      </button>
    </form>
  );
}
